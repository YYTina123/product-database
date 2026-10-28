"use client";

import { useState } from "react";
import { currency, inputClass, localDate, saveProducts, useProducts } from "../products-store";

// 有預計出貨日、但尚未填出貨日期的訂單，依預計出貨日由近到遠排列
export default function PendingShipments() {
  const products = useProducts();
  const today = localDate();
  // 各筆訂單已選、尚未確認的出貨日期
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const pending = products
    .filter((p) => p.shipDate && !p.shippedDate)
    .sort((a, b) => a.shipDate!.localeCompare(b.shipDate!));
  const overdue = pending.filter((p) => p.shipDate! < today).length;
  const total = pending.reduce((sum, p) => sum + p.price * p.quantity, 0);

  const markShipped = (id: string, date: string) =>
    saveProducts(products.map((p) => (p.id === id ? { ...p, shippedDate: date } : p)));

  return (
    <section className="mt-10 flex flex-col gap-6">
      <h2 className="text-lg font-semibold">尚未出貨</h2>

      <div className="flex items-center justify-between text-sm text-zinc-500">
        <span>
          共 {pending.length} 筆
          {overdue > 0 && <span className="ml-2 text-red-600">（{overdue} 筆已逾期）</span>}
        </span>
        <span>
          合計：
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">
            {currency.format(total)}
          </span>
        </span>
      </div>

      {pending.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-300 py-12 text-center text-sm text-zinc-500 dark:border-zinc-700">
          目前沒有待出貨的訂單
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
              <tr>
                <th className="px-4 py-2 font-medium">訂單日期</th>
                <th className="px-4 py-2 font-medium">預計出貨日</th>
                <th className="px-4 py-2 font-medium">客戶名</th>
                <th className="px-4 py-2 font-medium">產品規格</th>
                <th className="px-4 py-2 text-right font-medium">售價</th>
                <th className="px-4 py-2 text-right font-medium">數量</th>
                <th className="px-4 py-2 text-right font-medium">小計</th>
                <th className="px-4 py-2 font-medium">出貨日期</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {pending.map((p) => {
                const late = p.shipDate! < today;
                const due = p.shipDate === today;
                return (
                  <tr key={p.id}>
                    <td className="whitespace-nowrap px-4 py-2">{p.date}</td>
                    <td className="whitespace-nowrap px-4 py-2">
                      <span className={late ? "font-medium text-red-600" : due ? "font-medium text-amber-600" : ""}>
                        {p.shipDate}
                      </span>
                      {(late || due) && (
                        <span
                          className={`ml-2 rounded px-1.5 py-0.5 text-xs ${
                            late
                              ? "bg-red-50 text-red-600 dark:bg-red-950"
                              : "bg-amber-50 text-amber-700 dark:bg-amber-950"
                          }`}
                        >
                          {late ? "逾期" : "今天"}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2">{p.customer}</td>
                    <td className="whitespace-pre-line px-4 py-2">{p.spec}</td>
                    <td className="px-4 py-2 text-right">{currency.format(p.price)}</td>
                    <td className="px-4 py-2 text-right">{p.quantity}</td>
                    <td className="px-4 py-2 text-right font-medium">
                      {currency.format(p.price * p.quantity)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2">
                      <input
                        type="date"
                        aria-label={`${p.customer} 出貨日期`}
                        value={drafts[p.id] ?? ""}
                        onChange={(e) => setDrafts({ ...drafts, [p.id]: e.target.value })}
                        className={`${inputClass} w-auto px-2 py-1`}
                      />
                      {drafts[p.id] && (
                        <button
                          onClick={() => markShipped(p.id, drafts[p.id])}
                          className="ml-2 text-green-700 hover:underline"
                        >
                          確認
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
