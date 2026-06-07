import { PageHeader } from "@/components/layout/page-header";
import { TokoForm } from "../toko-form";

export default function BuatTokoPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Tambah Toko" description="Daftarkan toko baru" />
      <div className="max-w-xl">
        <TokoForm />
      </div>
    </div>
  );
}
