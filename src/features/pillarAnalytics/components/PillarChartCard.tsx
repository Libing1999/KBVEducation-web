import { useMemo, useState } from 'react';
import { Download, Table2 } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/format';
import { downloadCsv } from '@/features/pillarAnalytics/csv';
import type { ChartPoint, PillarChart } from '@/features/pillarAnalytics/types/pillarAnalytics.types';

/*
 * Colours (dataviz reference palette, light surface). Categorical hues go in this fixed order,
 * never cycled past eight; ordered scales use one hue light -> dark; states use the status colours
 * and always come with their name in the legend and tooltip.
 */
const CATEGORICAL = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#6250d6', '#e34948'];
const NAMED: Record<string, string> = {
  // Topic depth: one blue ramp, light (touched) -> dark (secure).
  touched: '#86b6ef',
  practised: '#3987e5',
  secure: '#1c5cab',
  // Homework status.
  'On time': '#0ca30c',
  Late: '#fab219',
  'Not submitted': '#d03b3b',
};
const GRID = '#e2e8f0';
const TICK = { fontSize: 12, fill: '#64748b' };

/** One row per x value (a day, a session or a category); each series is a column. */
interface Row {
  x: string;
  points: Record<string, ChartPoint>;
  [series: string]: unknown;
}

export interface ChartClick {
  chart: PillarChart;
  x: string;
  points: Record<string, ChartPoint>;
}

function isDate(x: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(x);
}

function fmtX(x: string) {
  return isDate(x) ? formatDate(x) : x;
}

function fmtValue(v: number, unit: string) {
  const n = Number.isInteger(v) ? String(v) : v.toFixed(1);
  if (!unit) return n;
  return unit.startsWith('%') ? `${n}${unit}` : `${n} ${unit}`;
}

function seriesColor(name: string, index: number) {
  return NAMED[name] ?? CATEGORICAL[index] ?? '#94a3b8';
}

function buildRows(chart: PillarChart): Row[] {
  const perItem = chart.series.some((s) => s.points.some((p) => p.refId));
  if (perItem || chart.kind === 'bar') {
    if (chart.kind === 'bar') {
      // Categories are already in order and shared by every series.
      const byX = new Map<string, Row>();
      chart.series.forEach((s) =>
        s.points.forEach((p) => {
          const row = byX.get(p.x) ?? { x: p.x, points: {} };
          row[s.name] = p.value;
          row.points[s.name] = p;
          byX.set(p.x, row);
        }),
      );
      return [...byX.values()];
    }
    // One row per session or submission, in date order (several can share a day).
    return chart.series
      .flatMap((s) => s.points.map((p) => ({ x: p.x, [s.name]: p.value, points: { [s.name]: p } }) as Row))
      .sort((a, b) => a.x.localeCompare(b.x));
  }
  const byDay = new Map<string, Row>();
  chart.series.forEach((s) =>
    s.points.forEach((p) => {
      const row = byDay.get(p.x) ?? { x: p.x, points: {} };
      row[s.name] = p.value;
      row.points[s.name] = p;
      byDay.set(p.x, row);
    }),
  );
  return [...byDay.values()].sort((a, b) => a.x.localeCompare(b.x));
}

/** A point opens its item (one student) or the students behind it (a group; pointless for one student). */
function canClick(chart: PillarChart, row: Row | undefined, single: boolean) {
  if (!row || chart.kind !== 'line') return false;
  return Object.values(row.points).some(
    (p) => (p.refId && chart.drill !== 'none') || (!single && (p.contributors?.length ?? 0) > 0),
  );
}

/** Legend text stays in text colour; the swatch beside it carries the series colour. */
const legendText = (value: string) => <span style={{ color: '#475569' }}>{value}</span>;

