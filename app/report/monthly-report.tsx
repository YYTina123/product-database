"use client";

import { useSyncExternalStore } from "react";
import { useExpenses } from "../expenses-store";
import { currency, localDate, useProducts } from "../products-store";

const compact = new Intl.NumberFormat("zh-TW", { notation: "compact" });
const number = new Intl.NumberFormat("zh-TW");
const percent = new Intl.NumberFormat("zh-TW", { style: "percent", maximumFractionDigits: 1 });

const noopSubscribe = () => () => {};

const sales = (p: { price: number; quantity: number }) => p.price * p.quantity;

const PIE_COLORS = ["--pie-1", "--pie-2", "--pie-3", "--pie-4", "--pie-5", "--pie-6"].map(
  (v) => `var(${v})`,
);

// 讓座標軸刻度落在 1/2/5 × 10^n 的整數上，並預留空間給數值標籤
function niceAxis(max: number, ticks = 4) {
  const raw = (Math.max(max, 1) * 1.15) / ticks;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const norm = raw / mag;
  const step = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10) * mag;
  const top = step * Math.ceil((Math.max(max, 1) * 1.15) / step);
  return { top, ticks: Array.from({ length: Math.round(top / step) + 1 }, (_, i) => i * step) };
}

type Datum = { label: string; value: number };

function Panel({
  title,
  badge,
  className = "",
  children,
}: {
  title?: string;
  badge?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`relative border border-sheet-border bg-background p-3 ${className}`}>
      {title && <h3 className="text-center text-sm font-medium">{title}</h3>}
      {badge && <div className="mt-1 text-center">{badge}</div>}
      {children}
    </div>
  );
}

