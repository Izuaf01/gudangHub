import { PageHeader } from "@/components/layout/page-header";
import { UserForm } from "../user-form";

export default function BuatPenggunaPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Tambah Pengguna"
        description="Daftarkan pengguna baru ke sistem"
      />
      <div className="max-w-xl">
        <UserForm mode="create" />
      </div>
    </div>
  );
}
