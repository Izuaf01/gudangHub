import { PageHeader } from "@/components/layout/page-header";
import { LocationForm } from "../location-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewLocationPage() {
  return (
    <div className="space-y-6 max-w-lg">
      <div className="flex items-center gap-3">
        <Link href="/lokasi">
          <button className="btn-icon">
            <ArrowLeft className="h-4 w-4" />
          </button>
        </Link>
        <PageHeader
          title="Tambah Lokasi"
          description="Konfigurasi zona dan rak baru"
        />
      </div>
      <LocationForm />
    </div>
  );
}
