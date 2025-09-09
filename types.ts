
export interface Article {
    title: string;
    summary: string;
    url: string;
    source: string;
}

export interface SavedSearch {
    id: string;
    query: string[];
    sources: string[];
}
