import React, { useState, useEffect, useMemo } from 'react';
import { 
  Rss, 
  RefreshCw, 
  EyeOff, 
  Star, 
  Trash2, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  AlertCircle,
  Activity,
  Filter,
  Bookmark
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FeedItem, FeedData } from './types.ts';
import { FeedCard } from './components/FeedCard';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export default function App() {
  const [feed, setFeed] = useState<FeedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscribedItems, setSubscribedItems] = useState<Record<string, FeedItem>>(() => {
    const saved = localStorage.getItem('moa_subscribed_items');
    return saved ? JSON.parse(saved) : {};
  });
  const [ignoredIds, setIgnoredIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('moa_ignored');
    return saved ? JSON.parse(saved) : [];
  });
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'summary' | 'full'>('summary');
  const [sidebarFilter, setSidebarFilter] = useState<'all' | 'subscribed'>('all');
  const [showSubscribed, setShowSubscribed] = useState<boolean>(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  useEffect(() => {
    fetchFeed();
  }, []);

  useEffect(() => {
    localStorage.setItem('moa_subscribed_items', JSON.stringify(subscribedItems));
  }, [subscribedItems]);

  useEffect(() => {
    localStorage.setItem('moa_ignored', JSON.stringify(ignoredIds));
  }, [ignoredIds]);

  const fetchFeed = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/feed');
      if (!response.ok) throw new Error('Failed to fetch feed');
      const data: FeedData = await response.json();
      setFeed(data);

      const legacyIdsStr = localStorage.getItem('moa_subscribed');
      if (legacyIdsStr) {
        try {
          const legacyIds: string[] = JSON.parse(legacyIdsStr);
          if (Array.isArray(legacyIds) && legacyIds.length > 0) {
            setSubscribedItems(prev => {
              const newItems = { ...prev };
              let migrated = false;
              legacyIds.forEach(id => {
                if (!newItems[id]) {
                  const found = data.items.find(item => (item.guid || item.link || '') === id);
                  if (found) {
                    newItems[id] = found;
                    migrated = true;
                  }
                }
              });
              return migrated ? newItems : prev;
            });
          }
        } catch (e) {
          // ignore
        }
        localStorage.removeItem('moa_subscribed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const toggleSubscribe = (item: FeedItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const id = item.guid || item.link || '';
    setSubscribedItems(prev => {
      const newItems = { ...prev };
      if (newItems[id]) {
        delete newItems[id];
      } else {
        newItems[id] = item;
      }
      return newItems;
    });
  };

  const toggleIgnore = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setIgnoredIds(prev => [...prev, id]);
  };

  const toggleExpand = (id: string) => {
    if (viewMode === 'full') return;
    setExpandedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const filteredAndSortedItems = useMemo(() => {
    const allItemsMap = new Map<string, FeedItem>();
    
    Object.values(subscribedItems).forEach(item => {
      const id = item.guid || item.link || '';
      allItemsMap.set(id, item);
    });

    if (feed) {
      feed.items.forEach(item => {
        const id = item.guid || item.link || '';
        allItemsMap.set(id, item);
      });
    }

    let items = Array.from(allItemsMap.values()).filter(item => {
      const id = item.guid || item.link || '';
      return !ignoredIds.includes(id);
    });

    if (sidebarFilter === 'subscribed') {
      items = items.filter(item => {
        const id = item.guid || item.link || '';
        return !!subscribedItems[id];
      });
    }

    if (!showSubscribed) {
      items = items.filter(item => {
        const id = item.guid || item.link || '';
        return !subscribedItems[id];
      });
    }
    
    return items.sort((a, b) => {
      const idA = a.guid || a.link || '';
      const idB = b.guid || b.link || '';
      const isSubA = !!subscribedItems[idA];
      const isSubB = !!subscribedItems[idB];

      // In "all" view, subscribed items float to top
      if (sidebarFilter === 'all') {
        if (isSubA && !isSubB) return -1;
        if (!isSubA && isSubB) return 1;
      }

      // Fallback to date
      const dateA = new Date(a.pubDate || 0).getTime();
      const dateB = new Date(b.pubDate || 0).getTime();
      return dateB - dateA;
    });
  }, [feed, subscribedItems, ignoredIds, sidebarFilter, showSubscribed]);



  return (
    <div className="flex flex-col h-screen bg-black text-zinc-200 font-sans overflow-hidden">
      {/* Header */}
      <header className="h-16 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between px-6 shrink-0 z-10 shadow-sm">
        <div className="flex items-center h-14 w-[600px] overflow-hidden rounded-lg">
          <div className="flex items-center gap-4 ml-2">
            <div 
              className="h-12 w-[340px] rounded bg-no-repeat"
              style={{ 
                backgroundImage: 'url(/Satchel_Hopkins_Banner.png)', 
                backgroundSize: '92%',
                backgroundPosition: '50% 0%'
              }}
              title="Satchel Hopkins"
            />
            <span className="font-bold text-sm tracking-widest text-zinc-200 uppercase opacity-80 border-l border-zinc-700 pl-4 shrink-0">
              Feed Reader
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <span className={`text-xs font-bold uppercase tracking-wider transition-colors ${showSubscribed ? 'text-zinc-200' : 'text-zinc-600'}`}>
              Subscribed
            </span>
            <button 
              onClick={() => setShowSubscribed(!showSubscribed)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none border border-zinc-800 ${showSubscribed ? 'bg-blue-600 border-blue-500' : 'bg-black'}`}
            >
              <span 
                className={`inline-block h-3 w-3 transform rounded-full bg-zinc-200 transition-transform ${showSubscribed ? 'translate-x-4 bg-white' : 'translate-x-1'}`}
              />
            </button>
          </div>
          
          <div className="w-px h-6 bg-zinc-800"></div>

          <div className="flex items-center gap-4">
            <div className="flex bg-black p-1 border border-zinc-800 rounded-lg">
              <button 
                onClick={() => setViewMode('summary')}
              className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${viewMode === 'summary' ? 'bg-zinc-950 shadow-sm text-blue-500' : 'text-zinc-500 hover:text-zinc-200'}`}
            >
              Summary
            </button>
            <button 
              onClick={() => setViewMode('full')}
              className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${viewMode === 'full' ? 'bg-zinc-950 shadow-sm text-blue-500' : 'text-zinc-500 hover:text-zinc-200'}`}
            >
              Full View
            </button>
          </div>
          
          <button 
            onClick={fetchFeed}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-accent transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Feed
          </button>
        </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <aside 
          className={`border-r border-zinc-800 bg-zinc-950 flex flex-col shrink-0 transition-[width] duration-300 ease-in-out overflow-hidden relative z-20 ${isSidebarOpen ? 'w-64' : 'w-0'}`}
        >
          <div className="w-64 p-5 flex flex-col h-full min-w-[16rem]">
            <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-4">Feeds</div>
            <nav className="space-y-1">
            <button 
              onClick={() => setSidebarFilter('all')}
              className={`w-full flex items-center justify-between p-2.5 rounded-lg text-sm transition-colors ${sidebarFilter === 'all' ? 'bg-zinc-900 text-blue-500 font-semibold' : 'text-zinc-200 hover:bg-black'}`}
            >
              <div className="flex items-center gap-3">
                <Activity className="w-4 h-4" />
                <span>All Activity</span>
              </div>
              <span className="bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded-full text-[10px] font-bold">
                {feed?.items.filter(i => !ignoredIds.includes(i.guid || i.link || '')).length || 0}
              </span>
            </button>
            <button 
              onClick={() => setSidebarFilter('subscribed')}
              className={`w-full flex items-center justify-between p-2.5 rounded-lg text-sm transition-colors ${sidebarFilter === 'subscribed' ? 'bg-zinc-900 text-blue-500 font-semibold' : 'text-zinc-200 hover:bg-black'}`}
            >
              <div className="flex items-center gap-3">
                <Bookmark className="w-4 h-4" />
                <span>Subscribed</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${Object.keys(subscribedItems).length > 0 ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-500'}`}>
                {Object.keys(subscribedItems).length}
              </span>
            </button>
          </nav>
          </div>
        </aside>

        {/* Toggle Button Container - positioned on the line between aside and main */}
        <div className="relative z-30 flex items-start">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="absolute -left-3 top-6 bg-zinc-900 border border-zinc-700 rounded-full p-1 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors shadow-sm focus:outline-none"
            title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            {isSidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-8 bg-black scroll-smooth relative z-10">
          {error && (
            <div className="mb-8 p-4 bg-red-950 border border-red-100 text-red-900 rounded-xl flex items-start gap-4">
              <AlertCircle className="w-5 h-5 mt-0.5 shrink-0 text-red-500" />
              <div>
                <p className="font-bold text-sm">Update Failed</p>
                <p className="text-xs opacity-80 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          <div className="max-w-4xl mx-auto space-y-4">
            {loading && !feed ? (
              <div className="flex flex-col items-center justify-center py-32 gap-4 animate-pulse opacity-50">
                <div className="w-10 h-10 border-4 border-blue-600/20 border-t-primary rounded-full animate-spin"></div>
                <p className="text-xs font-bold tracking-widest text-zinc-500 uppercase">Loading Feed Entries...</p>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {filteredAndSortedItems.map((item) => {
                  const id = item.guid || item.link || '';
                  const isSubscribed = !!subscribedItems[id];
                  const isExpanded = expandedIds.includes(id) || viewMode === 'full';
                  const formattedDate = new Date(item.pubDate || '').toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  return (
                    <FeedCard
                      key={id}
                      item={item}
                      isSubscribed={isSubscribed}
                      isExpanded={isExpanded}
                      viewMode={viewMode}
                      onToggleSubscribe={toggleSubscribe}
                      onToggleIgnore={toggleIgnore}
                      onToggleExpand={toggleExpand}
                    />
                  );
                })}
              </AnimatePresence>
            )}

            {filteredAndSortedItems.length === 0 && !loading && (
              <div className="py-32 text-center bg-zinc-950 border border-zinc-800 rounded-2xl shadow-sm">
                <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Rss className="w-8 h-8 text-zinc-500" />
                </div>
                <h3 className="font-bold text-zinc-200">No items to show</h3>
                <p className="text-xs text-zinc-500 mt-1 uppercase tracking-wider font-bold">Your feed filters are quite strict!</p>
              </div>
            )}
          </div>
        </main>
      </div>

      <style>{`
        .content-viewer img {
          max-width: 100%;
          height: auto;
          margin: 1.5rem 0;
          border-radius: 12px;
          border: 1px solid var(--border);
        }
        .content-viewer a {
          color: var(--primary);
          text-decoration: underline;
          text-underline-offset: 4px;
          font-weight: 700;
        }
        .content-viewer p {
          margin-bottom: 1.25rem;
        }
        .content-viewer blockquote {
          background: #f8fafc;
          border-left: 4px solid var(--primary);
          padding: 1rem 1.5rem;
          border-radius: 0 12px 12px 0;
          font-style: italic;
          margin: 1.5rem 0;
          color: #475569;
        }
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #f8fafc;
        }
        ::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}