export function PillarChartCard({
  chart,
  single,
  onPointClick,
}: {
  chart: PillarChart;
  single: boolean;
  onPointClick: (c: ChartClick) => void;
}) {
  const [showTable, setShowTable] = useState(false);
  const rows = useMemo(() => buildRows(chart), [chart]);
  const names = chart.series.map((s) => s.name);
  const multi = names.length > 1;
  const empty = rows.length === 0 || rows.every((r) => names.every((n) => !r[n]));
  const clickable = rows.some((r) => canClick(chart, r, single));
  const subtitle =
    chart.kind === 'line'
      ? [
          rows.some((r) => Object.values(r.points).some((p) => p.refId))
            ? 'One point per item'
            : chart.aggregation === 'sum'
              ? 'Daily total'
              : 'Daily average',
          clickable ? 'click a point to go one level down' : null,
        ]
          .filter(Boolean)
          .join(' · ')
      : chart.aggregation === 'avg'
        ? 'Averages for the chosen dates'
        : chart.stacked
          ? 'Totals for the chosen dates, stacked'
          : 'Totals for the chosen dates';
  // Percentages always use the full 0 to 100 scale, so 60% never looks like a full bar.
  const domain: [number, number] | undefined = chart.unit.startsWith('%') ? [0, 100] : undefined;

  const exportCsv = () =>
    downloadCsv(
      `${chart.key}.csv`,
      [chart.kind === 'line' ? 'Date' : 'Category', ...names, ...(rows.some((r) => labelOf(r)) ? ['Exact value'] : [])],
      rows.map((r) => [
        r.x,
        ...names.map((n) => (r[n] as number | undefined) ?? ''),
        ...(rows.some((x) => labelOf(x)) ? [labelOf(r)] : []),
      ]),
    );

  const handleClick = (state: { activeTooltipIndex?: number | string | null | undefined }) => {
    const i = state?.activeTooltipIndex;
    if (i == null) return;
    const row = rows[Number(i)];
    if (canClick(chart, row, single)) onPointClick({ chart, x: row.x, points: row.points });
  };

  const height = chart.kind === 'bar' && !isDate(rows[0]?.x ?? '') ? Math.max(220, Math.min(rows.length, 20) * 30 + 40) : 260;
  const horizontal = chart.kind === 'bar' && rows.length > 7;
  // Fewer categories leave more room for each name under its bar.
  const tickChars = rows.length <= 3 ? 30 : rows.length <= 5 ? 20 : 12;

  return (
    <Card>
      <CardHeader
        title={chart.title}
        subtitle={subtitle}
        action={
          !empty && (
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={() => setShowTable((v) => !v)} title="Show the numbers as a table">
                <Table2 className="h-4 w-4" /> {showTable ? 'Hide table' : 'Table'}
              </Button>
              <Button variant="ghost" size="sm" onClick={exportCsv} title="Download as CSV">
                <Download className="h-4 w-4" /> CSV
              </Button>
            </div>
          )
        }
      />
      <CardBody>
        {empty ? (
          <p className="py-10 text-center text-sm text-slate-500">Nothing in these dates.</p>
        ) : (
          <ResponsiveContainer width="100%" height={horizontal ? height : 260}>
            {chart.kind === 'line' ? (
              <LineChart data={rows} margin={{ top: 8, right: 12, left: 0, bottom: 0 }} onClick={handleClick}
                style={{ cursor: clickable ? 'pointer' : undefined }}>
                <CartesianGrid stroke={GRID} vertical={false} />
                <XAxis dataKey="x" tickFormatter={fmtX} tick={TICK} axisLine={{ stroke: GRID }} tickLine={false} minTickGap={24} />
                <YAxis tick={TICK} axisLine={false} tickLine={false} width={44} allowDecimals={chart.aggregation !== 'sum'} domain={domain} />
                <Tooltip content={(p) => <ChartTooltip active={p.active} label={p.label} payload={p.payload as unknown as TipEntry[]} chart={chart} clickable={clickable} single={single} />} />
                {multi && <Legend itemSorter={null} formatter={legendText} wrapperStyle={{ fontSize: 12 }} iconType="plainline" />}
                {names.map((n, i) => (
                  <Line
                    key={n}
                    type="linear"
                    dataKey={n}
                    name={n}
                    stroke={seriesColor(n, i)}
                    strokeWidth={2}
                    connectNulls
                    isAnimationActive={false}
                    dot={{ r: 4, fill: seriesColor(n, i), stroke: '#fff', strokeWidth: 2 }}
                    activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
                  />
                ))}
              </LineChart>
            ) : (
              <BarChart
                data={rows}
                layout={horizontal ? 'vertical' : 'horizontal'}
                margin={{ top: 8, right: 12, left: horizontal ? 8 : 0, bottom: 0 }}
                barCategoryGap={horizontal ? 6 : '20%'}
              >
                <CartesianGrid stroke={GRID} horizontal={!horizontal} vertical={horizontal} />
                {horizontal ? (
                  <>
                    <XAxis type="number" tick={TICK} axisLine={false} tickLine={false} allowDecimals={chart.aggregation !== 'sum'} domain={domain} />
                    <YAxis type="category" dataKey="x" tick={TICK} axisLine={false} tickLine={false} width={160}
                      tickFormatter={(v: string) => (v.length > 24 ? `${v.slice(0, 23)}…` : v)} />
                  </>
                ) : (
                  <>
                    <XAxis dataKey="x" tick={TICK} axisLine={{ stroke: GRID }} tickLine={false} interval={0}
                      tickFormatter={(v: string) => (v.length > tickChars ? `${v.slice(0, tickChars - 1)}…` : v)} />
                    <YAxis tick={TICK} axisLine={false} tickLine={false} width={44} allowDecimals={chart.aggregation !== 'sum'} domain={domain} />
                  </>
                )}
                <Tooltip cursor={{ fill: '#f1f5f9' }} content={(p) => <ChartTooltip active={p.active} label={p.label} payload={p.payload as unknown as TipEntry[]} chart={chart} clickable={false} single={single} />} />
                {multi && <Legend itemSorter={null} formatter={legendText} wrapperStyle={{ fontSize: 12 }} />}
                {names.map((n, i) => (
                  <Bar
                    key={n}
                    dataKey={n}
                    name={n}
                    stackId={chart.stacked ? 'stack' : undefined}
                    fill={seriesColor(n, i)}
                    stroke="#fff"
                    strokeWidth={chart.stacked ? 1 : 0}
                    isAnimationActive={false}
                    maxBarSize={horizontal ? 18 : 40}
                    radius={!chart.stacked || i === names.length - 1 ? (horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]) : 0}
                  />
                ))}
              </BarChart>
            )}
          </ResponsiveContainer>
        )}
        {showTable && !empty && (
          <div className="mt-4 max-h-80 overflow-auto rounded-lg border border-slate-200">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-slate-50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-slate-600">{chart.kind === 'line' ? 'Date' : 'Category'}</th>
                  {names.map((n) => (
                    <th key={n} className="px-3 py-2 text-right font-medium text-slate-600">{multi ? n : 'Value'}</th>
                  ))}
                  {rows.some((r) => labelOf(r)) && <th className="px-3 py-2 text-left font-medium text-slate-600">Exact value</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((r, i) => (
                  <tr key={`${r.x}-${i}`}>
                    <td className="px-3 py-1.5 text-slate-700">{fmtX(r.x)}</td>
                    {names.map((n) => (
                      <td key={n} className="px-3 py-1.5 text-right tabular-nums text-slate-800">
                        {r[n] == null ? '—' : fmtValue(r[n] as number, chart.unit)}
                      </td>
                    ))}
                    {rows.some((x) => labelOf(x)) && <td className="px-3 py-1.5 text-slate-600">{labelOf(r)}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

interface TipEntry {
  name?: string | number;
  value?: number | string;
  color?: string;
  payload?: unknown;
}

function labelOf(r: Row) {
  return Object.values(r.points)
    .map((p) => p.label)
    .filter(Boolean)
    .join('; ');
}

function ChartTooltip({
  active,
  label,
  payload,
  chart,
  clickable,
  single,
}: {
  active?: boolean;
  label?: unknown;
  payload?: TipEntry[];
  chart: PillarChart;
  clickable: boolean;
  single: boolean;
}) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload as Row | undefined;
  if (!row) return null;
  const group = Object.values(row.points).some((p) => (p.contributors?.length ?? 0) > 0);
  const students = new Set(Object.values(row.points).flatMap((p) => p.contributors?.map((c) => c.studentId) ?? []));
  return (
    <div className="max-w-xs rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-lg">
      <p className="mb-1 font-medium text-slate-800">{fmtX(String(label ?? row.x))}</p>
      {payload.map((p) => {
        const point = row.points[String(p.name)];
        return (
          <div key={String(p.name)} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: p.color }} aria-hidden />
            {payload.length > 1 && <span className="text-slate-600">{p.name}:</span>}
            <span className="font-semibold tabular-nums text-slate-900">{fmtValue(Number(p.value), chart.unit)}</span>
            {point?.label && <span className="truncate text-slate-500">({point.label})</span>}
          </div>
        );
      })}
      {group && (
        <p className="mt-1 text-xs text-slate-500">
          {chart.aggregation === 'sum' ? 'Total' : 'Average'} of {students.size} student{students.size === 1 ? '' : 's'}
        </p>
      )}
      {clickable && canClick(chart, row, single) && (
        <p className="mt-1 text-xs text-primary">Click to {group ? 'see the students' : 'open it'}</p>
      )}
    </div>
  );
}
