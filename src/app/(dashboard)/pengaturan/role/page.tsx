import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const ROLES = [
  {
    name: "ADMIN",
    label: "Admin",
    variant: "danger" as const,
    description: "Akses penuh ke seluruh sistem termasuk manajemen pengguna.",
    permissions: [
      "Kelola pengguna (tambah, edit, nonaktifkan)",
      "Akses semua modul operasional",
      "Lihat semua laporan",
      "Konfigurasi sistem",
      "Hapus data (produk, pesanan draft, dll.)",
    ],
  },
  {
    name: "MANAGER",
    label: "Manager",
    variant: "warning" as const,
    description: "Mengawasi dan mengelola operasional gudang sehari-hari.",
    permissions: [
      "Konfirmasi penerimaan barang & QC",
      "Konfirmasi dan kelola pesanan",
      "Kelola picking & packing",
      "Buat pengiriman",
      "Lihat semua laporan",
      "Kelola produk, supplier, lokasi, toko",
    ],
  },
  {
    name: "STAFF",
    label: "Staff",
    variant: "info" as const,
    description: "Menjalankan tugas operasional harian di gudang.",
    permissions: [
      "Input penerimaan barang",
      "Proses quality control",
      "Jalankan picking task",
      "Jalankan packing task",
      "Lihat inventaris & pergerakan stok",
    ],
  },
  {
    name: "VIEWER",
    label: "Viewer",
    variant: "default" as const,
    description: "Hanya dapat melihat data tanpa melakukan perubahan.",
    permissions: [
      "Lihat dashboard",
      "Lihat inventaris & stok",
      "Lihat daftar pesanan",
      "Lihat laporan",
    ],
  },
];

export default function AksesRolePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Akses & Role"
        description="Panduan hak akses per role pengguna"
      />

      <div className="grid grid-cols-2 gap-4">
        {ROLES.map((role) => (
          <Card key={role.name}>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-3">
                <Badge variant={role.variant} className="text-sm px-4 py-1">
                  {role.label}
                </Badge>
              </div>
              <p className="text-sm text-mute">{role.description}</p>
              <div>
                <p className="text-xs font-medium text-ink mb-2">Hak Akses:</p>
                <ul className="space-y-1.5">
                  {role.permissions.map((perm, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-ink shrink-0" />
                      <span className="text-xs text-mute">{perm}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="pt-6">
          <h3 className="text-sm font-medium text-ink mb-4">
            Matriks Hak Akses per Modul
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-hairline-soft">
                  <th className="text-left py-2 pr-4 font-medium text-ink">
                    Modul
                  </th>
                  {ROLES.map((r) => (
                    <th
                      key={r.name}
                      className="py-2 px-3 font-medium text-ink text-center"
                    >
                      {r.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline-soft">
                {[
                  { module: "Dashboard", perms: ["R", "R", "R", "R"] },
                  { module: "Produk", perms: ["RW", "RW", "R", "R"] },
                  { module: "Supplier", perms: ["RW", "RW", "R", "R"] },
                  { module: "Lokasi Gudang", perms: ["RW", "RW", "R", "R"] },
                  {
                    module: "Penerimaan Barang",
                    perms: ["RW", "RW", "RW", "R"],
                  },
                  { module: "Quality Control", perms: ["RW", "RW", "RW", "R"] },
                  { module: "Inventaris", perms: ["RW", "RW", "R", "R"] },
                  { module: "Pesanan", perms: ["RW", "RW", "R", "R"] },
                  { module: "Picking", perms: ["RW", "RW", "RW", "R"] },
                  { module: "Packing", perms: ["RW", "RW", "RW", "R"] },
                  { module: "Pengiriman", perms: ["RW", "RW", "R", "R"] },
                  { module: "Toko", perms: ["RW", "RW", "R", "R"] },
                  { module: "Laporan", perms: ["RW", "RW", "-", "R"] },
                  { module: "Pengguna", perms: ["RW", "-", "-", "-"] },
                ].map((row) => (
                  <tr key={row.module}>
                    <td className="py-2 pr-4 text-mute">{row.module}</td>
                    {row.perms.map((perm, i) => (
                      <td key={i} className="py-2 px-3 text-center">
                        {perm === "RW" ? (
                          <span className="text-success font-medium">
                            Baca + Tulis
                          </span>
                        ) : perm === "R" ? (
                          <span className="text-info">Baca</span>
                        ) : (
                          <span className="text-stone">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
