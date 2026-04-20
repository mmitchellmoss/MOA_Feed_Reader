import React from 'react';
import { FeedItem } from '../types';
import { Star, EyeOff, ExternalLink, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

/**
 * Props for the FeedCard component.
 */
export interface FeedCardProps {
  /** The feed item to display */
  item: FeedItem;
  /** Whether the item is subscribed */
  isSubscribed: boolean;
  /** Whether the item is expanded */
  isExpanded: boolean;
  /** The current view mode ('summary' or 'full') */
  viewMode: 'summary' | 'full';
  /** Callback to toggle subscription status */
  onToggleSubscribe: (id: string, e: React.MouseEvent) => void;
  /** Callback to ignore the item */
  onToggleIgnore: (id: string, e: React.MouseEvent) => void;
  /** Callback to expand/collapse the item */
  onToggleExpand: (id: string) => void;
}

/**
 * Renders an individual RSS feed item.
 * Displays metadata (author, date), interactive buttons, and handles expanded/collapsed content view.
 * 
 * @param {FeedCardProps} props - The component props
 * @returns {React.ReactElement} The FeedCard component
 */
export const FeedCard: React.FC<FeedCardProps> = ({
  item,
  isSubscribed,
  isExpanded,
  viewMode,
  onToggleSubscribe,
  onToggleIgnore,
  onToggleExpand,
}) => {
  const id = item.guid || item.link || '';
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
      className={`group border rounded-xl p-5 relative transition-all duration-200 cursor-pointer ${isSubscribed ? 'bg-special-bg border-special-border shadow-sm' : 'bg-card border-border hover:shadow-md hover:border-slate-700'}`}
      onClick={() => onToggleExpand(id)}
      data-testid={`feed-card-${id}`}
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
          <div className="min-w-0 flex-1">
            <h2 className={`text-lg font-bold tracking-tight leading-tight text-text-main ${isExpanded ? '' : 'line-clamp-2'}`}>
              {item.title}
            </h2>
            <div className="flex items-center gap-4 mt-2 text-xs text-text-muted">
              <div className="w-40 shrink-0 truncate">
                By <b className="text-text-main">{item.creator || 'Anonymous'}</b>
              </div>
              <div className="w-56 shrink-0 flex items-center gap-1.5 font-medium">
                <Clock className="w-3.5 h-3.5 opacity-60" />
                {formattedDate}
              </div>
              
              <div className="flex-1 flex items-center gap-1 justify-end shrink-0">
                <button 
                  onClick={(e) => onToggleSubscribe(id, e)}
                  className={`p-1.5 rounded-md transition-all border ${isSubscribed ? 'bg-primary border-primary text-white shadow-sm' : 'border-border bg-card text-text-main hover:border-primary hover:text-primary'}`}
                  title={isSubscribed ? 'Unsubscribe' : 'Subscribe'}
                  data-testid={`subscribe-btn-${id}`}
                >
                  <Star className={`w-3.5 h-3.5 ${isSubscribed ? 'fill-white' : ''}`} />
                </button>
                
                <button 
                  onClick={(e) => onToggleIgnore(id, e)}
                  className="p-1.5 rounded-md bg-card border border-border text-[#ef4444] hover:bg-red-950 hover:border-red-900 transition-all"
                  title="Ignore Post"
                  data-testid={`ignore-btn-${id}`}
                >
                  <EyeOff className="w-3.5 h-3.5" />
                </button>

                <a 
                  href={item.link} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  onClick={(e) => e.stopPropagation()}
                  className="p-1.5 text-text-muted hover:text-primary hover:bg-slate-800 border border-transparent hover:border-border rounded-md transition-all"
                  title="View Original"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
          
          <div className="w-8 shrink-0 flex justify-end pt-1">
            {viewMode === 'summary' && !isSubscribed && (
              <div className="p-1 rounded-lg bg-slate-800 group-hover:bg-slate-700 transition-colors">
                {isExpanded ? <ChevronUp className="w-4 h-4 text-text-muted" /> : <ChevronDown className="w-4 h-4 text-text-muted" />}
              </div>
            )}
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mt-4"
            >
              <div className="h-px bg-slate-700 mb-4" />
              <div 
                className="prose prose-slate max-w-none text-sm leading-relaxed text-text-muted content-viewer font-medium"
                dangerouslySetInnerHTML={{ __html: item.content || item.contentSnippet || '' }}
              />
            </motion.div>
          )}
          {!isExpanded && (item.contentSnippet || item.content) && (
            <p className="mt-3 text-sm leading-relaxed text-text-muted line-clamp-2 italic">
              {item.contentSnippet || item.content?.replace(/<[^>]*>?/gm, '').substring(0, 200)}
            </p>
          )}
        </AnimatePresence>
      </div>
    </motion.article>
  );
};
