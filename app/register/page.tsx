import { Suspense } from "react";
import PageHeader from "../page-header";
import PendingShipments from "./pending-shipments";
import ProductForm from "./product-form";
import ShippedOrders from "./shipped-orders";

export default function RegisterPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-12">
      <PageHeader title="訂單管理" />
      {/* 表單預設帶入今天日期、待出貨清單依今天判斷逾期，需在每次請求時才計算 */}
      <Suspense>
        <ProductForm />
        <PendingShipments />
        <ShippedOrders />
      </Suspense>
    </main>
  );
}
