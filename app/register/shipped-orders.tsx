"use client";

import { useState } from "react";
import { currency, inputClass, localDate, saveProducts, useProducts } from "../products-store";

// 已填出貨日期的訂單，依出貨日期由新到舊排列，可依出貨月份篩選
export default function ShippedOrders() {
  const products = useProducts();
  const [month, setMonth] = useState(() => localDate().slice(0, 7));

  const allShipped = products.filter((p) => p.shippedDate);
  const shipped = allShipped
    .filter((p) => !month || p.shippedDate!.startsWith(month))
    .sort((a, b) => b.shippedDate!.localeCompare(a.shippedDate!));
  const late = shipped.filter((p) => p.shipDate && p.shippedDate! > p.shipDate).length;
  const total = shipped.reduce((sum, p) => sum + p.price * p.quantity, 0);

  const undo = (id: string) => {
    if (confirm("確定要取消出貨，移回尚未出貨嗎？")) {
      saveProducts(products.map((p) => (p.id === id ? { ...p, shippedDate: undefined } : p)));
    }
  };

  return (
    <section className="mt-10 flex flex-col gap-6">
      <h2 className="text-lg font-semibold">已出貨</h2>

      <div className="flex flex-wrap items-end gap-4">
        <label className="flex flex-col gap-1 text-sm font-medium">
          出貨月份
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className={inputClass}
          />
        </label>
        {month && (
          <button onClick={() => setMonth("")} className="pb-2 text-sm text-blue-600 hover:underline">
            顯示全部月份
          </button>
        )}
      </div>

      <div className="flex items-center justify-between text-sm text-zinc-500">
        <span>
          共 {shipped.length} 筆（全部 {allShipped.length} 筆）
          {late > 0 && <span className="ml-2 text-amber-600">（{late} 筆晚於預計出貨日）</span>}
        </span>
        <span>
          合計：
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">
            {currency.format(total)}
          </span>
        </span>
      </div>

      {shipped.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-300 py-12 text-center text-sm text-zinc-500 dark:border-zinc-700">
          {allShipped.length === 0 ? "尚無已出貨的訂單" : "這個月份沒有出貨紀錄"}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
              <tr>
                <th className="px-4 py-2 font-medium">訂單日期</th>
                <th className="px-4 py-2 font-medium">預計出貨日</th>
                <th className="px-4 py-2 font-medium">出貨日期</th>
                <th className="px-4 py-2 font-medium">客戶名</th>
                <th className="px-4 py-2 font-medium">產品規格</th>
                <th className="px-4 py-2 text-right font-medium">售價</th>
                <th className="px-4 py-2 text-right font-medium">數量</th>
                <th className="px-4 py-2 text-right font-medium">小計</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {shipped.map((p) => {
                const delayed = p.shipDate && p.shippedDate! > p.shipDate;
                return (
                  <tr key={p.id}>
                    <td className="whitespace-nowrap px-4 py-2">{p.date}</td>
                    <td className="whitespace-nowrap px-4 py-2">{p.shipDate}</td>
                    <td className="whitespace-nowrap px-4 py-2">
                      <span className={delayed ? "font-medium text-amber-600" : ""}>{p.shippedDate}</span>
                      {delayed && (
                        <span className="ml-2 rounded bg-amber-50 px-1.5 py-0.5 text-xs text-amber-700 dark:bg-amber-950">
                          延遲
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
                    <td className="whitespace-nowrap px-4 py-2 text-right">
                      <button onClick={() => undo(p.id)} className="text-zinc-500 hover:underline">
                        取消出貨
                      </button>
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
