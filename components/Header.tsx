import React from 'react';

interface HeaderProps {
    language: 'original' | 'ja';
    onLanguageToggle: () => void;
    isTranslating: boolean;
    isLoggedIn: boolean;
    username: string;
    loggedInService: string;
    onLoginClick: () => void;
    onLogoutClick: () => void;
    canInstall: boolean;
    onInstallClick: () => void;
    onApiKeySettingsClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ language, onLanguageToggle, isTranslating, isLoggedIn, username, loggedInService, onLoginClick, onLogoutClick, canInstall, onInstallClick, onApiKeySettingsClick }) => {
    return (
        <header className="bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10 py-4 shadow-lg shadow-indigo-500/10 border-b border-gray-800">
            <div className="container mx-auto px-4 text-center relative">
                <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                    <span className="bg-gradient-to-r from-indigo-400 to-purple-500 text-transparent bg-clip-text">
                        AI News Aggregator
                    </span>
                </h1>
                <p className="mt-2 text-lg text-gray-400">
                    GeminiによるAIの最新情報ダイジェスト
                </p>
                <div className="absolute top-1/2 right-4 -translate-y-1/2 flex items-center gap-2 sm:gap-4">
                    {canInstall && (
                        <button
                          onClick={onInstallClick}
                          className="flex items-center gap-2 px-3 py-2 bg-green-600/50 border border-green-500 rounded-lg text-sm text-gray-200 hover:bg-green-600 transition-colors"
                          aria-label="アプリをインストール"
                          title="アプリをインストール"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            <span className="hidden sm:inline">インストール</span>
                        </button>
                    )}
                    <button
                        onClick={onApiKeySettingsClick}
                        className="flex items-center gap-2 px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                        aria-label="APIキー設定"
                        title="APIキー設定"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.532 1.532 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.532 1.532 0 01-.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106A1.532 1.532 0 0111.49 3.17zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                        </svg>
                    </button>
                    <button
                        onClick={onLanguageToggle}
                        disabled={isTranslating}
                        className="flex items-center gap-2 px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-sm text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-wait transition-colors"
                        aria-label={language === 'original' ? '日本語に翻訳' : '原文を表示'}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isTranslating ? 'animate-spin' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                           <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.944A5.962 5.962 0 0110 6c.774 0 1.503.143 2.168.403A4.015 4.015 0 008 10a4 4 0 004 4c.758 0 1.459-.215 2.056-.575A5.968 5.968 0 0110 16a5.962 5.962 0 01-5.668-7.056z" clipRule="evenodd" />
                        </svg>
                        <span className="hidden sm:inline">{isTranslating ? '翻訳中...' : (language === 'original' ? '日本語へ' : 'Original')}</span>
                    </button>
                    {isLoggedIn ? (
                        <div className="flex items-center gap-3">
                            <span className="text-gray-300 text-sm hidden lg:block">
                                ようこそ、{username}さん
                                {loggedInService && <span className="text-gray-400 text-xs"> ({loggedInService}でログイン中)</span>}
                            </span>
                            <button
                                onClick={onLogoutClick}
                                className="px-4 py-2 bg-red-600/50 border border-red-500 rounded-lg text-sm text-gray-200 hover:bg-red-600 transition-colors"
                            >
                                ログアウト
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={onLoginClick}
                            className="px-4 py-2 bg-indigo-600/50 border border-indigo-500 rounded-lg text-sm text-gray-200 hover:bg-indigo-600 transition-colors"
                        >
                            ログイン
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
};