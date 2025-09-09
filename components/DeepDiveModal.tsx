
import React, { useState } from 'react';
import type { Article } from '../types';

interface DeepDiveModalProps {
  article: Article;
  onSearch: (query: string) => void;
  onClose: () => void;
}

const suggestionQueries = [
    "技術的な詳細",
    "市場分析",
    "競合技術",
    "倫理的な示唆"
];

export const DeepDiveModal: React.FC<DeepDiveModalProps> = ({ article, onSearch, onClose }) => {
    const [query, setQuery] = useState('');

    const handleSearch = () => {
        if (query.trim()) {
            onSearch(query);
        }
    };

    const handleSuggestionClick = (suggestion: string) => {
        setQuery(suggestion);
        onSearch(suggestion);
    }

    return (
        <div 
            className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center backdrop-blur-sm"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="deep-dive-title"
        >
            <div 
                className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 w-full max-w-2xl p-8 transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
            >
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 id="deep-dive-title" className="text-2xl font-bold text-indigo-400">深掘り調査</h2>
                        <p className="text-gray-400 mt-1">調査対象: 「{article.title}」</p>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors" aria-label="閉じる">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="mt-6">
                    <label htmlFor="deep-dive-query" className="block text-lg font-semibold text-gray-300 mb-2">
                        何を具体的に調査しますか？
                    </label>
                    <input
                        id="deep-dive-query"
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="例: 「技術的背景」「市場への影響」「関連企業」"
                        className="w-full bg-gray-900/60 border border-gray-600 rounded-lg py-3 px-4 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                        onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
                    />
                </div>

                <div className="mt-4">
                    <p className="text-sm text-gray-400 mb-2">または、こちらの提案をお試しください:</p>
                    <div className="flex flex-wrap gap-2">
                        {suggestionQueries.map(suggestion => (
                             <button
                                key={suggestion}
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="px-3 py-1.5 bg-gray-700 text-gray-300 text-sm rounded-full hover:bg-indigo-600 hover:text-white transition-colors"
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mt-8 flex justify-end gap-4">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 rounded-lg bg-gray-600/50 text-gray-300 hover:bg-gray-600 transition-colors"
                    >
                        キャンセル
                    </button>
                    <button
                        onClick={handleSearch}
                        disabled={!query.trim()}
                        className="px-6 py-2 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700 disabled:bg-indigo-900 disabled:text-gray-400 disabled:cursor-not-allowed transition-all"
                    >
                        調査開始
                    </button>
                </div>
            </div>
             <style>{`
                @keyframes fade-in-scale {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-fade-in-scale {
                    animation: fade-in-scale 0.2s ease-out forwards;
                }
            `}</style>
        </div>
    );
};