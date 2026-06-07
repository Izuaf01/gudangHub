import { PageHeader } from "@/components/layout/page-header";
import { SupplierForm } from "../supplier-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewSupplierPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/supplier">
          <button className="btn-icon">
            <ArrowLeft className="h-4 w-4" />
          </button>
        </Link>
        <PageHeader
          title="Tambah Supplier"
          description="Daftarkan supplier baru"
        />
      </div>
      <SupplierForm />
    </div>
  );
}
