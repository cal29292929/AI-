
import React, { useState } from 'react';
import type { SavedSearch } from '../types';

interface SavedSearchesProps {
  searches: SavedSearch[];
  onLoad: (search: SavedSearch) => void;
  onRemove: (id: string) => void;
}

export const SavedSearches: React.FC<SavedSearchesProps> = ({ searches, onLoad, onRemove }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (searches.length === 0) {
    return null; 
  }

  const handleRemove = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onRemove(id);
  };

  return (
    <div className="mb-8 max-w-6xl mx-auto">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-3 bg-gray-800/50 border border-gray-700 rounded-lg text-lg font-semibold text-gray-300 hover:bg-gray-800 transition-colors"
        aria-expanded={isOpen}
        aria-controls="saved-searches-list"
      >
        <span>保存した検索 ({searches.length})</span>
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {isOpen && (
        <div id="saved-searches-list" className="mt-2 p-2 space-y-2 bg-gray-800/30 rounded-lg border border-gray-700">
          {searches.map(search => (
            <div
              key={search.id}
              onClick={() => onLoad(search)}
              className="group flex items-center justify-between p-3 rounded-md hover:bg-indigo-600/20 cursor-pointer transition-colors"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onLoad(search)}
            >
              <div className="truncate pr-4">
                <p className="font-bold text-gray-200 truncate group-hover:text-indigo-300">{search.query.join(', ')}</p>
                <p className="text-sm text-gray-400">
                  {search.sources.includes('All Sources') || search.sources.length === 0 
                    ? 'すべてのソース' 
                    : `${search.sources.length} 件のソース`}
                </p>
              </div>
              <button
                onClick={(e) => handleRemove(e, search.id)}
                className="flex-shrink-0 p-2 rounded-full text-gray-500 hover:bg-red-500/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                aria-label={`保存した検索「${search.query.join(', ')}」を削除`}
                title="保存した検索を削除"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};