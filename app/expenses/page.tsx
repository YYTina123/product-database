import { Suspense } from "react";
import PageHeader from "../page-header";
import ExpenseManager from "./expense-manager";

export default function ExpensesPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-12">
      <PageHeader title="支出" />
      {/* 表單預設帶入今天日期，需在每次請求時才計算 */}
      <Suspense>
        <ExpenseManager />
      </Suspense>
    </main>
  );
}
