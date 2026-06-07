# GudangHub — Warehouse Management System (Pre-Shipment)

## Project Overview

Build a **full-stack web application** untuk pengelolaan gudang sebelum barang dikirim ke toko ritel. Sistem ini mencakup manajemen stok masuk dari supplier, pengecekan kualitas, persiapan pengiriman (pick & pack), serta pelacakan status barang hingga keluar dari gudang menuju toko.

---

## Tech Stack

### Frontend

- **Framework**: Next.js 16+ (App Router, Server Components)
- **Language**: TypeScript 5+
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui (Radix UI primitives)
- **State Management**: Zustand (client state) + TanStack Query v5 (server state / caching)
- **Form Handling**: React Hook Form + Zod (validation)
- **Tables / Data Grid**: TanStack Table v8
- **Charts & Reports**: Recharts
- **Date Handling**: date-fns
- **Icons**: Lucide React
- **Notifications**: Sonner (toast)
- **PDF Export**: @react-pdf/renderer
- **Barcode / QR Scanner**: zxing-js/browser

### Backend / API

- **API Layer**: Next.js Route Handlers (REST) + Server Actions
- **ORM**: Prisma v6
- **Database**: PostgreSQL (via Supabase or self-hosted)
- **Authentication**: NextAuth.js v5 (Auth.js) — credentials + role-based
- **File Storage**: Supabase Storage (foto produk, dokumen pengiriman)
- **Background Jobs**: inngest (scheduled stock alerts, laporan otomatis)
- **Email**: Resend (notifikasi pengiriman, alert stok)

### DevOps & Tooling

- **Linting**: ESLint + Prettier
- **Testing**: Vitest + React Testing Library + Playwright (E2E)
- **CI/CD**: GitHub Actions
- **Deployment**: Vercel (frontend) + Supabase (database & storage)
- **Version Control**: Git + GitHub

---

## Database Schema (Prisma)

```
User          → id, name, email, passwordHash, role (ADMIN | MANAGER | STAFF | VIEWER)
Supplier      → id, name, contact, address, email, phone
Product       → id, sku, name, category, unit, description, imageUrl, minStock
StockIn       → id, productId, supplierId, quantity, unitCost, receivedAt, invoiceNo, status
QualityCheck  → id, stockInId, passedQty, rejectedQty, notes, checkedBy, checkedAt
Location      → id, code, zone, row, shelf, capacity (rak/zona gudang)
Inventory     → id, productId, locationId, quantity (stok aktual per lokasi)
StockMovement → id, productId, fromLocation, toLocation, quantity, type, movedAt, movedBy
Order         → id, orderNo, storeId, status, createdAt, scheduledShipAt
OrderItem     → id, orderId, productId, requestedQty, pickedQty
PickingTask   → id, orderId, assignedTo, status, startedAt, completedAt
PackingTask   → id, orderId, assignedTo, weight, boxCount, status, packedAt
Shipment      → id, orderId, vehicleNo, driverId, departedAt, estimatedArrival, status
Store         → id, name, address, city, contactPerson, phone
AuditLog      → id, userId, action, entity, entityId, detail, createdAt
```

---

## Features

### 1. Dashboard & Analytics

- KPI cards: total stok, barang masuk hari ini, pesanan pending, shipment hari ini
- Grafik stok masuk vs keluar (7 hari / 30 hari)
- Top 10 produk dengan pergerakan tertinggi
- Alert stok di bawah minimum (real-time)
- Status pengiriman aktif (live status board)
- Ringkasan kinerja staff (picking rate, packing rate)

### 2. Manajemen Produk

- CRUD produk dengan SKU, kategori, satuan, gambar
- Import produk via CSV/Excel
- QR code / barcode generator per produk
- Riwayat pergerakan stok per produk
- Set minimum stok & trigger notifikasi

### 3. Penerimaan Barang (Goods Receipt)

- Form penerimaan barang dari supplier (PO-based)
- Input nomor invoice, tanggal, kuantitas per item
- Upload dokumen (surat jalan, invoice PDF)
- Status: PENDING → RECEIVING → QC → PUTAWAY → DONE
- Automatic inventory update setelah putaway

