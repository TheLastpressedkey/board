import React from 'react';
import { RSSFeed } from './types';
import { formatDate } from './utils';

interface RSSFeedListProps {
  feeds: RSSFeed[];
  themeColors: any;
}

export function RSSFeedList({ feeds, themeColors }: RSSFeedListProps) {
  return (
    <div className="h-full overflow-y-auto p-4 card-scrollbar space-y-6">
      {feeds.map((feed) => (
        <div key={feed.url} className="space-y-4">
          <h2 className="text-lg font-semibold text-white">{feed.title}</h2>
          <div className="space-y-4">
            {feed.items?.map((item, index) => (
              <div
                key={item.guid || index}
                className="bg-gray-800/50 rounded-lg p-4 hover:bg-gray-700/50 transition-colors cursor-pointer"
                onClick={() => window.open(item.link, '_blank')}
              >
                <h3 className="text-white font-medium mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm mb-2 line-clamp-2">
                  {item.description?.replace(/<[^>]*>/g, '')}
                </p>
                <div className="flex items-center justify-between text-xs">
                  <span 
                    className="text-sm"
                    style={{ color: themeColors.primary }}
                  >
                    Read more
                  </span>
                  <span className="text-gray-500">
                    {formatDate(item.pubDate)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {feeds.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-gray-400">
          <p>No RSS feeds configured</p>
          <p className="text-sm">Click the settings icon to add feeds</p>
        </div>
      )}
    </div>
  );
}