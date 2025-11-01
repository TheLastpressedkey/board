import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  FolderOpen,
  Save,
  Download,
  Users,
  Command,
  Search,
  HelpCircle,
  RotateCcw,
  Sun,
  Moon,
  Monitor,
  Languages,
  Check
} from 'lucide-react';

interface HamburgerMenuProps {
  onOpen?: () => void;
  onSave?: () => void;
  onExport?: () => void;
  onCollaboration?: () => void;
  onCommandPalette?: () => void;
  onFind?: () => void;
  onHelp?: () => void;
  onReset?: () => void;
  theme: 'light' | 'dark' | 'system';
  onThemeChange?: (theme: 'light' | 'dark' | 'system') => void;
  language: string;
  onLanguageChange?: (language: string) => void;
  bgColor: string;
  textColor: string;
  textMuted: string;
  borderColor: string;
  hoverBg: string;
}

export function HamburgerMenu({
  onOpen,
  onSave,
  onExport,
  onCollaboration,
  onCommandPalette,
  onFind,
  onHelp,
  onReset,
  theme,
  onThemeChange,
  language,
  onLanguageChange,
  bgColor,
  textColor,
  textMuted,
  borderColor,
  hoverBg
}: HamburgerMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowThemeMenu(false);
        setShowLanguageMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menuItems = [
    { icon: FolderOpen, label: 'Ouvrir', shortcut: 'Cmd+O', action: onOpen },
    { icon: Save, label: 'Enregistrer sous...', shortcut: '', action: onSave },
    { icon: Download, label: "Exporter l'image...", shortcut: 'Cmd+Shift+E', action: onExport },
    { icon: Users, label: 'Collaboration en direct...', shortcut: '', action: onCollaboration },
    { type: 'divider' },
    { icon: Command, label: 'Command palette', shortcut: 'Cmd+/', action: onCommandPalette },
    { icon: Search, label: 'Find on canvas', shortcut: 'Cmd+F', action: onFind },
    { icon: HelpCircle, label: 'Aide', shortcut: '?', action: onHelp },
    { type: 'divider' },
    { icon: RotateCcw, label: 'Réinitialiser le canvas', shortcut: '', action: onReset }
  ];

  const themeIcons = {
    light: Sun,
    dark: Moon,
    system: Monitor
  };

  const ThemeIcon = themeIcons[theme];

  const languages = [
    { code: 'fr', label: 'Français' },
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' },
    { code: 'de', label: 'Deutsch' }
  ];

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg transition-colors"
        style={{
          backgroundColor: isOpen ? hoverBg : 'transparent',
          color: textMuted
        }}
        onMouseEnter={(e) => !isOpen && (e.currentTarget.style.backgroundColor = hoverBg)}
        onMouseLeave={(e) => !isOpen && (e.currentTarget.style.backgroundColor = 'transparent')}
        title="Menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {isOpen && (
        <div
          className="absolute left-0 top-full mt-2 w-64 rounded-lg shadow-2xl z-50 py-2"
          style={{
            backgroundColor: bgColor,
            border: `1px solid ${borderColor}`
          }}
        >
          {menuItems.map((item, index) => {
            if (item.type === 'divider') {
              return (
                <div
                  key={index}
                  className="my-1"
                  style={{ height: '1px', backgroundColor: borderColor }}
                />
              );
            }

            const Icon = item.icon!;
            return (
              <button
                key={index}
                onClick={() => {
                  item.action?.();
                  setIsOpen(false);
                }}
                className="w-full px-4 py-2 flex items-center justify-between transition-colors"
                style={{ color: textColor }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = hoverBg)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{item.label}</span>
                </div>
                {item.shortcut && (
                  <span className="text-xs" style={{ color: textMuted }}>
                    {item.shortcut}
                  </span>
                )}
              </button>
            );
          })}

          <div style={{ height: '1px', backgroundColor: borderColor, margin: '4px 0' }} />

          {/* Theme submenu */}
          <div className="relative">
            <button
              onClick={() => setShowThemeMenu(!showThemeMenu)}
              className="w-full px-4 py-2 flex items-center justify-between transition-colors"
              style={{ color: textColor }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = hoverBg)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <div className="flex items-center gap-3">
                <ThemeIcon className="w-4 h-4" />
                <span className="text-sm">Thème</span>
              </div>
            </button>

            {showThemeMenu && (
              <div
                className="absolute left-full top-0 ml-1 w-40 rounded-lg shadow-2xl py-1"
                style={{
                  backgroundColor: bgColor,
                  border: `1px solid ${borderColor}`
                }}
              >
                {(['light', 'dark', 'system'] as const).map((t) => {
                  const Icon = themeIcons[t];
                  return (
                    <button
                      key={t}
                      onClick={() => {
                        onThemeChange?.(t);
                        setShowThemeMenu(false);
                        setIsOpen(false);
                      }}
                      className="w-full px-4 py-2 flex items-center gap-3 transition-colors"
                      style={{ color: textColor }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = hoverBg)}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm flex-1 text-left">
                        {t === 'light' ? 'Clair' : t === 'dark' ? 'Sombre' : 'Système'}
                      </span>
                      {theme === t && <Check className="w-4 h-4" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Language submenu */}
          <div className="relative">
            <button
              onClick={() => setShowLanguageMenu(!showLanguageMenu)}
              className="w-full px-4 py-2 flex items-center justify-between transition-colors"
              style={{ color: textColor }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = hoverBg)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <div className="flex items-center gap-3">
                <Languages className="w-4 h-4" />
                <span className="text-sm">Français</span>
              </div>
              <span className="text-xs" style={{ color: textMuted }}>▲</span>
            </button>

            {showLanguageMenu && (
              <div
                className="absolute left-full top-0 ml-1 w-40 rounded-lg shadow-2xl py-1"
                style={{
                  backgroundColor: bgColor,
                  border: `1px solid ${borderColor}`
                }}
              >
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      onLanguageChange?.(lang.code);
                      setShowLanguageMenu(false);
                      setIsOpen(false);
                    }}
                    className="w-full px-4 py-2 flex items-center justify-between transition-colors"
                    style={{ color: textColor }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = hoverBg)}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <span className="text-sm">{lang.label}</span>
                    {language === lang.code && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
