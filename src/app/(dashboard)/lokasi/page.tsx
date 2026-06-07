import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatNumber } from "@/lib/utils";
import { MapPin, Plus } from "lucide-react";
import Link from "next/link";
import { LocationActions } from "./location-actions";

async function getLocations() {
  const locations = await prisma.location.findMany({
    where: { isActive: true },
    include: {
      inventories: { select: { quantity: true } },
    },
    orderBy: [{ zone: "asc" }, { row: "asc" }, { shelf: "asc" }],
  });

  return locations.map((loc) => ({
    ...loc,
    usedCapacity: loc.inventories.reduce((s, i) => s + i.quantity, 0),
  }));
}

function getCapacityVariant(used: number, capacity: number) {
  const pct = capacity > 0 ? (used / capacity) * 100 : 0;
  if (pct >= 90) return "danger" as const;
  if (pct >= 70) return "warning" as const;
  return "success" as const;
}

export default async function LokasiPage() {
  const locations = await getLocations();

  // Group by zone
  const zones = Array.from(new Set(locations.map((l) => l.zone))).sort();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lokasi Gudang"
        description={`${locations.length} lokasi aktif`}
        action={
          <Link href="/lokasi/baru">
            <button className="btn-primary btn-sm flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Tambah Lokasi
            </button>
          </Link>
        }
      />

      {/* Zone summary chips */}
      {zones.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-mute self-center">Zona:</span>
          {zones.map((zone) => {
            const count = locations.filter((l) => l.zone === zone).length;
            return (
              <span key={zone} className="filter-chip filter-chip-active">
                {zone} <span className="ml-1 opacity-70">{count}</span>
              </span>
            );
          })}
        </div>
      )}

      <Card>
        {locations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <MapPin className="h-10 w-10 text-stone mb-3" />
            <p className="text-sm font-medium text-ink">
              Belum ada lokasi gudang
            </p>
            <p className="text-xs text-mute mt-1">
              Konfigurasikan zona dan rak gudang
            </p>
            <Link href="/lokasi/baru">
              <button className="btn-primary btn-sm mt-5">Tambah Lokasi</button>
            </Link>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode</TableHead>
                <TableHead>Zona</TableHead>
                <TableHead>Baris</TableHead>
                <TableHead>Rak</TableHead>
                <TableHead className="text-right">Kapasitas</TableHead>
                <TableHead className="text-right">Terpakai</TableHead>
                <TableHead>Utilisasi</TableHead>
                <TableHead>Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {locations.map((loc) => {
                const pct =
                  loc.capacity > 0
                    ? Math.round((loc.usedCapacity / loc.capacity) * 100)
                    : 0;
                const variant = getCapacityVariant(
                  loc.usedCapacity,
                  loc.capacity,
                );
                return (
                  <TableRow key={loc.id}>
                    <TableCell>
                      <span className="font-mono text-xs bg-soft-cloud px-2 py-0.5 font-medium">
                        {loc.code}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="default">{loc.zone}</Badge>
                    </TableCell>
                    <TableCell className="text-mute">{loc.row}</TableCell>
                    <TableCell className="text-mute">{loc.shelf}</TableCell>
                    <TableCell className="text-right">
                      {formatNumber(loc.capacity)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatNumber(loc.usedCapacity)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 min-w-25">
                        {/* Progress bar */}
                        <div className="flex-1 h-1.5 bg-hairline-soft overflow-hidden">
                          <div
                            className="h-full bg-ink transition-all"
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-mute w-9 text-right">
                          {pct}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={variant}>
                        {variant === "danger"
                          ? "Penuh"
                          : variant === "warning"
                            ? "Hampir Penuh"
                            : "Tersedia"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <LocationActions
                        locationId={loc.id}
                        locationCode={loc.code}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
