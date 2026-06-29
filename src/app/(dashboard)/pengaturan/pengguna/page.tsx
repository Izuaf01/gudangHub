import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
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
import { formatDate } from "@/lib/utils";
import { UserPlus } from "lucide-react";
import Link from "next/link";
import { UserActions } from "./user-actions";
import type { Role } from "@prisma/client";

const ROLE_LABEL: Record<Role, string> = {
  ADMIN: "Admin",
  MANAGER: "Manager",
  STAFF: "Staff",
  VIEWER: "Viewer",
};

const ROLE_VARIANT: Record<Role, "danger" | "warning" | "info" | "default"> = {
  ADMIN: "danger",
  MANAGER: "warning",
  STAFF: "info",
  VIEWER: "default",
};

async function getUsers() {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });
}

export default async function PenggunaPage() {
  const [users, session] = await Promise.all([getUsers(), auth()]);
  const currentUserId = (session?.user as unknown as { id: string } | undefined)?.id ?? "";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pengguna"
        description={`${users.length} pengguna terdaftar`}
        action={
          <Link href="/pengaturan/pengguna/baru">
            <button className="btn-primary btn-sm flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Tambah Pengguna
            </button>
          </Link>
        }
      />

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Bergabung</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} className={!user.isActive ? "opacity-50" : ""}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-ink flex items-center justify-center text-canvas text-xs font-medium shrink-0">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-sm">{user.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-mute">{user.email}</TableCell>
                <TableCell>
                  <Badge variant={ROLE_VARIANT[user.role]}>
                    {ROLE_LABEL[user.role]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={user.isActive ? "success" : "default"}>
                    {user.isActive ? "Aktif" : "Nonaktif"}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-mute">
                  {formatDate(user.createdAt)}
                </TableCell>
                <TableCell>
                  <UserActions
                    userId={user.id}
                    userName={user.name}
                    isActive={user.isActive}
                    currentUserId={currentUserId}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
