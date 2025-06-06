import React from 'react';
import { Bold, Italic, Underline, List, ListOrdered, Link, Code, Quote, Heading1, Heading2, Heading3 } from 'lucide-react';

interface DocumentToolbarProps {
  onAction: {
    bold: () => void;
    italic: () => void;
    underline: () => void;
    heading1: () => void;
    heading2: () => void;
    heading3: () => void;
    bulletList: () => void;
    numberedList: () => void;
    link: () => void;
    code: () => void;
    codeBlock: () => void;
    quote: () => void;
  };
  themeColors: any;
}

export function DocumentToolbar({ onAction, themeColors }: DocumentToolbarProps) {
  const toolbarGroups = [
    {
      name: 'Titres',
      tools: [
        { icon: Heading1, action: onAction.heading1, tooltip: 'Titre 1' },
        { icon: Heading2, action: onAction.heading2, tooltip: 'Titre 2' },
        { icon: Heading3, action: onAction.heading3, tooltip: 'Titre 3' },
      ]
    },
    {
      name: 'Format',
      tools: [
        { icon: Bold, action: onAction.bold, tooltip: 'Gras (Ctrl+B)' },
        { icon: Italic, action: onAction.italic, tooltip: 'Italique (Ctrl+I)' },
        { icon: Underline, action: onAction.underline, tooltip: 'Souligné (Ctrl+U)' },
      ]
    },
    {
      name: 'Listes',
      tools: [
        { icon: List, action: onAction.bulletList, tooltip: 'Liste à puces' },
        { icon: ListOrdered, action: onAction.numberedList, tooltip: 'Liste numérotée' },
      ]
    },
    {
      name: 'Insertion',
      tools: [
        { icon: Link, action: onAction.link, tooltip: 'Lien' },
        { icon: Code, action: onAction.code, tooltip: 'Code inline' },
        { icon: Quote, action: onAction.quote, tooltip: 'Citation' },
      ]
    }
  ];

  return (
    <div 
      className="p-3 border-b border-gray-700/50 flex items-center gap-4 overflow-x-auto"
      style={{ backgroundColor: themeColors.menuBg }}
    >
      {toolbarGroups.map((group, groupIndex) => (
        <div key={group.name} className="flex items-center gap-1">
          {groupIndex > 0 && (
            <div className="w-px h-6 bg-gray-600 mx-2" />
          )}
          {group.tools.map((tool, toolIndex) => (
            <button
              key={toolIndex}
              onClick={tool.action}
              className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors group"
              title={tool.tooltip}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <tool.icon className="w-4 h-4 text-gray-400 group-hover:text-white" />
            </button>
          ))}
        </div>
      ))}

      {/* Code Block Button */}
      <div className="w-px h-6 bg-gray-600 mx-2" />
      <button
        onClick={onAction.codeBlock}
        className="px-3 py-1 text-xs bg-gray-700/50 hover:bg-gray-600/50 rounded transition-colors text-gray-300"
        title="Bloc de code"
        onMouseDown={(e) => e.stopPropagation()}
      >
        ```
      </button>
    </div>
  );
}
