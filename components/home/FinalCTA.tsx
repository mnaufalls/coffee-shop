import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";

export function FinalCTA() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
      <div className="border-2 border-black bg-black p-8 text-white shadow-[8px_8px_0_0_#f59e0b] sm:p-12 lg:p-14">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div>
            <p className="mb-2 font-[family-name:var(--font-dm-sans)] text-sm font-extrabold uppercase text-yellow-300">Ready to Order?</p>
            <h2 className="max-w-2xl font-[family-name:var(--font-bricolage)] text-4xl font-extrabold uppercase leading-none tracking-tight sm:text-5xl lg:text-6xl">
              Your next cup is waiting.
            </h2>
          </div>
          <Link href="/menu" className="inline-flex shrink-0 items-center gap-2 border-2 border-black bg-yellow-300 px-6 py-3.5 font-[family-name:var(--font-dm-sans)] text-sm font-extrabold text-black shadow-[5px_5px_0_0_#fff] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none">
            EXPLORE MENU
            <ArrowRight size={20} weight="bold" />
          </Link>
        </div>
      </div>
    </section>
  );
}