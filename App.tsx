



import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { NewsCard } from './components/NewsCard';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorDisplay } from './components/ErrorDisplay';
import { SourceSelector } from './components/SourceSelector';
import { LanguageRegionSelector } from './components/LanguageRegionSelector';
import { FavoriteKeywords } from './components/FavoriteKeywords';
import { DeepDiveModal } from './components/DeepDiveModal';
import { SavedSearches } from './components/SavedSearches';
import { LoginModal } from './components/LoginModal';
import { ApiKeyModal } from './components/ApiKeyModal';
import { fetchAINews, translateArticlesToJapanese } from './services/geminiService';
import type { Article, SavedSearch } from './types';

const DEFAULT_SOURCES = [
    // Social & Video
    'X',
    'YouTube',
    // Japanese Tech Media
    'ITmedia NEWS AI+',
    '@IT',
    'MONOist',
    'ITmedia Enterprise',
    'TechCrunch Japan',
    'ZDNet Japan',
    'CodeZine',
    'PublicKey',
    'gihyo.jp',
    // Japanese Dev Platforms
    'Note',
    'Qiita',
    'Zenn',
    // International
    'HackerNews',
    'dev.to',
    // General
    'Tech Blogs',
];

const CONSOLIDATED_TAB_KEY = '__consolidated__';

