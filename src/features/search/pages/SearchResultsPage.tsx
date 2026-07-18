import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { LoadingState } from '@/components/ui/Spinner';
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

export default function SearchResultsPage() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const q = params.get('q') ?? '';
  const { data: results, isLoading } = useSearch(q);
  const groups = results ? groupByType(results) : new Map<SearchEntityType, SearchResultItem[]>();

  return (
    <div className="space-y-5">
      <PageHeader title="Search Results" subtitle="Users, cohorts, lessons, homework, quizzes, and more." />

      <Card>
        <div className="border-b border-slate-100 p-4">
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
            <p className="text-sm text-slate-500">Type at least 2 characters to search.</p>
          ) : isLoading ? (
            <LoadingState label="Searching…" />
          ) : !results || results.length === 0 ? (
            <p className="text-sm text-slate-500">No results for "{q}".</p>
          ) : (
            <div className="space-y-6">
              {Array.from(groups.entries()).map(([type, items]) => (
                <div key={type}>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {entityTypeLabel(type)} ({items.length})
                  </h3>
                  <ul className="divide-y divide-slate-100 rounded-lg border border-slate-100">
                    {items.map((r) => {
                      const { route, icon: Icon } = resolveSearchResult(r);
                      return (
                        <li key={`${r.entityType}-${r.id}`}>
                          <button
                            type="button"
                            onClick={() => navigate(route)}
                            className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-slate-50"
                          >
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary">
                              <Icon className="h-4 w-4" />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-medium text-slate-800">{r.title}</span>
                              {r.subtitle && (
                                <span className="block truncate text-xs text-slate-500">{r.subtitle}</span>
                              )}
                            </span>
                            <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" aria-hidden />
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
