import Link from "next/link";
import {
  ArrowRight,
  Coffee,
  ForkKnife,
  Sparkle,
} from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";

type Category = {
  id: string;
  name: string;
};

type Product = {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: string;
  stock: number;
  imageUrl: string | null;
  category: {
    id: string;
    name: string;
  };
};

async function getCategories(): Promise<Category[]> {
  const response = await fetch("http://localhost:3000/api/categories", {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch categories");
  }

  const result: { data: Category[] } = await response.json();

  return result.data;
}

async function getProducts(): Promise<Product[]> {
  const response = await fetch("http://localhost:3000/api/products", {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }

  const result: { data: Product[] } = await response.json();

  return result.data;
}

function formatPrice(price: string) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(price));
}

export default async function Home() {
  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts(),
  ]);

  const featuredProducts = products.slice(0, 4);

  return (
    <div className="overflow-hidden bg-[#f5f0e8]">
      {/* =========================================================
          HERO
      ========================================================= */}
      <section className="border-b-2 border-black">
        <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-14 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-20">
          {/* Hero Content */}
          <div>
            <div className="mb-7 inline-flex -rotate-2 items-center gap-2 border-2 border-black bg-yellow-300 px-4 py-2 font-[family-name:var(--font-dm-sans)] text-sm font-extrabold uppercase shadow-[4px_4px_0_0_#000]">
              <Coffee size={20} weight="bold" />
              Your Daily Coffee
            </div>

            <h1 className="max-w-4xl font-[family-name:var(--font-bricolage)] text-6xl font-extrabold uppercase leading-[0.88] tracking-[-0.04em] sm:text-7xl lg:text-[6.5rem]">
              Good Coffee.
              <br />
              <span className="text-orange-500">Good Mood.</span>
            </h1>

            <p className="mt-7 max-w-xl font-[family-name:var(--font-dm-sans)] text-base font-medium leading-7 text-zinc-700 sm:text-lg sm:leading-8">
              Nikmati kopi favoritmu dengan mudah. Pilih menu, masukkan ke
              cart, dan pesan tanpa ribet.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                href="/menu"
                className="inline-flex items-center gap-2 border-2 border-black bg-black px-6 py-3.5 font-[family-name:var(--font-dm-sans)] text-sm font-extrabold text-white shadow-[5px_5px_0_0_#f59e0b] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none active:translate-x-1 active:translate-y-1 active:shadow-none"
              >
                ORDER NOW
                <ArrowRight size={20} weight="bold" />
              </Link>

              <Link
                href="/menu"
                className="inline-flex items-center gap-2 border-2 border-black bg-white px-6 py-3.5 font-[family-name:var(--font-dm-sans)] text-sm font-extrabold shadow-[5px_5px_0_0_#000] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none active:translate-x-1 active:translate-y-1 active:shadow-none"
              >
                VIEW MENU
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
              <div className="border-2 border-black bg-white px-3 py-2 font-[family-name:var(--font-dm-sans)] text-xs font-bold uppercase">
                Freshly Brewed
              </div>

              <div className="border-2 border-black bg-pink-300 px-3 py-2 font-[family-name:var(--font-dm-sans)] text-xs font-bold uppercase">
                Made With Love
              </div>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="relative flex min-h-[360px] items-center justify-center sm:min-h-[480px]">
            <div className="absolute right-[5%] top-[5%] h-64 w-64 rotate-6 border-2 border-black bg-orange-400 sm:h-80 sm:w-80 lg:h-[380px] lg:w-[380px]" />

            <div className="absolute bottom-[8%] left-[5%] h-24 w-24 -rotate-12 border-2 border-black bg-yellow-300 sm:h-32 sm:w-32" />

            <div className="relative z-10 flex h-64 w-64 -rotate-3 items-center justify-center border-2 border-black bg-white shadow-[9px_9px_0_0_#000] sm:h-80 sm:w-80 lg:h-[380px] lg:w-[380px]">
              <Coffee
                size={170}
                weight="duotone"
                className="h-36 w-36 sm:h-48 sm:w-48 lg:h-56 lg:w-56"
              />

              <div className="absolute -right-7 -top-7 flex h-16 w-16 rotate-12 items-center justify-center border-2 border-black bg-pink-300 shadow-[4px_4px_0_0_#000] sm:h-20 sm:w-20">
                <Sparkle size={32} weight="fill" />
              </div>
            </div>

            <div className="absolute bottom-[4%] right-[2%] z-20 rotate-3 border-2 border-black bg-pink-300 px-4 py-3 font-[family-name:var(--font-dm-sans)] text-xs font-extrabold uppercase shadow-[4px_4px_0_0_#000] sm:text-sm">
              Freshly Brewed
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          CATEGORIES
      ========================================================= */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="mb-2 font-[family-name:var(--font-dm-sans)] text-sm font-extrabold uppercase text-orange-500">
              Explore
            </p>

            <h2 className="font-[family-name:var(--font-bricolage)] text-4xl font-extrabold uppercase tracking-tight sm:text-5xl">
              Browse Categories
            </h2>
          </div>

          <Link
            href="/menu"
            className="hidden items-center gap-2 font-[family-name:var(--font-dm-sans)] text-sm font-extrabold uppercase underline decoration-2 underline-offset-4 sm:flex"
          >
            See All
            <ArrowRight size={18} weight="bold" />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category, index) => (
            <Link
              key={category.id}
              href={`/menu?categoryId=${category.id}`}
              className="group flex items-center justify-between border-2 border-black bg-white p-5 shadow-[5px_5px_0_0_#000] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center border-2 border-black ${
                    index % 2 === 0 ? "bg-yellow-300" : "bg-pink-300"
                  }`}
                >
                  <ForkKnife size={24} weight="bold" />
                </div>

                <span className="font-[family-name:var(--font-dm-sans)] text-sm font-extrabold uppercase sm:text-base">
                  {category.name}
                </span>
              </div>

              <ArrowRight
                size={22}
                weight="bold"
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          ))}
        </div>
      </section>

      {/* =========================================================
          FEATURED PRODUCTS
      ========================================================= */}
      <section className="border-y-2 border-black bg-orange-100">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="mb-2 font-[family-name:var(--font-dm-sans)] text-sm font-extrabold uppercase text-orange-600">
                Our Picks
              </p>

              <h2 className="font-[family-name:var(--font-bricolage)] text-4xl font-extrabold uppercase tracking-tight sm:text-5xl">
                Popular Menu
              </h2>
            </div>

            <Link
              href="/menu"
              className="hidden items-center gap-2 font-[family-name:var(--font-dm-sans)] text-sm font-extrabold uppercase underline decoration-2 underline-offset-4 sm:flex"
            >
              View Menu
              <ArrowRight size={18} weight="bold" />
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product) => {
              const isOutOfStock = product.stock <= 0;

              return (
                <Link
                  key={product.id}
                  href={`/menu/${product.id}`}
                  className={`group overflow-hidden border-2 border-black bg-white shadow-[5px_5px_0_0_#000] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none ${
                    isOutOfStock ? "opacity-60" : ""
                  }`}
                >
                  <div className="relative flex aspect-square items-center justify-center border-b-2 border-black bg-zinc-100">
                    {product.imageUrl ? (
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <Coffee size={72} weight="duotone" />
                    )}
                  </div>

                  <div className="p-5">
                    <p className="mb-1 font-[family-name:var(--font-dm-sans)] text-xs font-extrabold uppercase text-zinc-500">
                      {product.category.name}
                    </p>

                    <h3 className="font-[family-name:var(--font-bricolage)] text-xl font-extrabold uppercase">
                      {product.name}
                    </h3>

                    <p className="mt-2 line-clamp-2 font-[family-name:var(--font-dm-sans)] text-sm leading-6 text-zinc-600">
                      {product.description}
                    </p>

                    <div className="mt-5 flex items-center justify-between gap-3">
                      <span className="font-[family-name:var(--font-dm-sans)] text-lg font-extrabold">
                        {formatPrice(product.price)}
                      </span>

                      <span
                        className={`border-2 border-black px-2 py-1 font-[family-name:var(--font-dm-sans)] text-[10px] font-extrabold uppercase ${
                          isOutOfStock ? "bg-zinc-300" : "bg-green-300"
                        }`}
                      >
                        {isOutOfStock ? "Sold Out" : "Available"}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          <Link
            href="/menu"
            className="mt-8 inline-flex items-center gap-2 border-2 border-black bg-white px-5 py-3 font-[family-name:var(--font-dm-sans)] text-sm font-extrabold uppercase shadow-[4px_4px_0_0_#000] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none sm:hidden"
          >
            View All Menu
            <ArrowRight size={18} weight="bold" />
          </Link>
        </div>
      </section>

      {/* =========================================================
          FINAL CTA
      ========================================================= */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <div className="border-2 border-black bg-black p-8 text-white shadow-[8px_8px_0_0_#f59e0b] sm:p-12 lg:p-14">
          <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
            <div>
              <p className="mb-2 font-[family-name:var(--font-dm-sans)] text-sm font-extrabold uppercase text-yellow-300">
                Ready to Order?
              </p>

              <h2 className="max-w-2xl font-[family-name:var(--font-bricolage)] text-4xl font-extrabold uppercase leading-none tracking-tight sm:text-5xl lg:text-6xl">
                Your next cup is waiting.
              </h2>
            </div>

            <Link
              href="/menu"
              className="inline-flex shrink-0 items-center gap-2 border-2 border-black bg-yellow-300 px-6 py-3.5 font-[family-name:var(--font-dm-sans)] text-sm font-extrabold text-black shadow-[5px_5px_0_0_#fff] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
            >
              EXPLORE MENU
              <ArrowRight size={20} weight="bold" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}