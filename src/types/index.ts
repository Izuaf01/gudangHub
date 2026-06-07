import type {
  Role,
  StockInStatus,
  OrderStatus,
  ShipmentStatus,
  MovementType,
} from "@prisma/client";

export type { Role, StockInStatus, OrderStatus, ShipmentStatus, MovementType };

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface ProductWithInventory {
  id: string;
  sku: string;
  name: string;
  category: string;
  unit: string;
  description: string | null;
  imageUrl: string | null;
  minStock: number;
  isActive: boolean;
  totalStock: number;
}

export interface SupplierWithCount {
  id: string;
  name: string;
  contact: string | null;
  address: string | null;
  email: string | null;
  phone: string | null;
  isActive: boolean;
  _count: { stockIns: number };
}

export interface LocationWithUsage {
  id: string;
  code: string;
  zone: string;
  row: string;
  shelf: string;
  capacity: number;
  isActive: boolean;
  usedCapacity: number;
}

export interface DashboardStats {
  totalProducts: number;
  totalStock: number;
  stockInToday: number;
  pendingOrders: number;
  shipmentsToday: number;
  lowStockCount: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T = null> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export type SortDirection = "asc" | "desc";

export interface TableParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortDir?: SortDirection;
}
