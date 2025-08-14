export interface RSSItem {
  title: string;
  description?: string;
  link: string;
  pubDate: string;
  guid?: string;
}

export interface RSSFeed {
  url: string;
  title: string;
  description?: string;
  items?: RSSItem[];
}