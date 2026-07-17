import { useQuery } from '@tanstack/react-query';
import { searchApi } from '@/features/search/api/searchApi';

export function useSearch(q: string) {
  return useQuery({
    queryKey: ['search', q],
    queryFn: () => searchApi.search(q),
    enabled: q.trim().length >= 2,
  });
}
