import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { PageHeader } from '@/components/modern/ui/PageHeader';
import { Card } from '@/components/modern/ui/Card';
import { Input } from '@/components/modern/ui/Input';
import { LoadingState } from '@/components/modern/ui/Spinner';
import { useSearch } from '@/features/search/hooks/useSearch';
import { entityTypeLabel } from '@/features/search/utils/entityTypeLabel';
import { resolveSearchResult } from '@/features/search/utils/searchResultRoute';
import type { SearchEntityType, SearchResultItem } from '@/features/search/types/search.types';

function groupByType(results: SearchResultItem[]): Map<SearchEntityType, SearchResultItem[]> {
  const groups = new Map<SearchEntityType, SearchResultItem[]>();
  for (const item of results) {
    const list = groups.get(item.entityType) ?? [];
    list.push(item);
    groups.set(item.entityType, list);
  }
  return groups;
}

/** Modern port of SearchResultsPage — same hooks/grouping logic, dark styling. */
export default function ModernSearchResultsPage() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const q = params.get('q') ?? '';
  const { data: results, isLoading } = useSearch(q);
  const groups = results ? groupByType(results) : new Map<SearchEntityType, SearchResultItem[]>();

  return (
    <div className="space-y-5">
      <PageHeader title="Search Results" subtitle="Users, cohorts, lessons, Post-Lesson Homework, Post-Lesson Quizzes, and more." />

      <Card>
        <div className="border-b border-[rgba(238,242,249,.1)] p-4">
          <Input
            className="max-w-md"
            placeholder="Search…"
            defaultValue={q}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const value = (e.target as HTMLInputElement).value.trim();
                setParams(value ? { q: value } : {});
              }
            }}
          />
        </div>

        <div className="p-4">
          {q.trim().length < 2 ? (
            <p className="text-sm text-[rgba(238,242,249,.55)]">Type at least 2 characters to search.</p>
          ) : isLoading ? (
            <LoadingState label="Searching…" />
          ) : !results || results.length === 0 ? (
            <p className="text-sm text-[rgba(238,242,249,.55)]">No results for "{q}".</p>
          ) : (
            <div className="space-y-6">
              {Array.from(groups.entries()).map(([type, items]) => (
                <div key={type}>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[rgba(238,242,249,.4)]">
                    {entityTypeLabel(type)} ({items.length})
                  </h3>
                  <ul className="divide-y divide-[rgba(238,242,249,.08)] rounded-lg border border-[rgba(238,242,249,.1)]">
                    {items.map((r) => {
                      const { route, icon: Icon } = resolveSearchResult(r);
                      return (
                        <li key={`${r.entityType}-${r.id}`}>
                          <button
                            type="button"
                            onClick={() => navigate(route)}
                            className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-white/[.04]"
                          >
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[.06] text-[#DBB652]">
                              <Icon className="h-4 w-4" />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-medium text-[#EEF2F9]">{r.title}</span>
                              {r.subtitle && (
                                <span className="block truncate text-xs text-[rgba(238,242,249,.5)]">{r.subtitle}</span>
                              )}
                            </span>
                            <ChevronRight className="h-4 w-4 shrink-0 text-[rgba(238,242,249,.3)]" aria-hidden />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
