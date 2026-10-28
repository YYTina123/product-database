"use client";

import { createLocalStore } from "./local-store";
import sampleData from "./sample-products.json";

export type Product = {
  id: string;
  customer: string;
  spec: string;
  price: number;
  quantity: number;
  date: string;
  // 預計出貨日；舊資料沒有這個欄位
  shipDate?: string;
  // 實際出貨日期；有值代表已出貨
  shippedDate?: string;
};

const store = createLocalStore<Product>("products", sampleData);

export const saveProducts = store.save;
export const useProducts = store.useItems;
export const loadSampleProducts = store.loadSample;

export const currency = new Intl.NumberFormat("zh-TW", {
  style: "currency",
  currency: "TWD",
  maximumFractionDigits: 0,
});

export const inputClass =
  "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-900";

// 以本地時區輸出 YYYY-MM-DD（避免 toISOString 的 UTC 偏移）
export function localDate(d = new Date()) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
