import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { ProductForm } from "../../product-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) notFound();

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/produk">
          <button className="btn-icon">
            <ArrowLeft className="h-4 w-4" />
          </button>
        </Link>
        <PageHeader title="Edit Produk" description={product.name} />
      </div>
      <ProductForm
        defaultValues={{
          sku: product.sku,
          name: product.name,
          category: product.category,
          unit: product.unit,
          description: product.description ?? "",
          imageUrl: product.imageUrl ?? "",
          minStock: product.minStock,
        }}
        productId={id}
      />
    </div>
  );
}
