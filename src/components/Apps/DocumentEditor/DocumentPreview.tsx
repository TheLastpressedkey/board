import React from 'react';

interface DocumentPreviewProps {
  content: string;
  format: 'markdown' | 'text';
  themeColors: any;
}

export function DocumentPreview({ content, format, themeColors }: DocumentPreviewProps) {
  const renderMarkdown = (text: string) => {
    let html = text;

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Italic
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Underline
    html = html.replace(/<u>(.*?)<\/u>/g, '<u>$1</u>');

    // Code inline
    html = html.replace(/`(.*?)`/g, '<code>$1</code>');

    // Code blocks
    html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

    // Lists
    html = html.replace(/^\* (.*$)/gim, '<li>$1</li>');
    html = html.replace(/^\d+\. (.*$)/gim, '<li>$1</li>');

    // Wrap consecutive list items
    html = html.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
    html = html.replace(/<\/ul>\s*<ul>/g, '');

    // Quotes
    html = html.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');

    // Line breaks
    html = html.replace(/\n/g, '<br>');

    return html;
  };

  const previewStyles = `
    .document-preview {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: white;
    }
    .document-preview h1 {
      font-size: 2rem;
      font-weight: bold;
      margin: 1.5rem 0 1rem 0;
      color: ${themeColors.primary};
      border-bottom: 2px solid ${themeColors.primary};
      padding-bottom: 0.5rem;
    }
    .document-preview h2 {
      font-size: 1.5rem;
      font-weight: bold;
      margin: 1.25rem 0 0.75rem 0;
      color: ${themeColors.primary};
    }
    .document-preview h3 {
      font-size: 1.25rem;
      font-weight: bold;
      margin: 1rem 0 0.5rem 0;
      color: ${themeColors.primary};
    }
    .document-preview p {
      margin: 0.75rem 0;
    }
    .document-preview strong {
      font-weight: bold;
      color: white;
    }
    .document-preview em {
      font-style: italic;
      color: #e5e7eb;
    }
    .document-preview u {
      text-decoration: underline;
    }
    .document-preview code {
      background: rgba(55, 65, 81, 0.5);
      padding: 0.125rem 0.25rem;
      border-radius: 0.25rem;
      font-family: ui-monospace, SFMono-Regular, monospace;
      font-size: 0.875rem;
      color: ${themeColors.primary};
    }
    .document-preview pre {
      background: rgba(17, 24, 39, 0.8);
      padding: 1rem;
      border-radius: 0.5rem;
      overflow-x: auto;
      margin: 1rem 0;
      border-left: 4px solid ${themeColors.primary};
    }
    .document-preview pre code {
      background: none;
      padding: 0;
      color: #e5e7eb;
    }
    .document-preview ul {
      margin: 0.75rem 0;
      padding-left: 1.5rem;
    }
    .document-preview li {
      margin: 0.25rem 0;
      list-style-type: disc;
    }
    .document-preview blockquote {
      border-left: 4px solid ${themeColors.primary};
      padding-left: 1rem;
      margin: 1rem 0;
      font-style: italic;
      color: #d1d5db;
      background: rgba(55, 65, 81, 0.2);
      padding: 0.75rem 1rem;
      border-radius: 0 0.5rem 0.5rem 0;
    }
    .document-preview a {
      color: ${themeColors.primary};
      text-decoration: underline;
    }
    .document-preview a:hover {
      opacity: 0.8;
    }
  `;

  return (
    <div className="h-full overflow-y-auto p-6 analytics-scrollbar">
      <style>{previewStyles}</style>
      <div className="max-w-4xl mx-auto">
        {format === 'markdown' ? (
          <div 
            className="document-preview"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
          />
        ) : (
          <div className="document-preview">
            <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
              {content}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
