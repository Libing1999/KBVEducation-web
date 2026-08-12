import { useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from '@/hooks/useDebounce';
import { useSearch } from '@/features/search/hooks/useSearch';
import { entityTypeLabel } from '@/features/search/utils/entityTypeLabel';
import { resolveSearchResult } from '@/features/search/utils/searchResultRoute';
import type { SearchResultItem } from '@/features/search/types/search.types';

const MAX_DROPDOWN_RESULTS = 8;

/**
 * Modern port of GlobalSearchBar — same debounce/keyboard-nav/query logic
 * and useSearch hook as the Default UI, dark/gold styling.
 */
export function ModernGlobalSearchBar() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const debounced = useDebounce(query, 300);
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: results, isFetching } = useSearch(debounced);
  const visible = (results ?? []).slice(0, MAX_DROPDOWN_RESULTS);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  useEffect(() => {
    setActiveIndex(-1);
  }, [debounced]);

  function selectResult(result: SearchResultItem) {
    const { route } = resolveSearchResult(result);
    setOpen(false);
    setQuery('');
    setActiveIndex(-1);
    navigate(route);
  }

  function goToResults() {
    if (query.trim().length >= 2) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setOpen(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') {
      setOpen(false);
      setActiveIndex(-1);
      return;
    }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!open) setOpen(true);
      if (visible.length === 0) return;
      setActiveIndex((prev) => {
        const delta = e.key === 'ArrowDown' ? 1 : -1;
        return (prev + delta + visible.length) % visible.length;
      });
      return;
    }
    if (e.key === 'Enter') {
      const active = visible[activeIndex];
      if (open && active) {
        selectResult(active);
      } else {
        goToResults();
      }
    }
  }

  const dropdownOpen = open && debounced.trim().length >= 2;

  return (
    <div ref={containerRef} className="relative w-full max-w-xs">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgba(238,242,249,.4)]" />
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Search students, cohorts, lessons…"
          aria-label="Global search"
          role="combobox"
          aria-expanded={dropdownOpen}
          aria-controls="modern-global-search-listbox"
          aria-autocomplete="list"
          aria-activedescendant={activeIndex >= 0 ? `modern-global-search-option-${activeIndex}` : undefined}
          className="h-9 w-full rounded-full border border-[rgba(238,242,249,.15)] bg-[#0A1424] pl-9 pr-8 text-sm text-[#EEF2F9] placeholder:text-[rgba(238,242,249,.35)] focus:border-[#B0821C] focus:outline-none focus:ring-2 focus:ring-[#B0821C]/30"
        />
        {query && (
          <button
            type="button"
            onClick={() => { setQuery(''); setOpen(false); setActiveIndex(-1); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-[rgba(238,242,249,.4)] hover:text-[rgba(238,242,249,.8)]"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {dropdownOpen && (
        <div className="absolute left-0 right-0 top-11 z-50 max-h-96 overflow-y-auto rounded-xl border border-[rgba(238,242,249,.12)] bg-[#0C1526] shadow-2xl">
          {isFetching ? (
            <p className="p-4 text-sm text-[rgba(238,242,249,.55)]">Searching…</p>
          ) : visible.length === 0 ? (
            <p className="p-4 text-sm text-[rgba(238,242,249,.55)]">No results for "{debounced}".</p>
          ) : (
            <>
              <ul id="modern-global-search-listbox" role="listbox" className="divide-y divide-[rgba(238,242,249,.08)]">
                {visible.map((r, i) => {
                  const { icon: Icon } = resolveSearchResult(r);
                  return (
                    <li
                      key={`${r.entityType}-${r.id}`}
                      id={`modern-global-search-option-${i}`}
                      role="option"
                      aria-selected={i === activeIndex}
                    >
                      <button
                        type="button"
                        onClick={() => selectResult(r)}
                        onMouseMove={() => setActiveIndex(i)}
                        className={`flex w-full items-center gap-3 px-4 py-2.5 text-left ${
                          i === activeIndex ? 'bg-white/[.06]' : ''
                        }`}
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[.06] text-[#DBB652]">
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium text-[#EEF2F9]">{r.title}</span>
                          <span className="block truncate text-xs text-[rgba(238,242,249,.5)]">
                            {entityTypeLabel(r.entityType)}
                            {r.subtitle ? ` · ${r.subtitle}` : ''}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              <button
                type="button"
                onClick={goToResults}
                className="block w-full border-t border-[rgba(238,242,249,.08)] p-2.5 text-center text-xs font-medium text-[#DBB652] hover:bg-white/[.04]"
              >
                See all results
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
