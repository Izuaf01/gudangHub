import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { LocationForm } from "../../location-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface EditLocationPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditLocationPage({
  params,
}: EditLocationPageProps) {
  const { id } = await params;
  const loc = await prisma.location.findUnique({ where: { id } });
  if (!loc) notFound();

  return (
    <div className="space-y-6 max-w-lg">
      <div className="flex items-center gap-3">
        <Link href="/lokasi">
          <button className="btn-icon">
            <ArrowLeft className="h-4 w-4" />
          </button>
        </Link>
        <PageHeader title="Edit Lokasi" description={loc.code} />
      </div>
      <LocationForm
        defaultValues={{
          zone: loc.zone,
          row: loc.row,
          shelf: loc.shelf,
          capacity: loc.capacity,
          code: loc.code,
        }}
        locationId={id}
      />
    </div>
  );
}