const App: React.FC = () => {
    const [searchResults, setSearchResults] = useState<Map<string, Article[]>>(new Map());
    const [favorites, setFavorites] = useState<Article[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isTranslating, setIsTranslating] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [refreshInterval, setRefreshInterval] = useState<number>(0);
    const [timeToNextUpdate, setTimeToNextUpdate] = useState<number | null>(null);
    const [selectedSources, setSelectedSources] = useState<string[]>(['All Sources']);
    const [selectedRegions, setSelectedRegions] = useState<string[]>(['All Languages/Regions']);
    const [view, setView] = useState<'results' | 'favorites'>('results');
    const [language, setLanguage] = useState<'original' | 'ja'>('original');
    const [translatedArticles, setTranslatedArticles] = useState<Map<string, Omit<Article, 'url' | 'source'>>>(new Map());
    const [keywords, setKeywords] = useState<string[]>([]);
    const [currentInput, setCurrentInput] = useState<string>('');
    const [activeTab, setActiveTab] = useState<string>(CONSOLIDATED_TAB_KEY);
    const [favoriteKeywords, setFavoriteKeywords] = useState<string[]>([]);
    const [deepDiveTarget, setDeepDiveTarget] = useState<Article | null>(null);
    const [customSources, setCustomSources] = useState<string[]>([]);
    const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [username, setUsername] = useState<string>('');
    const [loggedInService, setLoggedInService] = useState<string>('');
    const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
    const [installPrompt, setInstallPrompt] = useState<Event | null>(null);
    const [apiKey, setApiKey] = useState<string>('');
    const [isApiModalOpen, setIsApiModalOpen] = useState<boolean>(false);

    useEffect(() => {
        try {
            const storedApiKey = localStorage.getItem('geminiApiKey');
            if (storedApiKey) {
                setApiKey(storedApiKey);
            } else {
                setIsApiModalOpen(true);
            }

            const storedFavorites = localStorage.getItem('aiNewsFavorites');
            if (storedFavorites) setFavorites(JSON.parse(storedFavorites));

            const storedKeywords = localStorage.getItem('aiNewsFavoriteKeywords');
            if (storedKeywords) setFavoriteKeywords(JSON.parse(storedKeywords));

            const storedCustomSources = localStorage.getItem('aiNewsCustomSources');
            if (storedCustomSources) setCustomSources(JSON.parse(storedCustomSources));

            const storedSavedSearches = localStorage.getItem('aiNewsSavedSearches');
            if (storedSavedSearches) setSavedSearches(JSON.parse(storedSavedSearches));
            
            const storedUser = localStorage.getItem('aiNewsUser');
            if (storedUser) {
                const user = JSON.parse(storedUser);
                setIsLoggedIn(true);
                setUsername(user.username);
                if (user.service) {
                    setLoggedInService(user.service);
                }
            }

        } catch (e) {
            console.error("Failed to parse data from localStorage", e);
        }

        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setInstallPrompt(e);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    useEffect(() => { localStorage.setItem('aiNewsFavorites', JSON.stringify(favorites)); }, [favorites]);
    useEffect(() => { localStorage.setItem('aiNewsFavoriteKeywords', JSON.stringify(favoriteKeywords)); }, [favoriteKeywords]);
    useEffect(() => { localStorage.setItem('aiNewsCustomSources', JSON.stringify(customSources)); }, [customSources]);
    useEffect(() => { localStorage.setItem('aiNewsSavedSearches', JSON.stringify(savedSearches)); }, [savedSearches]);
    
    const handleSetApiKey = (newApiKey: string) => {
        const trimmedKey = newApiKey.trim();
        setApiKey(trimmedKey);
        if (trimmedKey) {
            localStorage.setItem('geminiApiKey', trimmedKey);
            setIsApiModalOpen(false);
            if (error?.includes('APIキー')) setError(null);
        } else {
            localStorage.removeItem('geminiApiKey');
        }
    };

    const handleInstallClick = () => {
        if (!installPrompt) return;
        // @ts-ignore
        installPrompt.prompt();
        // @ts-ignore
        installPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the A2HS prompt');
            } else {
                console.log('User dismissed the A2HS prompt');
            }
            setInstallPrompt(null);
        });
    };

    const handleLogin = (service: string) => {
        const dummyUsername = `${service}_User_${Math.floor(1000 + Math.random() * 9000)}`;
        const user = { username: dummyUsername, service };
        localStorage.setItem('aiNewsUser', JSON.stringify(user));
        setIsLoggedIn(true);
        setUsername(dummyUsername);
        setLoggedInService(service);
        setIsLoginModalOpen(false);
    };

    const handleLogout = () => {
        localStorage.removeItem('aiNewsUser');
        setIsLoggedIn(false);
        setUsername('');
        setLoggedInService('');
    };

    const handleFetchNews = useCallback(async (keywordsToSearch: string[], appendResults = false) => {
        if (!apiKey) {
            setError("Gemini APIキーが設定されていません。ヘッダーの設定アイコンからキーを入力してください。");
            setIsApiModalOpen(true);
            return;
        }
        if (keywordsToSearch.length === 0) return;
        if (isLoading) return;

        setIsLoading(true);
        setError(null);
        
        const newResults = appendResults ? new Map(searchResults) : new Map<string, Article[]>();

        const promises = keywordsToSearch.map(keyword =>
            fetchAINews({
                apiKey,
                sources: selectedSources,
                regions: selectedRegions,
                query: keyword === 'トレンド' ? '' : keyword,
                trending: keyword === 'トレンド',
            }).then(articles => ({ keyword, articles, status: 'fulfilled' as const }))
              .catch(err => ({ keyword, error: err, status: 'rejected' as const }))
        );

        const results = await Promise.all(promises);
        let firstNewTab: string | null = null;
        let cumulativeError = "";

        results.forEach(result => {
            if (result.status === 'fulfilled') {
                newResults.set(result.keyword, result.articles);
                if (!firstNewTab) firstNewTab = result.keyword;
            } else {
                console.error(`Error fetching for ${result.keyword}:`, result.error);
                cumulativeError += `「${result.keyword}」の検索に失敗しました。 `;
                newResults.set(result.keyword, []);
            }
        });

        if (cumulativeError) setError(cumulativeError.trim());
        setSearchResults(newResults);
        setLastUpdated(new Date());
        
        if (!appendResults) {
            setActiveTab(CONSOLIDATED_TAB_KEY);
        } else if (firstNewTab) {
            setActiveTab(firstNewTab);
        }

        setView('results');
        setIsLoading(false);
        if(!appendResults) window.scrollTo({ top: 0, behavior: 'smooth' });

    }, [isLoading, selectedSources, selectedRegions, searchResults, apiKey]);

    useEffect(() => {
        let timerId: ReturnType<typeof setTimeout> | undefined;
        if (refreshInterval > 0 && apiKey) {
            handleFetchNews(keywords, false); 
            const intervalInMs = refreshInterval * 60 * 60 * 1000;
            timerId = setInterval(() => handleFetchNews(keywords, false), intervalInMs);
        }
        return () => clearInterval(timerId);
    }, [refreshInterval, handleFetchNews, keywords, apiKey]);

    useEffect(() => {
        let countdownTimerId: ReturnType<typeof setTimeout> | undefined;
        if (refreshInterval > 0 && lastUpdated) {
            const intervalInMs = refreshInterval * 60 * 60 * 1000;
            const updateCountdown = () => {
                const msSinceLastUpdate = new Date().getTime() - lastUpdated.getTime();
                const msToNextUpdate = intervalInMs - msSinceLastUpdate;
                setTimeToNextUpdate(msToNextUpdate > 0 ? Math.ceil(msToNextUpdate / 1000) : 0);
            };
            updateCountdown();
            countdownTimerId = setInterval(updateCountdown, 1000);
        } else {
            setTimeToNextUpdate(null);
        }
        return () => clearInterval(countdownTimerId);
    }, [refreshInterval, lastUpdated]);

    const handleAddKeyword = () => {
        const trimmed = currentInput.trim();
        if (trimmed && !keywords.includes(trimmed)) {
            setKeywords(prev => [...prev, trimmed]);
            setCurrentInput('');
        }
    };
    
    const handleRemoveKeyword = (keywordToRemove: string) => {
        setKeywords(prev => prev.filter(k => k !== keywordToRemove));
    };

    const handleSearchClick = () => {
        const trimmed = currentInput.trim();
        let finalKeywords = [...keywords];
        if (trimmed && !keywords.includes(trimmed)) {
            finalKeywords = [...keywords, trimmed];
            setKeywords(finalKeywords);
            setCurrentInput('');
        }
        if (finalKeywords.length > 0) {
            handleFetchNews(finalKeywords, false);
        }
    };

    const handleTrendingSearch = () => {
        const trendingKeywords = ['トレンド'];
        setKeywords(trendingKeywords);
        handleFetchNews(trendingKeywords, false);
    };

    const handleLanguageToggle = async () => {
        if (!apiKey) {
            setError("Gemini APIキーが設定されていません。翻訳機能を利用するには、キーを設定してください。");
            setIsApiModalOpen(true);
            return;
        }
        if (isTranslating || language === 'ja' || articlesToShow.length === 0) {
            setLanguage(language === 'ja' ? 'original' : 'ja');
            return;
        }

        setIsTranslating(true);
        setError(null);
        try {
            const articlesToTranslate = articlesToShow.filter(a => !translatedArticles.has(a.url));
            if (articlesToTranslate.length > 0) {
                const translated = await translateArticlesToJapanese(articlesToTranslate, { apiKey });
                setTranslatedArticles(prev => {
                    const newMap = new Map(prev);
                    translated.forEach(t => newMap.set(t.url, { title: t.title, summary: t.summary }));
                    return newMap;
                });
            }
            setLanguage('ja');
        } catch (err) {
            setError(err instanceof Error ? err.message : '翻訳に失敗しました。');
            setLanguage('original');
        } finally {
            setIsTranslating(false);
        }
    };

    const handleToggleFavorite = (article: Article) => {
        setFavorites(prev => {
            const isFav = prev.some(fav => fav.url === article.url);
            if (isFav) {
                return prev.filter(fav => fav.url !== article.url);
            }
            return [article, ...prev];
        });
    };
    const isArticleFavorite = (article: Article) => favorites.some(fav => fav.url === article.url);
    const handleAddFavoriteKeyword = (keywordToAdd: string) => {
        const trimmed = keywordToAdd.trim();
        if (trimmed && !favoriteKeywords.includes(trimmed)) {
            setFavoriteKeywords(prev => [...prev, trimmed]);
        }
    };
    const handleKeywordSearch = (keyword: string) => {
        setKeywords([keyword]);
        handleFetchNews([keyword], false);
    };
    const handleRemoveFavoriteKeyword = (keyword: string) => {
        setFavoriteKeywords(prev => prev.filter(k => k !== keyword));
    };
    const handleDownloadFavorites = () => {
        if (favorites.length === 0) return;
        const blob = new Blob([JSON.stringify(favorites, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'ai-news-favorites.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };
    const handleDeepDive = (article: Article) => setDeepDiveTarget(article);
    const executeDeepDiveSearch = (deepDiveQuery: string) => {
        if (!deepDiveTarget) return;
        const deepDiveKeyword = `深掘り: ${deepDiveQuery}`;
        if (!keywords.includes(deepDiveKeyword)) {
            setKeywords(prev => [...prev, deepDiveKeyword]);
        }
        handleFetchNews([deepDiveKeyword], true);
        setDeepDiveTarget(null);
    };
    const handleAddCustomSource = (source: string) => {
        const trimmed = source.trim();
        if (trimmed && !customSources.includes(trimmed) && !DEFAULT_SOURCES.includes(trimmed)) {
            setCustomSources(prev => [...prev, trimmed]);
        }
    };
    const handleRemoveCustomSource = (sourceToRemove: string) => {
        setCustomSources(prev => prev.filter(s => s !== sourceToRemove));
        setSelectedSources(prev => prev.filter(s => s !== sourceToRemove));
    };

    const handleSaveSearch = () => {
        if (keywords.length === 0) return;
        const newSearch: SavedSearch = { id: Date.now().toString(), query: keywords, sources: selectedSources };
        const isDuplicate = savedSearches.some(s => 
            JSON.stringify(s.query.sort()) === JSON.stringify(newSearch.query.sort()) &&
            JSON.stringify(s.sources.sort()) === JSON.stringify(newSearch.sources.sort())
        );
        if (!isDuplicate) setSavedSearches(prev => [newSearch, ...prev]);
    };
    const handleLoadSearch = (search: SavedSearch) => {
        setKeywords(search.query);
        setSelectedSources(search.sources);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    const handleRemoveSavedSearch = (id: string) => {
        setSavedSearches(prev => prev.filter(s => s.id !== id));
    };
    const formatTime = (totalSeconds: number): string => {
        if (totalSeconds < 0) return "00:00";
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = Math.floor(totalSeconds % 60);
        
        const paddedMinutes = String(minutes).padStart(2, '0');
        const paddedSeconds = String(seconds).padStart(2, '0');

        if (hours > 0) {
            return `${String(hours).padStart(2, '0')}:${paddedMinutes}:${paddedSeconds}`;
        }
        return `${paddedMinutes}:${paddedSeconds}`;
    };
    const intervalOptions = [ { label: 'オフ', value: 0 }, { label: '1時間', value: 1 }, { label: '3時間', value: 3 }, { label: '5時間', value: 5 }, ];

    const consolidatedArticles = useMemo(() => {
        const all = Array.from(searchResults.values()).flat();
        const uniqueUrls = new Set<string>();
        return all.filter(article => {
            if (uniqueUrls.has(article.url)) return false;
            uniqueUrls.add(article.url);
            return true;
        });
    }, [searchResults]);

    const articlesToShow = useMemo(() => {
        if (view === 'favorites') return favorites;
        if (activeTab === CONSOLIDATED_TAB_KEY) return consolidatedArticles;
        return searchResults.get(activeTab) || [];
    }, [view, activeTab, favorites, searchResults, consolidatedArticles]);

    const displayArticles = useMemo(() => {
        return language === 'ja'
            ? articlesToShow.map(article => {
                const translated = translatedArticles.get(article.url);
                return translated ? { ...article, ...translated } : article;
            })
            : articlesToShow;
    }, [language, articlesToShow, translatedArticles]);

    return (
        <div className="min-h-screen bg-gray-900 font-sans">
            <Header
                language={language}
                onLanguageToggle={handleLanguageToggle}
                isTranslating={isTranslating}
                isLoggedIn={isLoggedIn}
                username={username}
                loggedInService={loggedInService}
                onLoginClick={() => setIsLoginModalOpen(true)}
                onLogoutClick={handleLogout}
                canInstall={!!installPrompt}
                onInstallClick={handleInstallClick}
                onApiKeySettingsClick={() => setIsApiModalOpen(true)}
            />
            <main className="container mx-auto px-4 py-8">
                <div className="text-center mb-8 p-6 bg-gray-800/30 rounded-xl border border-gray-700">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex flex-col sm:flex-row items-center gap-2 mb-3">
                            <input
                                type="text"
                                value={currentInput}
                                onChange={(e) => setCurrentInput(e.target.value)}
                                placeholder="キーワードを入力 (例: Sora)"
                                className="w-full bg-gray-800/60 border border-gray-600 rounded-lg py-3 px-4 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                                onKeyDown={(e) => { if (e.key === 'Enter') handleAddKeyword(); }}
                            />
                            <button onClick={handleAddKeyword} className="w-full sm:w-auto bg-gray-600 text-white font-bold py-3 px-5 rounded-lg hover:bg-gray-700 transition-colors">追加</button>
                        </div>
                        <div className="flex flex-wrap items-center justify-center gap-2 mb-4 min-h-[2.5rem] bg-gray-900/30 p-2 rounded-lg">
                            {keywords.length > 0 ? (
                                <>
                                    <span className="text-sm font-semibold text-gray-400 mr-2 self-center">現在のキーワード:</span>
                                    {keywords.map(kw => (
                                        <span key={kw} className="flex items-center gap-2 bg-indigo-500/20 text-indigo-300 text-sm font-medium px-3 py-1.5 rounded-full animate-fade-in-short">
                                            {kw}
                                            <button onClick={() => handleRemoveKeyword(kw)} className="text-indigo-200/70 hover:text-white" title={`${kw} を削除`}>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                            </button>
                                        </span>
                                    ))}
                                </>
                            ) : (
                                <span className="text-gray-500">キーワードリストは空です。</span>
                            )}
                        </div>
                        <div className="flex-shrink-0 flex justify-center gap-2">
                             <button onClick={handleSearchClick} disabled={isLoading || !apiKey || (keywords.length === 0 && currentInput.trim() === '')} className="bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-indigo-700 disabled:bg-indigo-900 disabled:text-gray-400 disabled:cursor-not-allowed transition-all">
                                {isLoading ? '検索中...' : '検索'}
                            </button>
                             <button onClick={handleTrendingSearch} disabled={isLoading || !apiKey} className="bg-purple-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-purple-700 disabled:bg-purple-900 disabled:text-gray-400 disabled:cursor-not-allowed transition-all">
                               {isLoading ? '...' : 'トレンド'}
                            </button>
                            <button onClick={() => keywords.forEach(handleAddFavoriteKeyword)} disabled={keywords.length === 0} title="現在のキーワードをすべてお気に入りに追加" className="bg-amber-600 text-white font-bold p-3 rounded-lg shadow-lg hover:bg-amber-700 disabled:bg-amber-900 disabled:text-gray-400 disabled:cursor-not-allowed transition-all">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                            </button>
                            <button onClick={handleSaveSearch} disabled={keywords.length === 0} title="現在の検索条件を保存" className="bg-teal-600 text-white font-bold p-3 rounded-lg shadow-lg hover:bg-teal-700 disabled:bg-teal-900 disabled:text-gray-400 disabled:cursor-not-allowed transition-all">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                            </button>
                        </div>
                    </div>

                    <FavoriteKeywords keywords={favoriteKeywords} onKeywordClick={handleKeywordSearch} onKeywordRemove={handleRemoveFavoriteKeyword} />
                    {lastUpdated && !isLoading && !error && ( <p className="text-sm text-gray-500 mt-4 mb-4">最終更新: {lastUpdated.toLocaleString()}</p> )}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                        <SourceSelector defaultSources={DEFAULT_SOURCES} customSources={customSources} selectedSources={selectedSources} onChange={setSelectedSources} onAddSource={handleAddCustomSource} onRemoveSource={handleRemoveCustomSource} />
                        <LanguageRegionSelector selectedRegions={selectedRegions} onChange={setSelectedRegions} />
                        <div>
                             <label className="text-lg font-semibold text-gray-300 mb-3 block" id="interval-label">自動更新</label>
                             <div role="radiogroup" aria-labelledby="interval-label" className="flex justify-center items-center gap-x-2 sm:gap-x-4 bg-gray-800/60 p-2 rounded-lg border border-gray-700 h-full">
                                {intervalOptions.map(option => ( <div key={option.value}><input type="radio" id={`interval-${option.value}`} name="refresh-interval" value={option.value} checked={refreshInterval === option.value} onChange={(e) => setRefreshInterval(Number(e.target.value))} className="sr-only" /><label htmlFor={`interval-${option.value}`} className={`cursor-pointer px-4 py-2 text-sm sm:text-base rounded-md transition-colors duration-200 ${ refreshInterval === option.value ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-700 text-gray-300 hover:bg-gray-600' }`}>{option.label}</label></div> ))}
                             </div>
                             {refreshInterval > 0 && timeToNextUpdate !== null && !isLoading && ( <p className="text-base text-indigo-400 mt-4 font-mono" aria-live="polite">次の更新まで: {formatTime(timeToNextUpdate)}</p> )}
                        </div>
                    </div>
                </div>

                <SavedSearches searches={savedSearches} onLoad={handleLoadSearch} onRemove={handleRemoveSavedSearch} />
                
                <div className="mb-6 flex flex-col sm:flex-row justify-between items-center border-b border-gray-700">
                    <div className="flex flex-wrap">
                        <button onClick={() => setView('results')} className={`px-4 py-3 font-semibold transition-colors duration-200 ${view === 'results' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-400 hover:text-white'}`}>検索結果</button>
                        <button onClick={() => setView('favorites')} className={`px-4 py-3 font-semibold transition-colors duration-200 ${view === 'favorites' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-400 hover:text-white'}`}>お気に入り ({favorites.length})</button>
                    </div>
                    {view === 'favorites' && favorites.length > 0 && (
                        <button
                            onClick={handleDownloadFavorites}
                            className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg shadow-lg hover:bg-green-700 transition-all text-sm mt-2 sm:mt-0"
                            title="お気に入りをJSONファイルとしてダウンロード"
                        >
                            お気に入りをダウンロード
                        </button>
                    )}
                </div>

                {view === 'results' && searchResults.size > 0 && (
                    <div className="mb-6 border-b border-gray-700 flex flex-wrap -mx-1" role="tablist">
                        <button role="tab" aria-selected={activeTab === CONSOLIDATED_TAB_KEY} onClick={() => setActiveTab(CONSOLIDATED_TAB_KEY)} className={`px-4 py-3 mx-1 mb-[-1px] rounded-t-md font-semibold transition-colors duration-200 ${activeTab === CONSOLIDATED_TAB_KEY ? 'text-indigo-400 border-b-2 border-indigo-400 bg-gray-800/50' : 'text-gray-400 hover:text-white'}`}>
                            統合ビュー ({consolidatedArticles.length})
                        </button>
                        {Array.from(searchResults.keys()).map(keyword => (
                            <button role="tab" aria-selected={activeTab === keyword} key={keyword} onClick={() => setActiveTab(keyword)} className={`px-4 py-3 mx-1 mb-[-1px] rounded-t-md font-semibold transition-colors duration-200 ${activeTab === keyword ? 'text-indigo-400 border-b-2 border-indigo-400 bg-gray-800/50' : 'text-gray-400 hover:text-white'}`}>
                                {keyword} ({searchResults.get(keyword)?.length || 0})
                            </button>
                        ))}
                    </div>
                )}

                {isLoading && <LoadingSpinner />}
                {error && <ErrorDisplay message={error} />}

                {!isLoading && !error && displayArticles.length === 0 && (
                    <div className="text-center p-8 bg-gray-800/50 rounded-lg border border-gray-700">
                        <h2 className="text-2xl font-bold text-indigo-400 mb-4">
                           {!apiKey ? 'APIキーが必要です' : (view === 'favorites' ? 'まだお気に入りがありません' : (searchResults.size > 0 ? '結果が見つかりません' : 'ようこそ！'))}
                        </h2>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                           {!apiKey ? 'ヘッダーの歯車アイコンからGemini APIキーを設定してください。' : (view === 'favorites' ? 'ニュースカードのハートアイコンをクリックしてお気に入りに追加できます。' : (searchResults.size > 0 ? `現在のタブに該当する記事がありませんでした。キーワードやソースを変更してお試しください。` : `上の入力欄にキーワードを追加し、「検索」ボタンを押してニュースを探しましょう。`))}
                        </p>
                    </div>
                )}
                
                {!isLoading && !error && displayArticles.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {displayArticles.map(article => (
                            <NewsCard key={article.url} article={article} isFavorite={isArticleFavorite(article)} onToggleFavorite={handleToggleFavorite} onDeepDive={handleDeepDive} />
                        ))}
                    </div>
                )}
            </main>
            {deepDiveTarget && (
                <DeepDiveModal article={deepDiveTarget} onSearch={executeDeepDiveSearch} onClose={() => setDeepDiveTarget(null)} />
            )}
            {isLoginModalOpen && (
                <LoginModal onLogin={handleLogin} onClose={() => setIsLoginModalOpen(false)} />
            )}
            {isApiModalOpen && (
                <ApiKeyModal
                    currentApiKey={apiKey}
                    onSave={handleSetApiKey}
                    onClose={() => { if (apiKey) setIsApiModalOpen(false); }}
                />
            )}
        </div>
    );
};

export default App;