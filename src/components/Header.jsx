import { useCallback, useEffect } from 'react';
import { Flame, Sun, Moon } from 'lucide-react';

import { useTheme } from '../contexts/ThemeContext';
import { useToast } from './ui/ToastProvider';
import SearchPlaceholder from './search/SearchPlaceholder';

import './Header.css';

const resolveShortcutElement = (target) => {
  if (!target || typeof target !== 'object') {
    return null;
  }

  if (typeof Node !== 'undefined' && target instanceof Node) {
    if (target.nodeType === Node.TEXT_NODE) {
      return target.parentElement || null;
    }

    if (target instanceof Element) {
      return target;
    }
  }

  return null;
};

const shouldSkipShortcut = (target) => {
  const element = resolveShortcutElement(target);
  if (!element) {
    return false;
  }

  const tagName = element.tagName || '';
  if (/^(INPUT|TEXTAREA|SELECT)$/i.test(tagName)) {
    return true;
  }

  if (element.isContentEditable) {
    return true;
  }

  if (element.closest('[contenteditable="true"]')) {
    return true;
  }

  const markdownContainer = element.closest('.mdx-editor');
  if (markdownContainer) {
    const editableSurface = markdownContainer.querySelector(
      '[data-lexical-editor], [contenteditable="true"]'
    );

    if (editableSurface && editableSurface.contains(element)) {
      return true;
    }
  }

  return false;
};

const Header = ({ currentStreak }) => {
  const { theme, cycle } = useTheme();
  const { show } = useToast();

  const handleSearchShortcut = useCallback(
    (event) => {
      if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      if (shouldSkipShortcut(event.target)) {
        return;
      }

      event.preventDefault();

      if (typeof document === 'undefined') {
        return;
      }

      const input = document.getElementById('global-search-input');
      if (input) {
        input.focus();
        show('Search focused — search not yet implemented', 'info', 1500);
      }
    },
    [show]
  );

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    window.addEventListener('keydown', handleSearchShortcut);
    return () => window.removeEventListener('keydown', handleSearchShortcut);
  }, [handleSearchShortcut]);

  return (
    <header className="header">
      <div className="header__inner">
        <div className="header__left">
          {currentStreak > 0 && (
            <div className="header__streakBadge">
              <Flame size={14} strokeWidth={2} />
              <span>{currentStreak} Day Streak</span>
            </div>
          )}
        </div>

        <div className="header__search">
          <div className="header__searchInner">
            <SearchPlaceholder />
          </div>
        </div>

        <div className="header__right">
          <button
            type="button"
            onClick={cycle}
            className="header__button header__iconButton"
            title={`Theme: ${theme}`}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={14} strokeWidth={2} /> : <Moon size={14} strokeWidth={2} />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;