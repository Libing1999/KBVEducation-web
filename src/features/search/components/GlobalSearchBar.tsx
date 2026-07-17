import { useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from '@/hooks/useDebounce';
import { useSearch } from '@/features/search/hooks/useSearch';
import { entityTypeLabel } from '@/features/search/utils/entityTypeLabel';

/** Admin-only quick search — dropdown of top matches, Enter/"See all" goes to the full results page. */
export function GlobalSearchBar() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const debounced = useDebounce(query, 300);
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: results, isFetching } = useSearch(debounced);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  function goToResults() {
    if (query.trim().length >= 2) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setOpen(false);
    }
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-xs">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => { if (e.key === 'Enter') goToResults(); }}
          placeholder="Search students, cohorts, lessons…"
          aria-label="Global search"
          className="h-9 w-full rounded-lg border border-slate-300 bg-slate-50 pl-9 pr-8 text-sm text-slate-800 placeholder:text-slate-400 focus:border-accent focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/30"
        />
        {query && (
          <button
            type="button"
            onClick={() => { setQuery(''); setOpen(false); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 hover:text-slate-600"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {open && debounced.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-11 z-50 max-h-96 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
          {isFetching ? (
            <p className="p-4 text-sm text-slate-500">Searching…</p>
          ) : !results || results.length === 0 ? (
            <p className="p-4 text-sm text-slate-500">No results for "{debounced}".</p>
          ) : (
            <>
              <ul className="divide-y divide-slate-100">
                {results.slice(0, 8).map((r) => (
                  <li key={`${r.entityType}-${r.id}`} className="px-4 py-2.5 hover:bg-slate-50">
                    <p className="truncate text-sm font-medium text-slate-800">{r.title}</p>
                    <p className="truncate text-xs text-slate-500">
                      {entityTypeLabel(r.entityType)}
                      {r.subtitle ? ` · ${r.subtitle}` : ''}
                    </p>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={goToResults}
                className="block w-full border-t border-slate-100 p-2.5 text-center text-xs font-medium text-primary hover:bg-slate-50"
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