function SheetTable({ head, rows, total }: { head: string[]; rows: string[][]; total: string[] }) {
  return (
    <table className="w-full border-separate border-spacing-[2px] text-sm tabular-nums">
      <thead>
        <tr>
          {head.map((h) => (
            <th key={h} className="bg-sheet-header px-2 py-1.5 font-semibold whitespace-nowrap text-white">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={r[0]} className={i % 2 ? "bg-sheet-cell-alt" : "bg-sheet-cell"}>
            {r.map((c, j) => (
              <td
                key={j}
                className={`px-2 py-1.5 ${j === 0 ? "max-w-28 truncate text-center font-semibold" : "text-right"}`}
                title={j === 0 ? c : undefined}
              >
                {c}
              </td>
            ))}
          </tr>
        ))}
        <tr className="font-bold">
          {total.map((c, j) => (
            <td key={j} className={`px-2 py-1.5 ${j === 0 ? "text-center" : "text-right"}`}>
              {c}
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  );
}

// 分組長條圖：每個類別（月份）並排顯示多個數列
function ColumnChart({
  series,
  data,
}: {
  series: { name: string; color: string }[];
  data: { label: string; values: number[] }[];
}) {
  const { top, ticks } = niceAxis(Math.max(...data.flatMap((d) => d.values)));
  return (
    <div className="mt-3">
      <div className="flex h-48 gap-2">
        <div className="relative w-10 shrink-0 text-right text-[11px] tabular-nums text-chart-muted">
          {ticks.map((t) => (
            <span
              key={t}
              className="absolute right-0"
              style={{ bottom: `${(t / top) * 100}%`, transform: "translateY(50%)" }}
            >
              {compact.format(t)}
            </span>
          ))}
        </div>
        <div className="relative flex-1">
          {ticks.map((t) => (
            <div
              key={t}
              className={`absolute inset-x-0 border-t ${t === 0 ? "border-chart-baseline" : "border-chart-grid"}`}
              style={{ bottom: `${(t / top) * 100}%` }}
            />
          ))}
          <div className="absolute inset-0 flex">
            {data.map((d) => (
              <div key={d.label} className="flex flex-1 items-end justify-center gap-1">
                {d.values.map((v, i) => (
                  <div key={series[i].name} className="flex h-full w-1/4 max-w-8 flex-col items-center justify-end">
                    <span className="mb-1 whitespace-nowrap text-[10px] font-medium tabular-nums">{compact.format(v)}</span>
                    <div
                      className="w-full"
                      style={{ height: `${(v / top) * 100}%`, background: series[i].color }}
                      title={`${d.label} ${series[i].name} ${currency.format(v)}`}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="ml-12 mt-1 flex text-xs text-chart-muted">
        {data.map((d) => (
          <span key={d.label} className="flex-1 text-center">
            {d.label}
          </span>
        ))}
      </div>
      <Legend items={series.map((s) => ({ label: s.name, color: s.color }))} />
    </div>
  );
}

// 橫條圖；負值（虧損）不畫長條，只以紅字標示數值
function BarChart({ data }: { data: Datum[] }) {
  const { top, ticks } = niceAxis(Math.max(...data.map((d) => d.value)));
  return (
    <div className="mt-3">
      <div className="flex h-48 gap-2">
        <div className="flex w-10 shrink-0 flex-col justify-around text-right text-xs text-chart-muted">
          {data.map((d) => (
            <span key={d.label}>{d.label}</span>
          ))}
        </div>
        <div className="relative flex-1">
          {ticks.map((t) => (
            <div
              key={t}
              className={`absolute inset-y-0 border-l ${t === 0 ? "border-chart-baseline" : "border-chart-grid"}`}
              style={{ left: `${(t / top) * 100}%` }}
            />
          ))}
          <div className="absolute inset-0 flex flex-col justify-around">
            {data.map((d) => (
              <div key={d.label} className="flex items-center gap-1">
                <div
                  className="h-6 bg-sheet-header"
                  style={{ width: `${(Math.max(d.value, 0) / top) * 100}%` }}
                  title={`${d.label} ${number.format(d.value)}`}
                />
                <span
                  className={`border border-sheet-border bg-background px-1 text-[11px] tabular-nums ${
                    d.value < 0 ? "text-delta-down" : ""
                  }`}
                >
                  {number.format(d.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="relative ml-12 mt-1 h-4 text-[11px] tabular-nums text-chart-muted">
        {ticks.map((t) => (
          <span
            key={t}
            className="absolute"
            style={{ left: `${(t / top) * 100}%`, transform: "translateX(-50%)" }}
          >
            {compact.format(t)}
          </span>
        ))}
      </div>
    </div>
  );
}

function Legend({ items }: { items: { label: string; color: string }[] }) {
  return (
    <ul className="mt-2 flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs text-chart-muted">
      {items.map((it) => (
        <li key={it.label} className="flex items-center gap-1">
          <span className="size-2 rounded-full" style={{ background: it.color }} />
          {it.label}
        </li>
      ))}
    </ul>
  );
}

function PieChart({ data }: { data: Datum[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const cx = 170;
  const cy = 115;
  const r = 80;
  const point = (a: number, radius: number) => [cx + radius * Math.sin(a), cy - radius * Math.cos(a)];
  const slices = data.map((d, i) => {
    const angle = (d.value / total) * Math.PI * 2;
    const a0 = (data.slice(0, i).reduce((s, x) => s + x.value, 0) / total) * Math.PI * 2;
    const a1 = a0 + angle;
    const [x0, y0] = point(a0, r);
    const [x1, y1] = point(a1, r);
    const [lx, ly] = point((a0 + a1) / 2, r + 14);
    const path =
      data.length === 1
        ? null
        : `M${cx},${cy} L${x0},${y0} A${r},${r} 0 ${angle > Math.PI ? 1 : 0} 1 ${x1},${y1} Z`;
    return { ...d, color: PIE_COLORS[i % PIE_COLORS.length], path, lx, ly, share: d.value / total };
  });

  return (
    <>
      <svg viewBox="0 0 340 230" className="mx-auto mt-2 w-full max-w-sm" role="img" aria-label="客戶銷售額占比">
        {slices.map((s) =>
          s.path ? (
            <path key={s.label} d={s.path} fill={s.color} stroke="var(--background)" strokeWidth={1.5}>
              <title>{`${s.label} ${currency.format(s.value)}`}</title>
            </path>
          ) : (
            <circle key={s.label} cx={cx} cy={cy} r={r} fill={s.color} />
          ),
        )}
        {slices
          .filter((s) => s.share >= 0.03)
          .map((s) => {
            const anchor = s.lx > cx + 4 ? "start" : s.lx < cx - 4 ? "end" : "middle";
            return (
              <text key={s.label} x={s.lx} y={s.ly} textAnchor={anchor} className="fill-chart-muted text-[10px]">
                <tspan x={s.lx}>{s.label}</tspan>
                <tspan x={s.lx} dy="1.2em">
                  {percent.format(s.share)}
                </tspan>
              </text>
            );
          })}
      </svg>
      <Legend items={slices} />
    </>
  );
}

function DonutChart({ data }: { data: Datum[] }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const items = data.map((d, i) => ({
    ...d,
    color: PIE_COLORS[i % 2 ? 1 : 0],
    share: (d.value / total) * 100,
    offset: (data.slice(0, i).reduce((s, x) => s + x.value, 0) / total) * 100,
  }));
  return (
    <>
      <svg viewBox="0 0 240 230" className="mx-auto mt-2 w-full max-w-60" role="img" aria-label="收入與支出">
        {items.map((d) => {
          return (
            <circle
              key={d.label}
              cx={120}
              cy={115}
              r={78}
              fill="none"
              stroke={d.color}
              strokeWidth={30}
              pathLength={100}
              strokeDasharray={`${d.share} ${100 - d.share}`}
              strokeDashoffset={-d.offset}
              transform="rotate(-90 120 115)"
            >
              <title>{`${d.label} ${currency.format(d.value)}`}</title>
            </circle>
          );
        })}
      </svg>
      <Legend items={items} />
    </>
  );
}

export default function MonthlyReport() {
  const products = useProducts();
  const expenses = useExpenses();
  // 今天日期只在瀏覽器取得（資料也只存在瀏覽器），伺服器端預渲染時為 null
  const today = useSyncExternalStore(noopSubscribe, () => localDate(), () => null);
  if (!today) return <section aria-label="銷售報表每月資料匯報" className="h-[48rem]" />;

  const now = new Date(`${today}T00:00:00`);
  const year = now.getFullYear();
  const month = now.getMonth();
  const todayDay = now.getDate();

  // 近三個月（含本月）
  const months = [2, 1, 0].map((back) => {
    const d = new Date(year, month - back, 1);
    const prefix = localDate(d).slice(0, 7);
    const income = products
      .filter((p) => p.date.startsWith(prefix))
      .reduce((s, p) => s + sales(p), 0);
    const expense = expenses
      .filter((x) => x.date.startsWith(prefix))
      .reduce((s, x) => s + x.amount, 0);
    return { label: `${d.getMonth() + 1} 月`, sales: income, expense, profit: income - expense };
  });
  const periodStart = localDate(new Date(year, month - 2, 1));
  const inPeriod = products.filter((p) => p.date >= periodStart && p.date <= today);
  const periodTotal = inPeriod.reduce((s, p) => s + sales(p), 0);
  const periodExpense = months.reduce((s, m) => s + m.expense, 0);
  const periodProfit = periodTotal - periodExpense;

  // 客戶占比：前 5 名，其餘併入「其他」
  const byCustomer = new Map<string, number>();
  for (const p of inPeriod) byCustomer.set(p.customer, (byCustomer.get(p.customer) ?? 0) + sales(p));
  const ranked = [...byCustomer].sort((a, b) => b[1] - a[1]);
  const customers: Datum[] = ranked.slice(0, 5).map(([label, value]) => ({ label, value }));
  const others = ranked.slice(5).reduce((s, [, v]) => s + v, 0);
  if (others > 0) customers.push({ label: "其他", value: others });

  // 與上月同期（1 號到今天同一天）比較，避免拿未過完的月份比整個月
  const thisMonth = months[2].sales;
  const lastPrefix = localDate(new Date(year, month - 1, 1)).slice(0, 7);
  const lastSamePeriod = products
    .filter((p) => p.date.startsWith(lastPrefix) && Number(p.date.slice(8, 10)) <= todayDay)
    .reduce((s, p) => s + sales(p), 0);
  const delta = lastSamePeriod > 0 ? (thisMonth - lastSamePeriod) / lastSamePeriod : null;

  return (
    <section aria-label="銷售報表每月資料匯報" className="flex flex-col gap-4">
      <div className="rounded-lg bg-sheet-band px-4 py-6 text-center">
        <p className="text-3xl font-semibold tracking-widest text-sheet-header sm:text-4xl">銷售報告每月數據</p>
        <p className="mt-1 text-sm text-chart-muted">
          {months[0].label} 1 日 – {months[2].label} {todayDay} 日 · {year} 年
        </p>
        <p className="mt-1 text-sm">
          {delta === null ? (
            <span className="text-chart-muted">本月銷售額：上月同期無資料可比較</span>
          ) : (
            <>
              <span className="text-chart-muted">本月銷售額較上月同期 </span>
              <span className={delta >= 0 ? "text-delta-up" : "text-delta-down"}>
                {delta >= 0 ? "▲ +" : "▼ "}
                {(delta * 100).toFixed(1)}%
              </span>
            </>
          )}
        </p>
      </div>

      {inPeriod.length === 0 && periodExpense === 0 ? (
        <p className="rounded-lg border border-sheet-border p-6 text-sm text-chart-muted">近三個月尚無銷售資料</p>
      ) : (
        <div className="border border-sheet-border bg-chart-surface p-4">
          <div className="grid gap-6 lg:grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)]">
            <div>
              <h2 className="mb-1 text-lg font-bold">銷售報表每月資料匯報</h2>
              <SheetTable
                head={["月", "銷售額", "支出", "利潤"]}
                rows={months.map((m) => [
                  m.label,
                  number.format(m.sales),
                  number.format(m.expense),
                  number.format(m.profit),
                ])}
                total={[
                  "合計",
                  number.format(periodTotal),
                  number.format(periodExpense),
                  number.format(periodProfit),
                ]}
              />
            </div>
            <Panel title="每月收入與支出">
              <ColumnChart
                series={[
                  { name: "銷售額", color: PIE_COLORS[0] },
                  { name: "支出", color: PIE_COLORS[1] },
                ]}
                data={months.map((m) => ({ label: m.label, values: [m.sales, m.expense] }))}
              />
            </Panel>
            <Panel title="每月利潤">
              <BarChart data={months.map((m) => ({ label: m.label, value: m.profit }))} />
            </Panel>

            <div>
              <SheetTable
                head={["客戶", "銷售額"]}
                rows={customers.map((c) => [c.label, number.format(c.value)])}
                total={["合計", number.format(periodTotal)]}
              />
            </div>
            <Panel title="客戶銷售額占比">
              <PieChart data={customers} />
            </Panel>
            <Panel
              title="收入與支出"
              badge={
                <span className="inline-block rounded-full bg-sheet-gold px-3 py-0.5 text-xs font-bold text-zinc-900">
                  利潤：{currency.format(periodProfit)}
                </span>
              }
            >
              <DonutChart
                data={[
                  { label: `銷售額 ${currency.format(periodTotal)}`, value: periodTotal },
                  { label: `支出 ${currency.format(periodExpense)}`, value: periodExpense },
                ]}
              />
            </Panel>
          </div>
        </div>
      )}
    </section>
  );
}
