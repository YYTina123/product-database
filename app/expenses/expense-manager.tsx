"use client";

import { useState } from "react";
import {
  EXPENSE_CATEGORIES,
  loadSampleExpenses,
  saveExpenses,
  useExpenses,
  type Expense,
} from "../expenses-store";
import { currency, inputClass, localDate } from "../products-store";

const emptyForm = (category = EXPENSE_CATEGORIES[0]) => ({
  date: localDate(),
  category,
  item: "",
  amount: "",
  note: "",
});

type FormField = keyof ReturnType<typeof emptyForm>;

export default function ExpenseManager() {
  const expenses = useExpenses();
  const [form, setForm] = useState(() => emptyForm());
  // 正在修改的那一筆；null 表示新增
  const [editingId, setEditingId] = useState<string | null>(null);
  const [month, setMonth] = useState(() => localDate().slice(0, 7));
  const [category, setCategory] = useState("");

  const update =
    (field: FormField) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm({ ...form, [field]: e.target.value });

  const reset = () => {
    setEditingId(null);
    setForm(emptyForm(form.category));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const expense: Expense = {
      id: editingId ?? crypto.randomUUID(),
      date: form.date,
      category: form.category,
      item: form.item.trim(),
      amount: Number(form.amount),
      note: form.note.trim(),
    };
    saveExpenses(
      editingId
        ? expenses.map((x) => (x.id === editingId ? expense : x))
        : [expense, ...expenses],
    );
    reset();
  };

  const startEdit = (x: Expense) => {
    setEditingId(x.id);
    setForm({ ...x, amount: String(x.amount) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const remove = (id: string) => {
    if (confirm("確定要刪除這筆支出嗎？")) {
      saveExpenses(expenses.filter((x) => x.id !== id));
      if (id === editingId) reset();
    }
  };

  const results = expenses
    .filter((x) => (!month || x.date.startsWith(month)) && (!category || x.category === category))
    .sort((a, b) => b.date.localeCompare(a.date));
  const total = results.reduce((s, x) => s + x.amount, 0);
  const byCategory = EXPENSE_CATEGORIES.map(
    (c) => [c, results.filter((x) => x.category === c).reduce((s, x) => s + x.amount, 0)] as const,
  ).filter(([, v]) => v > 0);

  return (
    <div className="flex flex-col gap-6">
      <form
        onSubmit={handleSubmit}
        className={`grid gap-4 rounded-xl border bg-white p-6 shadow-sm sm:grid-cols-2 lg:grid-cols-[1fr_1fr_2fr_1fr] dark:bg-zinc-950 ${
          editingId ? "border-blue-500" : "border-zinc-200 dark:border-zinc-800"
        }`}
      >
        <label className="flex flex-col gap-1 text-sm font-medium">
          日期
          <input required type="date" value={form.date} onChange={update("date")} className={inputClass} />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          類別
          <select value={form.category} onChange={update("category")} className={inputClass}>
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          項目
          <input
            required
            value={form.item}
            onChange={update("item")}
            placeholder="例如：辦公室租金"
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          金額（元）
          <input
            required
            type="number"
            min="0"
            step="1"
            value={form.amount}
            onChange={update("amount")}
            placeholder="0"
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium sm:col-span-2 lg:col-span-3">
          備註
          <input value={form.note} onChange={update("note")} placeholder="選填" className={inputClass} />
        </label>
        <div className="flex items-end justify-end gap-2">
          <button
            type="button"
            onClick={reset}
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            {editingId ? "取消" : "清除"}
          </button>
          <button
            type="submit"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            {editingId ? "儲存修改" : "新增支出"}
          </button>
        </div>
      </form>

      <div className="flex flex-wrap items-end gap-4">
        <label className="flex flex-col gap-1 text-sm font-medium">
          月份
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          類別
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
            <option value="">全部</option>
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        {month && (
          <button onClick={() => setMonth("")} className="pb-2 text-sm text-blue-600 hover:underline">
            顯示全部月份
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-zinc-500">
        <span>
          共 {results.length} 筆（全部 {expenses.length} 筆）
          <button
            onClick={() => {
              if (confirm("載入範例資料會取代目前所有支出，確定嗎？")) loadSampleExpenses();
            }}
            className="ml-3 text-blue-600 hover:underline"
          >
            載入範例資料
          </button>
        </span>
        <span>
          合計：
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">{currency.format(total)}</span>
        </span>
      </div>

      {byCategory.length > 0 && (
        <ul className="flex flex-wrap gap-2 text-sm">
          {byCategory.map(([c, v]) => (
            <li key={c} className="rounded-full bg-zinc-100 px-3 py-1 dark:bg-zinc-900">
              {c} <span className="font-semibold tabular-nums">{currency.format(v)}</span>
            </li>
          ))}
        </ul>
      )}

      {results.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-300 py-12 text-center text-sm text-zinc-500 dark:border-zinc-700">
          {expenses.length === 0 ? "尚無支出資料" : "查無符合條件的支出"}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
              <tr>
                <th className="px-4 py-2 font-medium">日期</th>
                <th className="px-4 py-2 font-medium">類別</th>
                <th className="px-4 py-2 font-medium">項目</th>
                <th className="px-4 py-2 font-medium">備註</th>
                <th className="px-4 py-2 text-right font-medium">金額</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {results.map((x) => (
                <tr key={x.id} className={x.id === editingId ? "bg-blue-50/50 dark:bg-blue-950/20" : ""}>
                  <td className="whitespace-nowrap px-4 py-2">{x.date}</td>
                  <td className="whitespace-nowrap px-4 py-2">{x.category}</td>
                  <td className="px-4 py-2">{x.item}</td>
                  <td className="px-4 py-2 text-zinc-500">{x.note}</td>
                  <td className="px-4 py-2 text-right font-medium tabular-nums">
                    {currency.format(x.amount)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-right">
                    <button onClick={() => startEdit(x)} className="text-blue-600 hover:underline">
                      修改
                    </button>
                    <button onClick={() => remove(x.id)} className="ml-3 text-red-600 hover:underline">
                      刪除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
