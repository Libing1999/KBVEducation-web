import { useState } from 'react';
import { Download } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { downloadCsv } from '@/features/pillarAnalytics/csv';
import type { PillarTable, TableRow } from '@/features/pillarAnalytics/types/pillarAnalytics.types';

const PAGE = 50;

/** Exact values (text fields, consistency, homework status...) with a CSV download. */
export function ExactTableCard({ table, onRowOpen }: { table: PillarTable; onRowOpen: (row: TableRow) => void }) {
  const [all, setAll] = useState(false);
  const rows = all ? table.rows : table.rows.slice(0, PAGE);
  const linked = table.rows.some((r) => r.refId && r.refType && r.refType !== 'none');

  return (
    <Card>
      <CardHeader
        title={table.title}
        subtitle={`${table.rows.length} row${table.rows.length === 1 ? '' : 's'}`}
        action={
          table.rows.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => downloadCsv(`${table.key}.csv`, table.columns, table.rows.map((r) => r.cells))}
              title="Download as CSV"
            >
              <Download className="h-4 w-4" /> CSV
            </Button>
          )
        }
      />
      <CardBody className="p-0">
        {table.rows.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-slate-500">Nothing in these dates.</p>
        ) : (
          <div className="max-h-[28rem] overflow-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-slate-50">
                <tr>
                  {table.columns.map((c) => (
                    <th key={c} className="px-4 py-2 text-left font-medium text-slate-600">{c}</th>
                  ))}
                  {linked && <th className="px-4 py-2" />}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((r, i) => (
                  <tr key={`${r.refId ?? ''}-${i}`} className="align-top">
                    {r.cells.map((c, j) => (
                      <td key={j} className="max-w-md px-4 py-2 text-slate-700">{c || '—'}</td>
                    ))}
                    {linked && (
                      <td className="px-4 py-2 text-right">
                        {r.refId && r.refType && r.refType !== 'none' && (
                          <button
                            type="button"
                            onClick={() => onRowOpen(r)}
                            className="whitespace-nowrap text-sm font-medium text-primary hover:text-primary-600"
                          >
                            {r.refType === 'student' ? 'View student' : 'Open'}
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!all && table.rows.length > PAGE && (
          <div className="border-t border-slate-100 px-4 py-2 text-center">
            <Button variant="ghost" size="sm" onClick={() => setAll(true)}>Show all {table.rows.length} rows</Button>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
