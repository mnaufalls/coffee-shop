import Link from "next/link";
import { ArrowRight, Coffee, ForkKnife, Sparkle } from "@phosphor-icons/react/dist/ssr";

export function HeroSection() {
  return (
    <section className="border-b-2 border-black">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-14 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-20">
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
            Nikmati kopi favoritmu dengan mudah. Pilih menu, masukkan ke cart, dan pesan tanpa ribet.
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <Link href="/menu" className="inline-flex items-center gap-2 border-2 border-black bg-black px-6 py-3.5 font-[family-name:var(--font-dm-sans)] text-sm font-extrabold text-white shadow-[5px_5px_0_0_#f59e0b] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none active:translate-x-1 active:translate-y-1 active:shadow-none">
              ORDER NOW
              <ArrowRight size={20} weight="bold" />
            </Link>
            <Link href="/menu" className="inline-flex items-center gap-2 border-2 border-black bg-white px-6 py-3.5 font-[family-name:var(--font-dm-sans)] text-sm font-extrabold shadow-[5px_5px_0_0_#000] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none active:translate-x-1 active:translate-y-1 active:shadow-none">
              VIEW MENU
            </Link>
          </div>
          <div className="mt-10 flex flex-wrap gap-3">
            <div className="border-2 border-black bg-white px-3 py-2 font-[family-name:var(--font-dm-sans)] text-xs font-bold uppercase">Freshly Brewed</div>
            <div className="border-2 border-black bg-pink-300 px-3 py-2 font-[family-name:var(--font-dm-sans)] text-xs font-bold uppercase">Made With Love</div>
          </div>
        </div>
        <div className="relative flex min-h-[360px] items-center justify-center sm:min-h-[480px]">
          <div className="absolute right-[5%] top-[5%] h-64 w-64 rotate-6 border-2 border-black bg-orange-400 sm:h-80 sm:w-80 lg:h-[380px] lg:w-[380px]" />
          <div className="absolute bottom-[8%] left-[5%] h-24 w-24 -rotate-12 border-2 border-black bg-yellow-300 sm:h-32 sm:w-32" />
          <div className="relative z-10 flex h-64 w-64 -rotate-3 items-center justify-center border-2 border-black bg-white shadow-[9px_9px_0_0_#000] sm:h-80 sm:w-80 lg:h-[380px] lg:w-[380px]">
            <Coffee size={170} weight="duotone" className="h-36 w-36 sm:h-48 sm:w-48 lg:h-56 lg:w-56" />
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
  );
}