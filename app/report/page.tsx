import PageHeader from "../page-header";
import MonthlyReport from "./monthly-report";

export default function ReportPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-12">
      <PageHeader title="財務報表" />
      <MonthlyReport />
    </main>
  );
}
