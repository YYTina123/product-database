"use client";

import { useState } from "react";
import {
  currency,
  inputClass,
  loadSampleProducts,
  saveProducts,
  useProducts,
  type Product,
} from "../products-store";

export default function ProductSearch() {
  const products = useProducts();
  const [keyword, setKeyword] = useState("");
  const [spec, setSpec] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  // 下拉提示用：不重複的客戶名（依最近使用排序）與產品規格
  const customers = [...new Set(products.map((p) => p.customer))];
  const specs = [...new Set(products.map((p) => p.spec))].sort();

  const q = keyword.trim().toLowerCase();
  const s = spec.trim().toLowerCase();
  const results = products.filter(
    (p) =>
      (!q || p.customer.toLowerCase().includes(q) || p.spec.toLowerCase().includes(q)) &&
      (!s || p.spec.toLowerCase().includes(s)) &&
      (!from || p.date >= from) &&
      (!to || p.date <= to),
  );
  const total = results.reduce((sum, p) => sum + p.price * p.quantity, 0);

  const remove = (id: string) => {
    if (confirm("確定要刪除這筆資料嗎？")) {
      saveProducts(products.filter((p) => p.id !== id));
    }
  };

  // 正在修改的那一筆；欄位先以字串暫存，儲存時再轉成數字
  const [editing, setEditing] = useState<
    (Omit<Product, "price" | "quantity"> & { price: string; quantity: string }) | null
  >(null);

  const startEdit = (p: Product) =>
    setEditing({ ...p, price: String(p.price), quantity: String(p.quantity) });

  const edit =
    (field: "date" | "customer" | "spec" | "price" | "quantity") =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      editing && setEditing({ ...editing, [field]: e.target.value });

  const saveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    const updated: Product = {
      ...editing,
      customer: editing.customer.trim(),
      spec: editing.spec.trim(),
      price: Number(editing.price),
      quantity: Number(editing.quantity),
    };
    saveProducts(products.map((p) => (p.id === updated.id ? updated : p)));
    setEditing(null);
  };

  const cell = `${inputClass} px-2 py-1`;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm sm:grid-cols-2 lg:grid-cols-[3fr_3fr_2fr_2fr] dark:border-zinc-800 dark:bg-zinc-950">
        <label className="flex flex-col gap-1 text-sm font-medium">
          關鍵字（客戶名或產品規格）
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            list="customer-options"
            placeholder="輸入關鍵字或選擇客戶"
            className={inputClass}
          />
          <datalist id="customer-options">
            {customers.map((v) => (
              <option key={v} value={v} />
            ))}
          </datalist>
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          產品規格
          <input
            value={spec}
            onChange={(e) => setSpec(e.target.value)}
            list="spec-options"
            placeholder="輸入或選擇規格"
            className={inputClass}
          />
          <datalist id="spec-options">
            {specs.map((v) => (
              <option key={v} value={v} />
            ))}
          </datalist>
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          起始日期
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          結束日期
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className={inputClass}
          />
        </label>
      </div>

      <div className="flex items-center justify-between text-sm text-zinc-500">
        <span>
          共 {results.length} 筆（全部 {products.length} 筆）
          <button
            onClick={() => {
              if (confirm("載入範例資料會取代目前所有資料，確定嗎？")) loadSampleProducts();
            }}
            className="ml-3 text-blue-600 hover:underline"
          >
            載入範例資料
          </button>
        </span>
        <span>
          合計：
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">
            {currency.format(total)}
          </span>
        </span>
      </div>

      {results.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-300 py-12 text-center text-sm text-zinc-500 dark:border-zinc-700">
          {products.length === 0 ? "尚無資料，請先到訂單管理新增訂單" : "查無符合條件的資料"}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
              <tr>
                <th className="px-4 py-2 font-medium">日期</th>
                <th className="px-4 py-2 font-medium">客戶名</th>
                <th className="px-4 py-2 font-medium">產品規格</th>
                <th className="px-4 py-2 text-right font-medium">售價</th>
                <th className="px-4 py-2 text-right font-medium">數量</th>
                <th className="px-4 py-2 text-right font-medium">小計</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {results.map((p) =>
                editing?.id === p.id ? (
                <tr key={p.id} className="bg-blue-50/50 align-top dark:bg-blue-950/20">
                  <td className="px-2 py-2">
                    <input
                      form="edit-row"
                      required
                      type="date"
                      value={editing.date}
                      onChange={edit("date")}
                      className={cell}
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      form="edit-row"
                      required
                      value={editing.customer}
                      onChange={edit("customer")}
                      className={`${cell} min-w-24`}
                    />
                  </td>
                  <td className="px-2 py-2">
                    <textarea
                      form="edit-row"
                      required
                      rows={2}
                      value={editing.spec}
                      onChange={edit("spec")}
                      className={`${cell} min-w-40`}
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      form="edit-row"
                      required
                      type="number"
                      min="0"
                      step="1"
                      value={editing.price}
                      onChange={edit("price")}
                      className={`${cell} w-24 text-right`}
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      form="edit-row"
                      required
                      type="number"
                      min="1"
                      step="1"
                      value={editing.quantity}
                      onChange={edit("quantity")}
                      className={`${cell} w-20 text-right`}
                    />
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    {currency.format(Number(editing.price || 0) * Number(editing.quantity || 0))}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <form id="edit-row" onSubmit={saveEdit} className="inline">
                      <button type="submit" className="text-blue-600 hover:underline">
                        儲存
                      </button>
                    </form>
                    <button
                      onClick={() => setEditing(null)}
                      className="ml-3 text-zinc-500 hover:underline"
                    >
                      取消
                    </button>
                  </td>
                </tr>
                ) : (
                <tr key={p.id}>
                  <td className="whitespace-nowrap px-4 py-2">{p.date}</td>
                  <td className="px-4 py-2">{p.customer}</td>
                  <td className="whitespace-pre-line px-4 py-2">{p.spec}</td>
                  <td className="px-4 py-2 text-right">{currency.format(p.price)}</td>
                  <td className="px-4 py-2 text-right">{p.quantity}</td>
                  <td className="px-4 py-2 text-right font-medium">
                    {currency.format(p.price * p.quantity)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-right">
                    <button
                      onClick={() => startEdit(p)}
                      className="text-blue-600 hover:underline"
                    >
                      修改
                    </button>
                    <button
                      onClick={() => remove(p.id)}
                      className="ml-3 text-red-600 hover:underline"
                    >
                      刪除
                    </button>
                  </td>
                </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
