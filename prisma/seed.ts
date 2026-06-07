import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ─── Users ───────────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash("admin123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@gudanghub.com" },
    update: {},
    create: {
      name: "Admin Sistem",
      email: "admin@gudanghub.com",
      passwordHash,
      role: "ADMIN",
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: "manager@gudanghub.com" },
    update: {},
    create: {
      name: "Budi Manager",
      email: "manager@gudanghub.com",
      passwordHash: await bcrypt.hash("manager123", 12),
      role: "MANAGER",
    },
  });

  const staff = await prisma.user.upsert({
    where: { email: "staff@gudanghub.com" },
    update: {},
    create: {
      name: "Siti Staff",
      email: "staff@gudanghub.com",
      passwordHash: await bcrypt.hash("staff123", 12),
      role: "STAFF",
    },
  });

  console.log("✅ Users:", admin.email, manager.email, staff.email);

  // ─── Suppliers ────────────────────────────────────────────────────────────
  const suppliers = await Promise.all([
    prisma.supplier.upsert({
      where: { id: "supplier-1" },
      update: {},
      create: {
        id: "supplier-1",
        name: "PT Elektronik Maju",
        contact: "Hendra Wijaya",
        email: "hendra@elektronikmaju.co.id",
        phone: "021-5555-1001",
        address: "Jl. Industri No. 45, Jakarta Barat",
      },
    }),
    prisma.supplier.upsert({
      where: { id: "supplier-2" },
      update: {},
      create: {
        id: "supplier-2",
        name: "CV Fashion Textile",
        contact: "Dewi Santoso",
        email: "dewi@fashiontextile.com",
        phone: "022-3333-2002",
        address: "Jl. Tekstil Raya No. 12, Bandung",
      },
    }),
    prisma.supplier.upsert({
      where: { id: "supplier-3" },
      update: {},
      create: {
        id: "supplier-3",
        name: "PT Makanan Sehat Indonesia",
        contact: "Rudi Prasetyo",
        email: "rudi@makansehat.id",
        phone: "031-7777-3003",
        address: "Jl. Pangan No. 88, Surabaya",
      },
    }),
    prisma.supplier.upsert({
      where: { id: "supplier-4" },
      update: {},
      create: {
        id: "supplier-4",
        name: "UD Perabot Nusantara",
        contact: "Agus Hartono",
        email: "agus@perabotnusantara.com",
        phone: "024-4444-4004",
        address: "Jl. Furniture No. 23, Semarang",
      },
    }),
    prisma.supplier.upsert({
      where: { id: "supplier-5" },
      update: {},
      create: {
        id: "supplier-5",
        name: "PT Global Distribusi",
        contact: "Linda Kusuma",
        email: "linda@globaldist.co.id",
        phone: "021-8888-5005",
        address: "Jl. Niaga No. 99, Jakarta Selatan",
      },
    }),
  ]);

  console.log("✅ Suppliers:", suppliers.length);

  // ─── Stores ───────────────────────────────────────────────────────────────
  const stores = await Promise.all([
    prisma.store.upsert({
      where: { id: "store-1" },
      update: {},
      create: {
        id: "store-1",
        name: "Toko Jakarta Pusat",
        address: "Jl. Sudirman No. 1",
        city: "Jakarta",
        contactPerson: "Ahmad Fauzi",
        phone: "021-1111-0001",
      },
    }),
    prisma.store.upsert({
      where: { id: "store-2" },
      update: {},
      create: {
        id: "store-2",
        name: "Toko Bandung Indah",
        address: "Jl. Asia Afrika No. 55",
        city: "Bandung",
        contactPerson: "Rina Marlina",
        phone: "022-2222-0002",
      },
    }),
    prisma.store.upsert({
      where: { id: "store-3" },
      update: {},
      create: {
        id: "store-3",
        name: "Toko Surabaya Jaya",
        address: "Jl. Pemuda No. 77",
        city: "Surabaya",
        contactPerson: "Joko Susilo",
        phone: "031-3333-0003",
      },
    }),
    prisma.store.upsert({
      where: { id: "store-4" },
      update: {},
      create: {
        id: "store-4",
        name: "Toko Yogyakarta Asri",
        address: "Jl. Malioboro No. 10",
        city: "Yogyakarta",
        contactPerson: "Sari Dewi",
        phone: "0274-4444-0004",
      },
    }),
    prisma.store.upsert({
      where: { id: "store-5" },
      update: {},
      create: {
        id: "store-5",
        name: "Toko Medan Prima",
        address: "Jl. Gatot Subroto No. 33",
        city: "Medan",
        contactPerson: "Reza Harahap",
        phone: "061-5555-0005",
      },
    }),
  ]);

  console.log("✅ Stores:", stores.length);

  // ─── Locations ────────────────────────────────────────────────────────────
  const locationData = [
    {
      id: "loc-A-01-01",
      code: "A-01-01",
      zone: "A",
      row: "01",
      shelf: "01",
      capacity: 500,
    },
    {
      id: "loc-A-01-02",
      code: "A-01-02",
      zone: "A",
      row: "01",
      shelf: "02",
      capacity: 500,
    },
    {
      id: "loc-A-02-01",
      code: "A-02-01",
      zone: "A",
      row: "02",
      shelf: "01",
      capacity: 300,
    },
    {
      id: "loc-B-01-01",
      code: "B-01-01",
      zone: "B",
      row: "01",
      shelf: "01",
      capacity: 400,
    },
    {
      id: "loc-B-01-02",
      code: "B-01-02",
      zone: "B",
      row: "01",
      shelf: "02",
      capacity: 400,
    },
    {
      id: "loc-B-02-01",
      code: "B-02-01",
      zone: "B",
      row: "02",
      shelf: "01",
      capacity: 200,
    },
    {
      id: "loc-C-01-01",
      code: "C-01-01",
      zone: "C",
      row: "01",
      shelf: "01",
      capacity: 600,
    },
    {
      id: "loc-C-01-02",
      code: "C-01-02",
      zone: "C",
      row: "01",
      shelf: "02",
      capacity: 600,
    },
    {
      id: "loc-C-02-01",
      code: "C-02-01",
      zone: "C",
      row: "02",
      shelf: "01",
      capacity: 350,
    },
    {
      id: "loc-C-02-02",
      code: "C-02-02",
      zone: "C",
      row: "02",
      shelf: "02",
      capacity: 350,
    },
  ];

  for (const loc of locationData) {
    await prisma.location.upsert({
      where: { code: loc.code },
      update: {},
      create: loc,
    });
  }

  console.log("✅ Locations:", locationData.length);

  // ─── Products ─────────────────────────────────────────────────────────────
  const productData = [
    // Elektronik
    {
      id: "prod-1",
      sku: "EL-001",
      name: "Smartphone Android 5G",
      category: "Elektronik",
      unit: "pcs",
      minStock: 20,
    },
    {
      id: "prod-2",
      sku: "EL-002",
      name: "Laptop 15 inch Core i5",
      category: "Elektronik",
      unit: "pcs",
      minStock: 10,
    },
    {
      id: "prod-3",
      sku: "EL-003",
      name: "TWS Earbuds Bluetooth",
      category: "Elektronik",
      unit: "pcs",
      minStock: 30,
    },
    {
      id: "prod-4",
      sku: "EL-004",
      name: "Tablet 10 inch WiFi",
      category: "Elektronik",
      unit: "pcs",
      minStock: 15,
    },
    {
      id: "prod-5",
      sku: "EL-005",
      name: "Smartwatch Fitness",
      category: "Elektronik",
      unit: "pcs",
      minStock: 25,
    },
    // Pakaian
    {
      id: "prod-6",
      sku: "PK-001",
      name: "Kaos Polos Cotton 30s",
      category: "Pakaian",
      unit: "pcs",
      minStock: 100,
    },
    {
      id: "prod-7",
      sku: "PK-002",
      name: "Kemeja Formal Slim Fit",
      category: "Pakaian",
      unit: "pcs",
      minStock: 50,
    },
    {
      id: "prod-8",
      sku: "PK-003",
      name: "Celana Jeans Skinny",
      category: "Pakaian",
      unit: "pcs",
      minStock: 60,
    },
    {
      id: "prod-9",
      sku: "PK-004",
      name: "Jaket Hoodie Fleece",
      category: "Pakaian",
      unit: "pcs",
      minStock: 40,
    },
    {
      id: "prod-10",
      sku: "PK-005",
      name: "Dress Casual Wanita",
      category: "Pakaian",
      unit: "pcs",
      minStock: 30,
    },
    // Makanan & Minuman
    {
      id: "prod-11",
      sku: "MK-001",
      name: "Snack Keripik Singkong 200g",
      category: "Makanan & Minuman",
      unit: "pcs",
      minStock: 200,
    },
    {
      id: "prod-12",
      sku: "MK-002",
      name: "Minuman Teh Botol 350ml",
      category: "Makanan & Minuman",
      unit: "karton",
      minStock: 50,
    },
    {
      id: "prod-13",
      sku: "MK-003",
      name: "Mie Instant Goreng 85g",
      category: "Makanan & Minuman",
      unit: "karton",
      minStock: 100,
    },
    {
      id: "prod-14",
      sku: "MK-004",
      name: "Kopi Sachet 3in1 20g",
      category: "Makanan & Minuman",
      unit: "karton",
      minStock: 80,
    },
    {
      id: "prod-15",
      sku: "MK-005",
      name: "Susu UHT Full Cream 1L",
      category: "Makanan & Minuman",
      unit: "karton",
      minStock: 60,
    },
  ];

  for (const prod of productData) {
    await prisma.product.upsert({
      where: { sku: prod.sku },
      update: {},
      create: prod,
    });
  }

  console.log("✅ Products:", productData.length);

  // ─── Inventories ──────────────────────────────────────────────────────────
  const inventoryData = [
    { productId: "prod-1", locationId: "loc-A-01-01", quantity: 45 },
    { productId: "prod-2", locationId: "loc-A-01-02", quantity: 18 },
    { productId: "prod-3", locationId: "loc-A-02-01", quantity: 12 }, // low stock
    { productId: "prod-4", locationId: "loc-B-01-01", quantity: 22 },
    { productId: "prod-5", locationId: "loc-B-01-02", quantity: 8 }, // low stock
    { productId: "prod-6", locationId: "loc-B-02-01", quantity: 180 },
    { productId: "prod-7", locationId: "loc-C-01-01", quantity: 65 },
    { productId: "prod-8", locationId: "loc-C-01-02", quantity: 90 },
    { productId: "prod-9", locationId: "loc-C-02-01", quantity: 35 },
    { productId: "prod-10", locationId: "loc-C-02-02", quantity: 15 }, // low stock
    { productId: "prod-11", locationId: "loc-A-01-01", quantity: 350 },
    { productId: "prod-12", locationId: "loc-A-01-02", quantity: 75 },
    { productId: "prod-13", locationId: "loc-B-01-01", quantity: 120 },
    { productId: "prod-14", locationId: "loc-B-01-02", quantity: 95 },
    { productId: "prod-15", locationId: "loc-C-01-01", quantity: 40 },
  ];

  for (const inv of inventoryData) {
    await prisma.inventory.upsert({
      where: {
        productId_locationId: {
          productId: inv.productId,
          locationId: inv.locationId,
        },
      },
      update: { quantity: inv.quantity },
      create: inv,
    });
  }

  console.log("✅ Inventories:", inventoryData.length);

  console.log("\n🎉 Seeding selesai!");
  console.log("\nAkun yang tersedia:");
  console.log("  Admin   : admin@gudanghub.com    | admin123");
  console.log("  Manager : manager@gudanghub.com  | manager123");
  console.log("  Staff   : staff@gudanghub.com    | staff123");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
