import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDebounce } from '@/hooks/useDebounce';

/**
 * Common list-page state: current page + a debounced search term. Resets to the
 * first page whenever the search term changes.
 *
 * A `?search=` URL param seeds the search box (and re-applies if the param
 * changes while the page is already mounted) — this is what lets Global
 * Search deep-link a pre-filtered list. The param is read-only here; typing
 * in the box deliberately does not write state back into the URL.
 */
export function useTableControls() {
  const [searchParams] = useSearchParams();
  const urlSearch = searchParams.get('search');

  const [page, setPage] = useState(0);
  const [search, setSearch] = useState(urlSearch ?? '');
  const debouncedSearch = useDebounce(search, 350);

  useEffect(() => {
    if (urlSearch !== null) {
      setSearch(urlSearch);
    }
  }, [urlSearch]);

  useEffect(() => {
    setPage(0);
  }, [debouncedSearch]);

  return { page, setPage, search, setSearch, debouncedSearch };
}
