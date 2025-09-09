

import React, { useState, useMemo } from 'react';
import type { Article } from '../types';

interface NewsCardProps {
    article: Article;
    isFavorite: boolean;
    onToggleFavorite: (article: Article) => void;
    onDeepDive: (article: Article) => void;
}

const SourceChip: React.FC<{ source: string }> = ({ source }) => {
    let bgColor = 'bg-gray-600';
    let textColor = 'text-gray-100';
    
    const lowerSource = source.toLowerCase();

    if (lowerSource.includes('youtube')) {
        bgColor = 'bg-red-600';
    } else if (lowerSource.includes('x') || lowerSource.includes('twitter')) {
        bgColor = 'bg-sky-500';
    } else if (lowerSource.includes('techcrunch')) {
        bgColor = 'bg-green-500';
    } else if (lowerSource.includes('verge')) {
        bgColor = 'bg-pink-500';
    } else if (lowerSource.includes('qiita')) {
        bgColor = 'bg-lime-500';
    } else if (lowerSource.includes('zenn')) {
        bgColor = 'bg-blue-500';
    }


    return (
        <span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full ${bgColor} ${textColor}`}>
            {source}
        </span>
    );
};


export const NewsCard: React.FC<NewsCardProps> = ({ article, isFavorite, onToggleFavorite, onDeepDive }) => {
    const [isCopied, setIsCopied] = useState(false);

    const canShare = useMemo(() => {
        return typeof navigator !== 'undefined' && typeof navigator.share === 'function';
    }, []);

    const handleCopy = () => {
        const textToCopy = `タイトル: ${article.title}\n\n概要: ${article.summary}\n\nURL: ${article.url}`;
        navigator.clipboard.writeText(textToCopy).then(() => {
            setIsCopied(true);
            setTimeout(() => {
                setIsCopied(false);
            }, 2000);
        }).catch(err => {
            console.error('記事詳細のコピーに失敗しました:', err);
        });
    };

    const handleShare = async () => {
        if (canShare) {
            try {
                await navigator.share({
                    title: article.title,
                    text: article.summary,
                    url: article.url,
                });
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.error('共有に失敗しました:', err);
                }
            }
        } else {
            handleCopy();
        }
    };

    return (
        <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden flex flex-col h-full transform transition-all duration-300 hover:scale-105 hover:shadow-indigo-500/30">
            <div className="p-6 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-3">
                     <h3 className="text-xl font-bold text-gray-100 leading-tight flex-1 pr-2">{article.title}</h3>
                     <SourceChip source={article.source} />
                </div>
                <p className="text-gray-400 text-base flex-grow mb-4">{article.summary}</p>
                <div className="flex justify-between items-center mt-auto">
                    <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-indigo-400 hover:text-indigo-300 font-semibold group"
                    >
                        続きを読む
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 ml-1 transition-transform duration-200 group-hover:translate-x-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </a>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={handleShare}
                            className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-green-400 transition-colors duration-200"
                            aria-label="記事を共有"
                            title={canShare ? "記事を共有" : "クリップボードにコピー (共有は利用できません)"}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12m-3 0a3 3 0 106 0 3 3 0 10-6 0 M18 6m-3 0a3 3 0 106 0 3 3 0 10-6 0 M18 18m-3 0a3 3 0 106 0 3 3 0 10-6 0 M8.7 10.7l6.6-3.4 M8.7 13.3l6.6 3.4" />
                            </svg>
                        </button>
                         <button 
                            onClick={() => onDeepDive(article)}
                            className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-indigo-400 transition-colors duration-200"
                            aria-label="このトピックを深掘り"
                            title="このトピックをさらに調査"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                            </svg>
                        </button>
                        <div className="relative">
                            <button 
                                onClick={handleCopy}
                                className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-sky-400 transition-colors duration-200"
                                aria-label="記事詳細をコピー"
                                title="記事詳細をコピー"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            </button>
                            {isCopied && (
                                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-green-600 text-white text-xs rounded-md shadow-lg pointer-events-none">
                                    コピーしました！
                                </div>
                            )}
                        </div>
                        <button 
                            onClick={() => onToggleFavorite(article)}
                            className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-pink-500 transition-colors duration-200"
                            aria-label={isFavorite ? 'お気に入りから削除' : 'お気に入りに追加'}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={isFavorite ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};