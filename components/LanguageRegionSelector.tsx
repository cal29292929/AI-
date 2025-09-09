
import React, { useState } from 'react';

interface LanguageRegionSelectorProps {
    selectedRegions: string[];
    onChange: (selected: string[]) => void;
}

const ALL_REGIONS = [
    '日本語', '英語 (米国)', '英語 (英国)', '韓国語', '中国語'
];

export const LanguageRegionSelector: React.FC<LanguageRegionSelectorProps> = ({ selectedRegions, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleRegionChange = (region: string) => {
        const isSelected = selectedRegions.includes(region);
        let newSelection;
        if (isSelected) {
            newSelection = selectedRegions.filter(s => s !== region);
        } else {
            newSelection = [...selectedRegions.filter(s => s !== 'すべての言語/地域'), region];
        }

        if (newSelection.length === 0) {
            onChange(['すべての言語/地域']);
        } else if (newSelection.length === ALL_REGIONS.length) {
            onChange(['すべての言語/地域', ...ALL_REGIONS]);
        }
        else {
             onChange(newSelection);
        }
    };

    const handleSelectAll = () => {
        if (selectedRegions.includes('すべての言語/地域')) {
            onChange([]); // Deselect all
        } else {
            onChange(['すべての言語/地域', ...ALL_REGIONS]); // Select all
        }
    };

    const isAllSelected = selectedRegions.includes('すべての言語/地域') || selectedRegions.length === ALL_REGIONS.length;
    const displayLabel = isAllSelected ? 'すべての言語/地域' : `${selectedRegions.length} 件選択中`;

    return (
        <div>
            <label className="text-lg font-semibold text-gray-300 mb-3 block">
                言語/地域を選択
            </label>
            <div className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full bg-gray-800/60 border border-gray-700 rounded-lg p-3 text-left flex justify-between items-center h-full"
                    aria-expanded={isOpen}
                    aria-controls="region-list"
                >
                    <span className="text-gray-300">{displayLabel}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>
                {isOpen && (
                    <div id="region-list" className="absolute z-20 top-full mt-2 w-full bg-gray-800 border border-gray-700 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                        <ul className="p-2">
                            <li className="p-2">
                                <label className="flex items-center space-x-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="h-5 w-5 rounded bg-gray-700 border-gray-600 text-indigo-600 focus:ring-indigo-500"
                                        checked={isAllSelected}
                                        onChange={handleSelectAll}
                                    />
                                    <span className="font-bold text-white">すべての言語/地域</span>
                                </label>
                            </li>
                             <hr className="border-gray-600 my-1" />
                            {ALL_REGIONS.map(region => (
                                <li key={region} className="p-2 hover:bg-gray-700/50 rounded-md">
                                    <label className="flex items-center space-x-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="h-5 w-5 rounded bg-gray-700 border-gray-600 text-indigo-600 focus:ring-indigo-500"
                                            checked={isAllSelected || selectedRegions.includes(region)}
                                            onChange={() => handleRegionChange(region)}
                                        />
                                        <span className="text-gray-300">{region}</span>
                                    </label>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};