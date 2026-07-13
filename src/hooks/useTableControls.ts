import { useEffect, useState } from 'react';
import { useDebounce } from '@/hooks/useDebounce';

/**
 * Common list-page state: current page + a debounced search term. Resets to the
 * first page whenever the search term changes.
 */
export function useTableControls() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 350);

  useEffect(() => {
    setPage(0);
  }, [debouncedSearch]);

  return { page, setPage, search, setSearch, debouncedSearch };
}
