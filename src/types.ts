export interface FeedItem {
  id?: string;
  title?: string;
  link?: string;
  pubDate?: string;
  content?: string;
  contentSnippet?: string;
  guid?: string;
  creator?: string;
  categories?: string[];
}

export interface FeedData {
  items: FeedItem[];
  title?: string;
  description?: string;
  link?: string;
}
