"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { currency, localDate, useProducts } from "./products-store";

const MUTED_KEY = "due-dialog-muted";

const noopSubscribe = () => () => {};

function readMuted() {
  try {
    return localStorage.getItem(MUTED_KEY);
  } catch {
    return null;
  }
}

// 開啟首頁時提示今天預計出貨、但還沒填出貨日期的訂單
export default function DueTodayDialog() {
  const products = useProducts();
  // 今天日期與「今天不再提示」只在瀏覽器取得，伺服器端預渲染時為 null
  const today = useSyncExternalStore(noopSubscribe, () => localDate(), () => null);
  const muted = useSyncExternalStore(noopSubscribe, readMuted, () => null);
  const [closed, setClosed] = useState(false);

  if (!today || closed || muted === today) return null;

  const unshipped = products.filter((p) => p.shipDate && !p.shippedDate);
  const dueToday = unshipped.filter((p) => p.shipDate === today);
  const overdue = unshipped.filter((p) => p.shipDate! < today).length;
  if (dueToday.length === 0) return null;

  const mute = () => {
    try {
      localStorage.setItem(MUTED_KEY, today);
    } catch {}
    setClosed(true);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={() => setClosed(true)}
      onKeyDown={(e) => e.key === "Escape" && setClosed(true)}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="due-today-title"
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[85vh] w-full max-w-lg flex-col gap-4 rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900"
      >
        <div>
          <h2 id="due-today-title" className="text-lg font-semibold">
            📦 今天有 {dueToday.length} 筆訂單須交貨
          </h2>
          <p className="mt-1 text-sm text-zinc-500">{today}</p>
        </div>

        <ul className="flex flex-col divide-y divide-zinc-200 overflow-y-auto rounded-lg border border-zinc-200 text-sm dark:divide-zinc-800 dark:border-zinc-800">
          {dueToday.map((p) => (
            <li key={p.id} className="flex items-start justify-between gap-4 px-4 py-2">
              <div className="min-w-0">
                <p className="font-medium">{p.customer}</p>
                <p className="whitespace-pre-line text-zinc-500">{p.spec}</p>
              </div>
              <div className="shrink-0 text-right">
                <p>× {p.quantity}</p>
                <p className="text-zinc-500">{currency.format(p.price * p.quantity)}</p>
              </div>
            </li>
          ))}
        </ul>

        {overdue > 0 && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950">
            另有 {overdue} 筆訂單已逾期尚未出貨
          </p>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2">
          <button onClick={mute} className="text-sm text-zinc-500 hover:underline">
            今天不再提示
          </button>
          <div className="flex gap-2">
            <button
              autoFocus
              onClick={() => setClosed(true)}
              className="rounded-md border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              知道了
            </button>
            <Link
              href="/register"
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              前往訂單管理
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
