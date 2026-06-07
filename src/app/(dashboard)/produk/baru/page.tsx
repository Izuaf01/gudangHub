import { PageHeader } from "@/components/layout/page-header";
import { ProductForm } from "../product-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewProductPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/produk">
          <button className="btn-icon">
            <ArrowLeft className="h-4 w-4" />
          </button>
        </Link>
        <PageHeader
          title="Tambah Produk"
          description="Daftarkan produk baru ke sistem"
        />
      </div>
      <ProductForm />
    </div>
  );
}
