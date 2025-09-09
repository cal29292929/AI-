import React, { useState } from 'react';

interface ApiKeyModalProps {
    currentApiKey: string;
    onSave: (apiKey: string) => void;
    onClose: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ currentApiKey, onSave, onClose }) => {
    const [apiKeyInput, setApiKeyInput] = useState(currentApiKey);
    const [showKey, setShowKey] = useState(false);

    const handleSave = () => {
        onSave(apiKeyInput.trim());
    };
    
    const handleRemove = () => {
        setApiKeyInput('');
        onSave('');
    };

    return (
        <div 
            className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center backdrop-blur-sm"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="api-key-title"
        >
            <div 
                className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 w-full max-w-lg p-8 transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-start mb-4">
                    <h2 id="api-key-title" className="text-2xl font-bold text-indigo-400">Gemini APIキー設定</h2>
                    {currentApiKey && (
                         <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors" aria-label="閉じる">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>
                <p className="text-gray-400 mt-1 mb-6 text-sm">
                    AIニュース機能を利用するには、ご自身のGoogle AI StudioのAPIキーが必要です。入力されたキーは、お使いのブラウザのローカルストレージに安全に保存され、外部に送信されることはありません。
                </p>

                <div>
                    <label htmlFor="api-key-input" className="block text-lg font-semibold text-gray-300 mb-2">
                        APIキー
                    </label>
                    <div className="relative">
                        <input
                            id="api-key-input"
                            type={showKey ? 'text' : 'password'}
                            value={apiKeyInput}
                            onChange={(e) => setApiKeyInput(e.target.value)}
                            placeholder="ここにお持ちのAPIキーを貼り付け"
                            className="w-full bg-gray-900/60 border border-gray-600 rounded-lg py-3 px-4 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow pr-10"
                            onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); }}
                        />
                        <button
                            onClick={() => setShowKey(!showKey)}
                            className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-200"
                            aria-label={showKey ? "APIキーを隠す" : "APIキーを表示"}
                        >
                            {showKey ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zM10 12a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                  <path d="M10 17a9.953 9.953 0 01-4.512-1.074l-1.78-1.781a1 1 0 011.414-1.414l14-14a1 1 0 111.414 1.414l-1.473 1.473A10.014 10.014 0 01.458 10C1.732 14.057 5.522 17 10 17z" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

                <div className="mt-8 flex justify-between items-center gap-4">
                    <div>
                        {currentApiKey && (
                            <button
                                onClick={handleRemove}
                                className="px-4 py-2 text-sm rounded-lg bg-red-800/60 text-red-300 hover:bg-red-800/80 transition-colors"
                            >
                                キーを削除
                            </button>
                        )}
                    </div>
                    <div className="flex gap-4">
                       {currentApiKey && (
                            <button
                                onClick={onClose}
                                className="px-6 py-2 rounded-lg bg-gray-600/50 text-gray-300 hover:bg-gray-600 transition-colors"
                            >
                                キャンセル
                            </button>
                        )}
                        <button
                            onClick={handleSave}
                            disabled={!apiKeyInput.trim()}
                            className="px-6 py-2 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700 disabled:bg-indigo-900 disabled:text-gray-400 disabled:cursor-not-allowed transition-all"
                        >
                            保存
                        </button>
                    </div>
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