import PageHeader from "../page-header";
import ProductSearch from "./product-search";

export default function SearchPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-12">
      <PageHeader title="報價查詢" />
      <ProductSearch />
    </main>
  );
}
