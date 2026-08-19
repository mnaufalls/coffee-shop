import { getCategories, getProducts } from "@/lib/api";
import { HeroSection } from "@/components/home/HeroSection";
import { CategoriesSection } from "@/components/home/CategoriesSection";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { FinalCTA } from "@/components/home/FinalCTA";

export default async function Home() {
  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts(),
  ]);

  const featuredProducts = products.slice(0, 4);

  return (
    <div className="overflow-hidden bg-[#f5f0e8]">
      <HeroSection />
      <CategoriesSection categories={categories} />
      <FeaturedProducts products={featuredProducts} />
      <FinalCTA />
    </div>
  );
}