import Link from "next/link";

export default function PageHeader({ title }: { title: string }) {
  return (
    <div className="mb-8 flex flex-col gap-2">
      <Link href="/" className="text-sm text-blue-600 hover:underline">
        ← 回首頁
      </Link>
      <h1 className="text-2xl font-bold">{title}</h1>
    </div>
  );
}
