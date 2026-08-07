import { useQuery } from '@tanstack/react-query';
import { subjectsApi } from '@/features/subjects/api/subjectsApi';
import { QUERY_KEYS } from '@/config/constants';

/** Active subjects, sorted for display — feeds the practice log Subject dropdown. */
export function useActiveSubjects() {
  return useQuery({
    queryKey: [...QUERY_KEYS.subjects, 'active'],
    queryFn: () => subjectsApi.listActive(),
  });
}
