
import React, { useState } from 'react';

interface SourceSelectorProps {
    defaultSources: string[];
    customSources: string[];
    selectedSources: string[];
    onChange: (selected: string[]) => void;
    onAddSource: (source: string) => void;
    onRemoveSource: (source: string) => void;
}

export const SourceSelector: React.FC<SourceSelectorProps> = ({
    defaultSources,
    customSources,
    selectedSources,
    onChange,
    onAddSource,
    onRemoveSource
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [newSourceInput, setNewSourceInput] = useState('');

    const ALL_SOURCES = [...defaultSources, ...customSources];

    const handleSourceChange = (source: string) => {
        const isSelected = selectedSources.includes(source);
        let newSelection;
        if (isSelected) {
            newSelection = selectedSources.filter(s => s !== source);
        } else {
            newSelection = [...selectedSources.filter(s => s !== 'All Sources'), source];
        }

        if (newSelection.length === 0) {
            onChange(['All Sources']);
        } else if (newSelection.length === ALL_SOURCES.length) {
            onChange(['All Sources', ...ALL_SOURCES]);
        }
        else {
             onChange(newSelection);
        }
    };

    const handleSelectAll = () => {
        if (selectedSources.includes('All Sources') || selectedSources.length === ALL_SOURCES.length) {
            onChange([]); // Deselect all
        } else {
            onChange(['All Sources', ...ALL_SOURCES]); // Select all
        }
    };
    
    const handleAddClick = () => {
        if (newSourceInput.trim()) {
            onAddSource(newSourceInput);
            setNewSourceInput('');
        }
    };

    const isAllSelected = selectedSources.includes('All Sources') || (ALL_SOURCES.length > 0 && selectedSources.length === ALL_SOURCES.length);

    return (
        <div>
            <label className="text-lg font-semibold text-gray-300 mb-3 block">
                ニュースソースを選択
            </label>
            <div className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full bg-gray-800/60 border border-gray-700 rounded-lg p-3 text-left flex justify-between items-center"
                    aria-expanded={isOpen}
                    aria-controls="source-list"
                >
                    <span className="text-gray-300">
                        {isAllSelected ? 'すべてのソース' : `${selectedSources.length} 件のソースを選択中`}
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>
                {isOpen && (
                    <div id="source-list" className="absolute z-20 top-full mt-2 w-full bg-gray-800 border border-gray-700 rounded-lg shadow-xl max-h-80 overflow-y-auto">
                        <ul className="p-2">
                            <li className="p-2">
                                <label className="flex items-center space-x-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="h-5 w-5 rounded bg-gray-700 border-gray-600 text-indigo-600 focus:ring-indigo-500"
                                        checked={isAllSelected}
                                        onChange={handleSelectAll}
                                    />
                                    <span className="font-bold text-white">すべてのソース</span>
                                </label>
                            </li>
                             <hr className="border-gray-600 my-1" />
                            {ALL_SOURCES.map(source => (
                                <li key={source} className="p-2 hover:bg-gray-700/50 rounded-md flex justify-between items-center group">
                                    <label className="flex items-center space-x-3 cursor-pointer flex-grow">
                                        <input
                                            type="checkbox"
                                            className="h-5 w-5 rounded bg-gray-700 border-gray-600 text-indigo-600 focus:ring-indigo-500"
                                            checked={isAllSelected || selectedSources.includes(source)}
                                            onChange={() => handleSourceChange(source)}
                                        />
                                        <span className="text-gray-300">{source}</span>
                                    </label>
                                    {customSources.includes(source) && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onRemoveSource(source);
                                            }}
                                            className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                                            aria-label={`カスタムソース ${source} を削除`}
                                            title={`${source} を削除`}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    )}
                                </li>
                            ))}
                            <hr className="border-gray-600 my-1" />
                            <li className="p-2">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newSourceInput}
                                        onChange={(e) => setNewSourceInput(e.target.value)}
                                        placeholder="カスタムソースを追加..."
                                        className="w-full bg-gray-900/60 border border-gray-600 rounded-md py-1 px-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        onKeyDown={(e) => { if (e.key === 'Enter') handleAddClick(); }}
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                    <button
                                        onClick={handleAddClick}
                                        className="bg-indigo-600 text-white font-semibold text-sm px-3 py-1 rounded-md hover:bg-indigo-700 disabled:bg-indigo-900 disabled:cursor-not-allowed"
                                        disabled={!newSourceInput.trim()}
                                    >
                                        追加
                                    </button>
                                </div>
                            </li>
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};