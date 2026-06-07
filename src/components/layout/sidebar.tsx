"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  PackageOpen,
  ShieldCheck,
  Boxes,
  MapPin,
  ClipboardList,
  HandMetal,
  PackageCheck,
  Truck,
  Store,
  Package,
  Users,
  BarChart3,
  Settings,
  ChevronDown,
  ChevronRight,
  Warehouse,
} from "lucide-react";
import { useState } from "react";

interface NavItem {
  label: string;
  href?: string;
  icon: React.ElementType;
  children?: { label: string; href: string }[];
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Penerimaan Barang",
    icon: PackageOpen,
    children: [
      { label: "Daftar Penerimaan", href: "/penerimaan" },
      { label: "Tambah Penerimaan", href: "/penerimaan/baru" },
    ],
  },
  {
    label: "Quality Control",
    href: "/qc",
    icon: ShieldCheck,
  },
  {
    label: "Inventaris",
    icon: Boxes,
    children: [
      { label: "Stok Sekarang", href: "/inventaris" },
      { label: "Pergerakan Stok", href: "/inventaris/pergerakan" },
      { label: "Stock Opname", href: "/inventaris/opname" },
    ],
  },
  {
    label: "Lokasi Gudang",
    href: "/lokasi",
    icon: MapPin,
  },
  {
    label: "Pesanan",
    icon: ClipboardList,
    children: [
      { label: "Daftar Pesanan", href: "/pesanan" },
      { label: "Buat Pesanan", href: "/pesanan/baru" },
    ],
  },
  {
    label: "Picking",
    href: "/picking",
    icon: HandMetal,
  },
  {
    label: "Packing",
    href: "/packing",
    icon: PackageCheck,
  },
  {
    label: "Pengiriman",
    href: "/pengiriman",
    icon: Truck,
  },
  {
    label: "Toko",
    href: "/toko",
    icon: Store,
  },
  {
    label: "Produk",
    href: "/produk",
    icon: Package,
  },
  {
    label: "Supplier",
    href: "/supplier",
    icon: Users,
  },
  {
    label: "Laporan",
    href: "/laporan",
    icon: BarChart3,
  },
  {
    label: "Pengaturan",
    icon: Settings,
    children: [
      { label: "Pengguna", href: "/pengaturan/pengguna" },
      { label: "Akses & Role", href: "/pengaturan/role" },
    ],
  },
];

function NavItemComponent({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(() => {
    if (item.children) {
      return item.children.some((c) => pathname.startsWith(c.href));
    }
    return false;
  });

  const isActive = item.href
    ? pathname === item.href || pathname.startsWith(item.href + "/")
    : false;
  const Icon = item.icon;

  if (item.children) {
    const isChildActive = item.children.some((c) =>
      pathname.startsWith(c.href),
    );

    return (
      <div>
        <button
          onClick={() => setOpen(!open)}
          className={cn(
            "nav-item w-full text-left",
            isChildActive && "text-ink",
          )}
        >
          <Icon className="h-4 w-4 shrink-0" />
          <span className="flex-1 text-sm">{item.label}</span>
          {open ? (
            <ChevronDown className="h-3.5 w-3.5 text-stone" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 text-stone" />
          )}
        </button>
        {open && (
          <div className="ml-9 border-l border-hairline-soft">
            {item.children.map((child) => {
              const childActive =
                pathname === child.href ||
                pathname.startsWith(child.href + "/");
              return (
                <Link
                  key={child.href}
                  href={child.href}
                  className={cn(
                    "block px-3 py-2 text-sm transition-colors",
                    childActive
                      ? "text-ink font-medium"
                      : "text-mute hover:text-ink",
                  )}
                >
                  {child.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.href!}
      className={cn("nav-item", isActive && "nav-item-active")}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="text-sm">{item.label}</span>
    </Link>
  );
}

export function Sidebar() {
  return (
    <aside
      className="fixed left-0 top-0 z-40 h-screen flex flex-col bg-canvas"
      style={{
        width: "var(--sidebar-width)",
        borderRight: "1px solid var(--hairline-soft)",
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-5 shrink-0"
        style={{
          height: "var(--topbar-height)",
          borderBottom: "1px solid var(--hairline-soft)",
        }}
      >
        <div className="flex items-center justify-center w-8 h-8 bg-ink rounded-sm">
          <Warehouse className="h-4 w-4 text-canvas" />
        </div>
        <div>
          <p className="text-sm font-medium text-ink leading-none">GudangHub</p>
          <p className="text-xs text-mute mt-0.5">Manajemen Gudang</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {navItems.map((item) => (
          <NavItemComponent key={item.label} item={item} />
        ))}
      </nav>

      {/* Footer */}
      <div
        className="px-4 py-4 shrink-0"
        style={{ borderTop: "1px solid var(--hairline-soft)" }}
      >
        <p className="text-xs text-stone">GudangHub v1.0</p>
      </div>
    </aside>
  );
}