### 4. Quality Control (QC)

- Form inspeksi barang masuk per batch
- Input kuantitas lolos / ditolak + alasan penolakan
- Upload foto barang cacat
- QC report per penerimaan
- Notifikasi ke manager jika reject rate > threshold

### 5. Manajemen Lokasi Gudang (Slotting)

- Konfigurasi zona, baris, rak (A-1-01 format)
- Peta visual gudang (grid layout)
- Kapasitas per lokasi vs isi aktual
- Putaway suggestion berdasarkan zona kategori produk
- Riwayat penggunaan lokasi

### 6. Manajemen Inventaris

- Tampilan stok real-time per produk per lokasi
- Stock opname (cycle count): generate daftar hitung, input aktual, selisih
- Riwayat semua pergerakan stok (masuk, keluar, transfer, penyesuaian)
- Filter & export laporan stok ke Excel / PDF
- Stok di bawah minimum → badge merah + email alert

### 7. Manajemen Pesanan Toko (Order Management)

- CRUD pesanan dari toko dengan detail item & kuantitas
- Status: DRAFT → CONFIRMED → PICKING → PACKING → READY → SHIPPED
- Validasi ketersediaan stok saat konfirmasi
- Prioritas pesanan (normal / urgent)
- Tanggal pengiriman yang dijadwalkan

### 8. Picking (Ambil Barang)

- Generate picking list per order (lokasi → item → qty)
- Assign picking task ke staff
- Konfirmasi picking via scan QR / input manual
- Partial pick: tandai jika stok kurang, notifikasi manager
- Status real-time: berapa item sudah dipick

### 9. Packing

- Form packing: input jumlah box, berat total, catatan khusus
- Cetak packing slip (PDF) dengan detail isi per box
- Label pengiriman (nama toko, alamat, order no)
- Foto dokumentasi packing (opsional upload)
- Konfirmasi siap kirim

### 10. Pengiriman (Shipment)

- Buat surat jalan digital (PDF auto-generate)
- Input kendaraan, nomor polisi, nama driver
- Jadwal keberangkatan & estimasi tiba
- Status: READY → DEPARTED → IN_TRANSIT → DELIVERED
- Tanda terima digital (toko konfirmasi penerimaan)
- Riwayat semua pengiriman per toko

### 11. Manajemen Toko

- CRUD data toko (nama, alamat, kota, kontak)
- Riwayat pesanan & pengiriman per toko
- Rata-rata nilai pesanan per toko

### 12. Manajemen Pengguna & Akses

- Role: ADMIN, MANAGER, STAFF, VIEWER
- Izin per role (bisa baca / tulis / hapus per modul)
- Log aktivitas semua pengguna (audit trail)
- Reset password, aktif / nonaktif akun

### 13. Laporan & Export

- Laporan stok masuk (per supplier, per periode)
- Laporan pengiriman (per toko, per periode)
- Laporan kinerja staff (picking & packing)
- Laporan QC (reject rate per supplier)
- Export semua laporan ke Excel (.xlsx) & PDF
- Jadwal laporan otomatis via email (inngest)

### 14. Notifikasi & Alert

- Toast notifikasi in-app (Sonner)
- Email alert: stok minimum, QC reject tinggi, shipment departed
- Dashboard alert board real-time

---

## UI/UX Guidelines



## Sidebar Navigation Structure

```
Dashboard
├── Penerimaan Barang
│   ├── Daftar Penerimaan
│   └── Tambah Penerimaan
├── Quality Control
├── Inventaris
│   ├── Stok Sekarang
│   ├── Pergerakan Stok
│   └── Stock Opname
├── Lokasi Gudang
├── Pesanan
│   ├── Daftar Pesanan
│   └── Buat Pesanan
├── Picking
├── Packing
├── Pengiriman
├── Toko
├── Produk
├── Supplier
├── Laporan
└── Pengaturan
    ├── Pengguna
    └── Akses & Role
```

---

## Security Requirements

