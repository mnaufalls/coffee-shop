import Link from "next/link";
import { ArrowLeft, Coffee } from "@phosphor-icons/react/dist/ssr";

import ProductDetail from "@/components/customer/product-detail";
import { getProduct } from "@/lib/api";

type ProductDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return (
      <main className="min-h-[calc(100vh-4rem)] bg-[#f5f0e8] px-4 py-20">
        <div className="mx-auto max-w-2xl border-2 border-black bg-white p-10 text-center shadow-[6px_6px_0_0_#000]">
          <Coffee size={72} weight="duotone" className="mx-auto mb-6" />
          <h1 className="text-3xl font-black uppercase">Product Not Found</h1>
          <p className="mt-3 text-zinc-600">The product you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/menu" className="mt-8 inline-flex items-center gap-2 border-2 border-black bg-yellow-300 px-5 py-3 font-black shadow-[4px_4px_0_0_#000] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none">
            <ArrowLeft size={20} weight="bold" />
            BACK TO MENU
          </Link>
        </div>
      </main>
    );
  }

  return <ProductDetail product={product} />;
}