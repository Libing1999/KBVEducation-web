import { useQuery } from '@tanstack/react-query';
import { parentApi } from '@/features/parent/api/parentApi';
import { QUERY_KEYS } from '@/config/constants';

export function useParentSummary(studentId?: string) {
  return useQuery({
    queryKey: [...QUERY_KEYS.parentSummary, studentId ?? null],
    queryFn: () => parentApi.summary(studentId),
  });
}

/** The Parent screen's child selector — a parent with only one linked child never
 *  needs this rendered, but the list is fetched regardless so the screen knows. */
export function useParentChildren() {
  return useQuery({
    queryKey: QUERY_KEYS.parentChildren,
    queryFn: parentApi.children,
  });
}

/**
 * The "Messages from Bhavya" card's data source. Deliberately swallows any failure here
 * (network error, a parent not yet linked to a student, etc.) rather than surfacing it,
 * because the card's own rule is "fully present or fully absent, never a broken state"
 * (see NOTES.md) — and the main summary query above already carries the "no student
 * linked" error for the rest of the screen. retry:false avoids retry storms on a
 * genuine failure, and this call never blocks or errors out the rest of the screen.
 */
export function useParentMessages(studentId?: string) {
  return useQuery({
    queryKey: [...QUERY_KEYS.parentMessages, studentId ?? null],
    queryFn: () => parentApi.messages(studentId),
    retry: false,
    throwOnError: false,
  });
}