- Semua route API wajib autentikasi (NextAuth session check)
- Role-based access control di middleware Next.js
- Input validation dengan Zod di semua form dan API endpoint
- CSRF protection (built-in NextAuth)
- Rate limiting pada login endpoint
- Semua password di-hash dengan bcrypt
- Audit log untuk semua operasi CRUD sensitif
- File upload: validasi tipe & ukuran, simpan ke storage bukan filesystem

---

## Performance Requirements

- Initial page load < 2 detik (LCP)
- API response < 500ms untuk query umum
- Tabel besar: server-side pagination (max 50 rows/page)
- Image optimization via Next.js Image component
- Database: index pada kolom yang sering di-query (productId, status, createdAt)

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/login/
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   ├── penerimaan/
│   │   ├── qc/
│   │   ├── inventaris/
│   │   ├── lokasi/
│   │   ├── pesanan/
│   │   ├── picking/
│   │   ├── packing/
│   │   ├── pengiriman/
│   │   ├── toko/
│   │   ├── produk/
│   │   ├── supplier/
│   │   ├── laporan/
│   │   └── pengaturan/
│   ├── api/
│   │   ├── auth/
│   │   ├── products/
│   │   ├── stock-in/
│   │   ├── inventory/
│   │   ├── orders/
│   │   ├── shipments/
│   │   └── reports/
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── ui/           ← shadcn/ui components
│   ├── layout/       ← Sidebar, Topbar, PageHeader
│   ├── dashboard/    ← KPI cards, charts
│   ├── forms/        ← Form components per modul
│   └── tables/       ← Data table components
├── lib/
│   ├── prisma.ts
│   ├── auth.ts
│   ├── validations/  ← Zod schemas
│   └── utils.ts
├── hooks/            ← Custom React hooks
├── stores/           ← Zustand stores
└── types/            ← TypeScript types/interfaces
prisma/
├── schema.prisma
└── seed.ts
```

---

## Development Phases

### Phase 1 — Foundation (Week 1-2)

- Setup project: shadcn/ui, Prisma, NextAuth, database
- Layout: sidebar, topbar, auth pages
- Modul: Produk, Supplier, Lokasi Gudang

### Phase 2 — Core Operations (Week 3-4)

- Modul: Penerimaan Barang, QC, Inventaris
- Dashboard KPI dasar
- Alert stok minimum

### Phase 3 — Order Fulfillment (Week 5-6)

- Modul: Pesanan, Picking, Packing
- PDF packing slip & label
- QR scanner picking

### Phase 4 — Shipment & Reports (Week 7-8)

- Modul: Pengiriman, Surat Jalan PDF
- Laporan lengkap + export Excel/PDF
- Email notifications (Resend + inngest)

### Phase 5 — Polish & Deploy (Week 9)

- Stock Opname modul
- Audit Log
- E2E testing (Playwright)
- Deploy ke Vercel + Supabase

---

## Seed Data

Sertakan seed data realistis:

- 3 role user (admin, manager, staff)
- 5 supplier
- 50 produk (3 kategori: elektronik, pakaian, makanan)
- 10 lokasi gudang (zona A, B, C)
- 5 toko
- Contoh penerimaan, pesanan, dan pengiriman

---

## Instructions for AI Agent

1. Baca seluruh AGENTS.md ini sebelum mulai implementasi
2. Gunakan **TypeScript strict mode** — tidak ada `any`
3. Semua komponen wajib **Server Component by default**, gunakan `"use client"` hanya jika diperlukan
4. Ikuti folder structure yang sudah ditentukan di atas
5. Setiap modul baru harus memiliki: page, komponen tabel, form, Zod schema, dan API route
6. Gunakan **Server Actions** untuk mutasi data (create, update, delete)
7. Gunakan **TanStack Query** hanya untuk data yang perlu polling atau optimistic update
8. Semua label, pesan error, dan UI text dalam **Bahasa Indonesia**
9. Implement fitur dari Phase 1 dulu sebelum melanjutkan ke Phase berikutnya
10. Setelah setiap fase selesai, jalankan `npm run build` untuk memastikan tidak ada error
