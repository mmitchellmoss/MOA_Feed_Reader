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
  Clock,
  User,
  AlertCircle,
  Activity,
  Filter,
  Bookmark
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FeedItem, FeedData } from './types.ts';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export default function App() {
  const [feed, setFeed] = useState<FeedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscribedIds, setSubscribedIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('moa_subscribed');
    return saved ? JSON.parse(saved) : [];
  });
  const [ignoredIds, setIgnoredIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('moa_ignored');
    return saved ? JSON.parse(saved) : [];
  });
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'summary' | 'full'>('summary');
  const [sidebarFilter, setSidebarFilter] = useState<'all' | 'subscribed'>('all');

  useEffect(() => {
    fetchFeed();
  }, []);

  useEffect(() => {
    localStorage.setItem('moa_subscribed', JSON.stringify(subscribedIds));
  }, [subscribedIds]);

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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const toggleSubscribe = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSubscribedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
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
    if (!feed) return [];
    
    let items = feed.items.filter(item => {
      const id = item.guid || item.link || '';
      return !ignoredIds.includes(id);
    });

    if (sidebarFilter === 'subscribed') {
      items = items.filter(item => {
        const id = item.guid || item.link || '';
        return subscribedIds.includes(id);
      });
    }
    
    return items.sort((a, b) => {
      const idA = a.guid || a.link || '';
      const idB = b.guid || b.link || '';
      const isSubA = subscribedIds.includes(idA);
      const isSubB = subscribedIds.includes(idB);

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
  }, [feed, subscribedIds, ignoredIds, sidebarFilter]);

  const resetFilters = () => {
    if (confirm('Are you sure you want to clear all your subscriptions and ignored posts?')) {
      setSubscribedIds([]);
      setIgnoredIds([]);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#f8fafc] text-[#1e293b] font-sans overflow-hidden">
      {/* Header */}
      <header className="h-16 bg-white border-b border-[#e2e8f0] flex items-center justify-between px-6 shrink-0 z-10 shadow-sm">
        <div className="flex items-center h-14 w-[400px] overflow-hidden rounded-lg">
          <img 
            src="/Satchel_Hopkins_Banner.png" 
            alt="Satchel Hopkins Banner" 
            className="w-full h-full object-cover object-top brightness-110"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement!.innerHTML = '<div class="flex items-center gap-3 ml-2"><div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">SH</div><span class="font-bold text-xl tracking-tight text-blue-600">Forum Reader</span></div>';
            }}
          />
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex bg-[#f8fafc] p-1 border border-[#e2e8f0] rounded-lg">
            <button 
              onClick={() => setViewMode('summary')}
              className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${viewMode === 'summary' ? 'bg-white shadow-sm text-primary' : 'text-[#64748b] hover:text-[#1e293b]'}`}
            >
              Summary
            </button>
            <button 
              onClick={() => setViewMode('full')}
              className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${viewMode === 'full' ? 'bg-white shadow-sm text-primary' : 'text-[#64748b] hover:text-[#1e293b]'}`}
            >
              Full View
            </button>
          </div>
          
          <button 
            onClick={fetchFeed}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold hover:bg-accent transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Feed
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 border-r border-[#e2e8f0] bg-white flex flex-col p-5 shrink-0">
          <div className="text-[10px] uppercase tracking-widest text-[#64748b] font-bold mb-4">Feeds</div>
          <nav className="space-y-1">
            <button 
              onClick={() => setSidebarFilter('all')}
              className={`w-full flex items-center justify-between p-2.5 rounded-lg text-sm transition-colors ${sidebarFilter === 'all' ? 'bg-special-bg text-primary font-semibold' : 'text-[#1e293b] hover:bg-[#f8fafc]'}`}
            >
              <div className="flex items-center gap-3">
                <Activity className="w-4 h-4" />
                <span>All Activity</span>
              </div>
              <span className="bg-[#e2e8f0] text-[#64748b] px-2 py-0.5 rounded-full text-[10px] font-bold">
                {feed?.items.filter(i => !ignoredIds.includes(i.guid || i.link || '')).length || 0}
              </span>
            </button>
            <button 
              onClick={() => setSidebarFilter('subscribed')}
              className={`w-full flex items-center justify-between p-2.5 rounded-lg text-sm transition-colors ${sidebarFilter === 'subscribed' ? 'bg-special-bg text-primary font-semibold' : 'text-[#1e293b] hover:bg-[#f8fafc]'}`}
            >
              <div className="flex items-center gap-3">
                <Bookmark className="w-4 h-4" />
                <span>Subscribed</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${subscribedIds.length > 0 ? 'bg-primary text-white' : 'bg-[#e2e8f0] text-[#64748b]'}`}>
                {subscribedIds.length}
              </span>
            </button>
          </nav>

          <div className="text-[10px] uppercase tracking-widest text-[#64748b] font-bold mt-8 mb-4">Filters</div>
          <nav className="space-y-1">
            <div className="flex items-center justify-between p-2.5 rounded-lg text-sm text-[#64748b] opacity-60">
              <div className="flex items-center gap-3">
                <Filter className="w-4 h-4" />
                <span>Ignored</span>
              </div>
              <span className="text-[10px] font-bold">{ignoredIds.length}</span>
            </div>
          </nav>

          <div className="mt-auto pt-6 border-t border-[#e2e8f0]">
             <button 
              onClick={resetFilters}
              className="flex items-center gap-2 text-[10px] text-[#64748b] font-bold uppercase tracking-wider hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Reset Settings
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-8 bg-[#f8fafc] scroll-smooth">
          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-900 rounded-xl flex items-start gap-4">
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
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <p className="text-xs font-bold tracking-widest text-[#64748b] uppercase">Loading Feed Entries...</p>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {filteredAndSortedItems.map((item) => {
                  const id = item.guid || item.link || '';
                  const isSubscribed = subscribedIds.includes(id);
                  const isExpanded = expandedIds.includes(id) || viewMode === 'full';
                  const formattedDate = new Date(item.pubDate || '').toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  return (
                    <motion.article 
                      layout
                      key={id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={`group border rounded-xl p-5 relative transition-all duration-200 cursor-pointer ${isSubscribed ? 'bg-special-bg border-special-border shadow-sm' : 'bg-white border-[#e2e8f0] hover:shadow-md hover:border-[#cbd5e1]'}`}
                      onClick={() => toggleExpand(id)}
                    >
                      {isSubscribed && (
                        <div className="mb-3">
                          <span className="text-[10px] font-black uppercase tracking-widest bg-primary text-white px-2.5 py-1 rounded-md">
                            Recently Updated &bull; Subscribed
                          </span>
                        </div>
                      )}
                      
                      <div className="flex flex-col">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <h2 className={`text-lg font-bold tracking-tight leading-tight text-[#0f172a] ${isExpanded ? '' : 'line-clamp-2'}`}>
                              {item.title}
                            </h2>
                            <div className="flex items-center flex-wrap gap-x-3 gap-y-2 mt-1.5 text-xs text-[#64748b]">
                              <span className="flex items-center gap-1">
                                By <b className="text-[#1e293b]">{item.creator || 'Anonymous'}</b>
                              </span>
                              <span>&bull;</span>
                              <span className="flex items-center gap-1.5 font-medium shrink-0">
                                <Clock className="w-3.5 h-3.5 opacity-60" />
                                {formattedDate}
                              </span>
                              
                              <div className="flex items-center gap-1 ml-auto shrink-0">
                                <button 
                                  onClick={(e) => toggleSubscribe(id, e)}
                                  className={`p-1.5 rounded-md transition-all border ${isSubscribed ? 'bg-primary border-primary text-white shadow-sm' : 'border-[#e2e8f0] bg-white text-[#1e293b] hover:border-primary hover:text-primary'}`}
                                  title={isSubscribed ? 'Unsubscribe' : 'Subscribe'}
                                >
                                  <Star className={`w-3.5 h-3.5 ${isSubscribed ? 'fill-white' : ''}`} />
                                </button>
                                
                                <button 
                                  onClick={(e) => toggleIgnore(id, e)}
                                  className="p-1.5 rounded-md bg-white border border-[#e2e8f0] text-[#ef4444] hover:bg-red-50 hover:border-red-200 transition-all"
                                  title="Ignore Post"
                                >
                                  <EyeOff className="w-3.5 h-3.5" />
                                </button>

                                <a 
                                  href={item.link} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  onClick={(e) => e.stopPropagation()}
                                  className="p-1.5 text-[#64748b] hover:text-primary hover:bg-[#f1f5f9] border border-transparent hover:border-[#e2e8f0] rounded-md transition-all"
                                  title="View Original"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              </div>
                            </div>
                          </div>
                          
                          {viewMode === 'summary' && !isSubscribed && (
                            <div className="p-1 rounded-lg bg-[#f1f5f9] group-hover:bg-[#e2e8f0] transition-colors shrink-0">
                              {isExpanded ? <ChevronUp className="w-4 h-4 text-[#64748b]" /> : <ChevronDown className="w-4 h-4 text-[#64748b]" />}
                            </div>
                          )}
                        </div>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden mt-4"
                            >
                              <div className="h-px bg-[#e2e8f0] mb-4" />
                              <div 
                                className="prose prose-slate max-w-none text-sm leading-relaxed text-[#334155] content-viewer font-medium"
                                dangerouslySetInnerHTML={{ __html: item.content || item.contentSnippet || '' }}
                              />
                            </motion.div>
                          )}
                          {!isExpanded && (item.contentSnippet || item.content) && (
                            <p className="mt-3 text-sm leading-relaxed text-[#64748b] line-clamp-2 italic">
                              {item.contentSnippet || item.content?.replace(/<[^>]*>?/gm, '').substring(0, 200)}
                            </p>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.article>
                  );
                })}
              </AnimatePresence>
            )}

            {filteredAndSortedItems.length === 0 && !loading && (
              <div className="py-32 text-center bg-white border border-[#e2e8f0] rounded-2xl shadow-sm">
                <div className="w-16 h-16 bg-[#f1f5f9] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Rss className="w-8 h-8 text-[#94a3b8]" />
                </div>
                <h3 className="font-bold text-[#1e293b]">No items to show</h3>
                <p className="text-xs text-[#64748b] mt-1 uppercase tracking-wider font-bold">Your feed filters are quite strict!</p>
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


