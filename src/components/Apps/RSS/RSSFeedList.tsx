import React from 'react';
import { RSSFeed } from './types';
import { formatDate } from './utils';

interface RSSFeedListProps {
  feeds: RSSFeed[];
  themeColors: any;
  isTerminalTheme: boolean;
}

export function RSSFeedList({ feeds, themeColors, isTerminalTheme }: RSSFeedListProps) {
  const bgItem = isTerminalTheme ? 'rgba(255, 255, 255, 0.05)' : 'rgba(31, 41, 55, 0.5)';
  const textColor = isTerminalTheme ? 'rgb(255, 255, 255)' : 'white';
  const textMuted = isTerminalTheme ? 'rgba(255, 255, 255, 0.5)' : 'rgb(156, 163, 175)';
  const textSecondary = isTerminalTheme ? 'rgba(255, 255, 255, 0.4)' : 'rgb(107, 114, 128)';
  const borderColor = isTerminalTheme ? 'rgba(255, 255, 255, 0.3)' : 'transparent';
  const hoverBg = isTerminalTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(55, 65, 81, 0.5)';
  const primaryColor = isTerminalTheme ? 'rgb(255, 255, 255)' : themeColors.primary;

  return (
    <div className="h-full overflow-y-auto p-4 card-scrollbar space-y-6">
      {feeds.map((feed) => (
        <div key={feed.url} className="space-y-4">
          <h2 className="text-lg font-semibold" style={{ color: textColor }}>{feed.title}</h2>
          <div className="space-y-4">
            {feed.items?.map((item, index) => (
              <div
                key={item.guid || index}
                className="rounded-lg p-4 transition-colors cursor-pointer"
                style={{
                  backgroundColor: bgItem,
                  border: isTerminalTheme ? `1px solid ${borderColor}` : 'none'
                }}
                onClick={() => window.open(item.link, '_blank')}
              >
                <h3 className="font-medium mb-2" style={{ color: textColor }}>{item.title}</h3>
                <p className="text-sm mb-2 line-clamp-2" style={{ color: textMuted }}>
                  {item.description?.replace(/<[^>]*>/g, '')}
                </p>
                <div className="flex items-center justify-between text-xs">
                  <span
                    className="text-sm"
                    style={{ color: primaryColor }}
                  >
                    Read more
                  </span>
                  <span style={{ color: textSecondary }}>
                    {formatDate(item.pubDate)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {feeds.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full" style={{ color: textMuted }}>
          <p>No RSS feeds configured</p>
          <p className="text-sm">Click the settings icon to add feeds</p>
        </div>
      )}
    </div>
  );
}