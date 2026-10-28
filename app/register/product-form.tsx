"use client";

import Link from "next/link";
import { useState } from "react";
import { currency, inputClass, localDate, saveProducts, useProducts } from "../products-store";

const today = () => localDate();

// customer 為 null 時，預設帶入上次登錄的客戶名
const emptyForm = (customer: string | null = null) => ({
  customer,
  spec: "",
  price: "",
  quantity: "1",
  date: today(),
  shipDate: "",
});

type FormField = Exclude<keyof ReturnType<typeof emptyForm>, "customer">;

export default function ProductForm() {
  const [form, setForm] = useState(() => emptyForm());
  const [saved, setSaved] = useState("");
  const [listOpen, setListOpen] = useState(false);
  const [filtering, setFiltering] = useState(false);
  const products = useProducts();

  // 依最近使用排序、不重複的客戶名
  const customers = [...new Set(products.map((p) => p.customer))];
  const customer = form.customer ?? customers[0] ?? "";
  const q = customer.trim().toLowerCase();
  const matches =
    filtering && q
      ? customers.filter((c) => c.toLowerCase().includes(q))
      : customers;

  const setCustomer = (value: string) => {
    setSaved("");
    setForm({ ...form, customer: value });
  };

  const update =
    (field: FormField) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setSaved("");
      setForm({ ...form, [field]: e.target.value });
    };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = customer.trim();
    saveProducts([
      {
        id: crypto.randomUUID(),
        customer: name,
        spec: form.spec.trim(),
        price: Number(form.price),
        quantity: Number(form.quantity),
        date: form.date,
        shipDate: form.shipDate,
      },
      ...products,
    ]);
    setSaved(name);
    setForm(emptyForm(name));
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm sm:grid-cols-2 dark:border-zinc-800 dark:bg-zinc-950"
    >
      {saved && (
        <p className="rounded-md bg-green-50 px-4 py-3 text-sm text-green-700 sm:col-span-2 dark:bg-green-950 dark:text-green-300">
          已新增「{saved}」的訂單。
          <Link href="/search" className="ml-2 underline">
            前往查詢
          </Link>
        </p>
      )}

      <label className="flex flex-col gap-1 text-sm font-medium">
        客戶名
        <div
          className="relative"
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget)) setListOpen(false);
          }}
        >
          <input
            required
            value={customer}
            onChange={(e) => {
              setCustomer(e.target.value);
              setListOpen(true);
              setFiltering(true);
            }}
            onKeyDown={(e) => e.key === "Escape" && setListOpen(false)}
            placeholder="例如：王小明"
            autoComplete="off"
            className={`${inputClass} pr-10`}
          />
          <button
            type="button"
            aria-label="選擇客戶"
            onClick={() => {
              // 從按鈕開啟時顯示全部客戶
              setFiltering(false);
              setListOpen(!listOpen);
            }}
            className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            ▼
          </button>
          {listOpen && (
            <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-zinc-200 bg-white py-1 text-sm font-normal shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
              {matches.length === 0 ? (
                <li className="px-3 py-2 text-zinc-500">
                  {customers.length === 0 ? "尚無客戶資料" : "新客戶"}
                </li>
              ) : (
                matches.map((c) => (
                  <li key={c}>
                    <button
                      type="button"
                      onClick={() => {
                        setCustomer(c);
                        setListOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-left hover:bg-blue-50 dark:hover:bg-zinc-800 ${
                        c === customer ? "font-semibold text-blue-600" : ""
                      }`}
                    >
                      {c}
                    </button>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-1 text-sm font-medium">
          訂單日期
          <input
            required
            type="date"
            value={form.date}
            onChange={update("date")}
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium">
          預計出貨日
          <input
            required
            type="date"
            min={form.date}
            value={form.shipDate}
            onChange={update("shipDate")}
            className={inputClass}
          />
        </label>
      </div>

      <div className="grid items-start gap-4 sm:col-span-2 sm:grid-cols-[2fr_1fr_1fr]">
        <label className="flex flex-col gap-1 text-sm font-medium">
          產品規格
          <textarea
            required
            rows={1}
            value={form.spec}
            onChange={update("spec")}
            placeholder="例如：A4 影印紙 80g / 500 張"
            className={`${inputClass} resize-y`}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium">
          售價（元）
          <input
            required
            type="number"
            min="0"
            step="1"
            value={form.price}
            onChange={update("price")}
            placeholder="0"
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium">
          數量
          <input
            required
            type="number"
            min="1"
            step="1"
            value={form.quantity}
            onChange={update("quantity")}
            className={inputClass}
          />
        </label>
      </div>

      <div className="flex items-center justify-between gap-4 sm:col-span-2">
        <p className="text-sm text-zinc-500">
          小計：
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">
            {currency.format(Number(form.price || 0) * Number(form.quantity || 0))}
          </span>
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setSaved("");
              setForm(emptyForm());
            }}
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            清除
          </button>
          <button
            type="submit"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            新增訂單
          </button>
        </div>
      </div>
    </form>
  );
}
