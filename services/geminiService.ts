import { GoogleGenAI, Type } from "@google/genai";
import type { Article } from '../types';

const articleSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING },
        summary: { type: Type.STRING },
        url: { type: Type.STRING },
        source: { type: Type.STRING }
    },
    required: ['title', 'summary', 'url', 'source']
};

const newsSchema = {
    type: Type.ARRAY,
    items: articleSchema
};

interface FetchNewsParams {
    sources: string[];
    regions: string[];
    query?: string;
    trending?: boolean;
    deepDiveArticle?: Article;
}

interface ApiCallOptions {
    apiKey: string;
}

export const fetchAINews = async (params: FetchNewsParams & ApiCallOptions): Promise<Article[]> => {
    const { sources, regions, query = '', trending = false, deepDiveArticle, apiKey } = params;
    
    if (!apiKey) {
        throw new Error("APIキーが設定されていません。");
    }
    const ai = new GoogleGenAI({ apiKey });

    try {
        const sourceList = (!sources.length || sources.includes('All Sources'))
            ? '有名な技術系ニュースサイト、影響力のあるブログ、X (旧Twitter)、YouTube、Note、Qiita、Zenn、HackerNews、dev.to、CodeZine、PublicKey、gihyo.jp、ZDNet Japan、TechCrunch Japan、ITmedia NEWS AI+、@IT、MONOist、ITmedia Enterprise'
            : sources.join(', ');

        const regionInstruction = (!regions || regions.length === 0 || regions.includes('All Languages/Regions'))
            ? ''
            : ` 特に、以下の言語/地域で発信された、または主に対象としているコンテンツに焦点を当ててください: ${regions.join(', ')}.`;

        const popularitySources = ['Note', 'YouTube', 'Qiita', 'Zenn'];
        const applyPopularityFocus = sources.includes('All Sources') || sources.some(s => popularitySources.includes(s));
        
        const popularityInstruction = applyPopularityFocus 
            ? `\n\n**人気度に基づくランキングの義務:** YouTube、Note、Qiita、Zennなどのソースを検索する際は、目に見える人気指標に基づいてコンテンツを優先しなければなりません。高い閲覧数、いいね/お気に入り/ブックマーク数を持つ記事、投稿、動画や、公式のランキングリスト（例：日次/週次トレンド）で紹介されているものを積極的に探してください。そのような項目の'summary'には、なぜそれが選ばれたのかを簡潔に記述してください（例：「Zennで1万いいねを獲得しトレンド入り...」）。` 
            : '';

        const commonPromptInstructions = `
            あなたは、高度なAIニュースアグリゲーターです。あなたの絶対的な最優先目標は、最新の知識に基づいて、有効で一般にアクセス可能なURLを持つ記事のリストを返すことです。${popularityInstruction}

            **重要ルール:**
            1.  **アクセシビリティ**: URLは、一般に直接アクセス可能なコンテンツに繋がる必要があります。厳格なペイウォールやログインが必要なページのリンクは含めないでください。
            2.  **有効性**: あなたの知識の範囲で、URLが有効なウェブページのものであることを確認してください。リンク切れの可能性があるURLは避けてください。

            **出力フォーマット：**
            - あなたのレスポンスは、指定されたスキーマに準拠した、単一の有効なJSONオブジェクトの配列でなければなりません。
            - 各オブジェクトには、"title"、"summary"、"url"、"source" というキーが含まれている必要があります。
        `;
        
        let prompt;

        if (deepDiveArticle) {
            prompt = `
                あなたは専門のAIリサーチアシスタントです。ユーザーが特定の記事について「深掘り」して、さらに多くの情報を見つけたいと考えています。

                **元の記事:**
                **タイトル:** "${deepDiveArticle.title}"
                **概要:** "${deepDiveArticle.summary}"

                **ユーザーの具体的な調査リクエスト:** "${query}"

                あなたのタスクは、元の記事の文脈でユーザーのリクエストに直接答える、最も関連性の高い5つの詳細な記事、技術ブログ投稿、または研究論文を見つけることです。結果はユーザーが求めているものに非常に関連性が高い必要があります。

                以下のソースをスキャンしてください: ${sourceList}.${regionInstruction}
                ${commonPromptInstructions}
            `;
        } else if (trending) {
            prompt = `
                あなたは専門のAIニュースウォッチャーです。あなたのタスクは、過去24時間で人工知能に関連する最もトレンドで、話題になり、広く議論されているトピックやニュースを5つ特定することです。現在コミュニティで何が話題になっているかに焦点を当ててください。
                以下のソースをスキャンしてください: ${sourceList}.${regionInstruction}
                ${commonPromptInstructions}
            `;
        } else if (query) {
            prompt = `
                あなたは専門のAIニュースアグリゲーターです。あなたのタスクは、過去24時間で人工知能とキーワード「${query}」に関連する最も重要なニュース、記事、コンテンツを5つ見つけることです。
                以下のソースをスキャンしてください: ${sourceList}.${regionInstruction}
                ${commonPromptInstructions}
            `;
        } else { // Default case: latest news
            prompt = `
                あなたは専門のAIニュースアグリゲーターです。あなたのタスクは、過去24時間で人工知能に関連する最も重要で話題のニュース、記事、コンテンツを5つ見つけることです。
                以下のソースをスキャンしてください: ${sourceList}.${regionInstruction}
                ${commonPromptInstructions}
            `;
        }

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: newsSchema,
            },
        });
        
        const parsedJson = JSON.parse(response.text);
        
        if (!Array.isArray(parsedJson)) {
            throw new Error("APIが有効な記事の配列を返しませんでした。");
        }

        const uniqueArticles = parsedJson.reduce((acc: Article[], current: any) => {
            if (current && typeof current === 'object' && current.url && typeof current.url === 'string' &&
                typeof current.title === 'string' && typeof current.summary === 'string' && typeof current.source === 'string' &&
                !acc.find(item => item.url === current.url))
            {
                acc.push(current as Article);
            }
            return acc;
        }, []);

        return uniqueArticles;

    } catch (error) {
        console.error("GeminiからのAIニュース取得中にエラーが発生しました:", error);
        throw new Error("AIからのニュース取得に失敗しました。APIキーが正しいか確認するか、モデルが利用できない可能性があります。");
    }
};


export const translateArticlesToJapanese = async (articles: Article[], options: ApiCallOptions): Promise<Article[]> => {
    const { apiKey } = options;
    if (articles.length === 0) {
        return [];
    }
    if (!apiKey) {
        throw new Error("APIキーが設定されていません。");
    }
    const ai = new GoogleGenAI({ apiKey });
    
    try {
         const prompt = `
            以下のJSON配列に含まれる各記事オブジェクトの'title'と'summary'フィールドを、自然な日本語に翻訳してください。
            'url'と'source'フィールドは翻訳しないでください。
            翻訳を適用したオブジェクトの配列全体を、元のJSON構造とフィールド名を完全に維持した形で返してください。

            翻訳対象のJSONデータ:
            ${JSON.stringify(articles, null, 2)}
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: newsSchema,
            },
        });
        
        const jsonText = response.text.trim();
        const parsedJson = JSON.parse(jsonText);

        if (!Array.isArray(parsedJson)) {
            throw new Error("翻訳APIが有効な配列を返しませんでした。");
        }
        
        return parsedJson as Article[];

    } catch (error) {
        console.error("Geminiでの記事翻訳中にエラーが発生しました:", error);
        throw new Error("記事の翻訳に失敗しました。AIモデルが利用できないか、レスポンス形式が不正です。");
    }
};