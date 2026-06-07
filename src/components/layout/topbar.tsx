"use client";

import { signOut } from "next-auth/react";
import { Bell, LogOut, User, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getInitials } from "@/lib/utils";

interface TopbarProps {
  userName: string;
  userRole: string;
}

const roleLabel: Record<string, string> = {
  ADMIN: "Administrator",
  MANAGER: "Manager",
  STAFF: "Staff Gudang",
  VIEWER: "Viewer",
};

export function Topbar({ userName, userRole }: TopbarProps) {
  return (
    <header
      className="fixed right-0 top-0 z-30 flex items-center justify-between px-6 bg-canvas"
      style={{
        left: "var(--sidebar-width)",
        height: "var(--topbar-height)",
        borderBottom: "1px solid var(--hairline-soft)",
        boxShadow: "inset 0 -1px 0 var(--hairline-soft)",
      }}
    >
      {/* Left — page breadcrumb placeholder */}
      <div />

      {/* Right — notifications + user */}
      <div className="flex items-center gap-2">
        <button className="btn-icon relative">
          <Bell className="h-4 w-4" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2.5 px-3 py-2 hover:bg-soft-cloud transition-colors rounded-sm">
              {/* Avatar */}
              <div className="w-8 h-8 rounded-full bg-ink flex items-center justify-center shrink-0">
                <span className="text-canvas text-xs font-medium">
                  {getInitials(userName)}
                </span>
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-medium text-ink leading-none">
                  {userName}
                </p>
                <p className="text-xs text-mute mt-0.5">
                  {roleLabel[userRole] ?? userRole}
                </p>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-mute hidden sm:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="h-4 w-4" />
              Profil
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-sale"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <LogOut className="h-4 w-4" />
              Keluar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
