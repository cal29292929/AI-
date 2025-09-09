
import React from 'react';

interface FavoriteKeywordsProps {
  keywords: string[];
  onKeywordClick: (keyword: string) => void;
  onKeywordRemove: (keyword: string) => void;
}

export const FavoriteKeywords: React.FC<FavoriteKeywordsProps> = ({ keywords, onKeywordClick, onKeywordRemove }) => {
  if (keywords.length === 0) {
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto mb-6 -mt-2">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {keywords.map(keyword => (
          <div
            key={keyword}
            className="flex items-center bg-gray-700/80 rounded-full text-sm text-gray-200 transition-colors duration-200 hover:bg-gray-700"
          >
            <button
              onClick={() => onKeywordClick(keyword)}
              className="px-3 py-1 hover:text-indigo-300"
              title={`「${keyword}」で検索`}
            >
              {keyword}
            </button>
            <button
              onClick={() => onKeywordRemove(keyword)}
              className="pr-2 pl-1 text-gray-400 hover:text-red-400"
              aria-label={`${keyword} をお気に入りから削除`}
              title={`「${keyword}」を削除`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};