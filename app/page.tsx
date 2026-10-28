import Link from "next/link";
import DueTodayDialog from "./due-today-dialog";

const options = [
  {
    href: "/search",
    title: "報價查詢",
    description: "依客戶、產品規格與日期查詢報價",
    icon: "🔍",
  },
  {
    href: "/register",
    title: "訂單管理",
    description: "新增訂單與預計出貨日",
    icon: "📝",
  },
  {
    href: "/expenses",
    title: "支出",
    description: "記錄進貨、薪資、租金等各項支出",
    icon: "💸",
  },
  {
    href: "/report",
    title: "財務報表",
    description: "近三個月收入、支出、利潤與客戶占比",
    icon: "📊",
  },
];

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-4 py-16">
      <h1 className="mb-2 text-center text-3xl font-bold">營運報表</h1>
      <p className="mb-10 text-center text-zinc-500">請選擇要執行的功能</p>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {options.map((o) => (
          <Link
            key={o.href}
            href={o.href}
            className="group flex flex-col items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-10 text-center shadow-sm transition hover:-translate-y-1 hover:border-blue-500 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950"
          >
            <span className="text-5xl">{o.icon}</span>
            <span className="text-xl font-semibold group-hover:text-blue-600">
              {o.title}
            </span>
            <span className="text-sm text-zinc-500">{o.description}</span>
          </Link>
        ))}
      </div>
      <DueTodayDialog />
    </main>
  );
}
