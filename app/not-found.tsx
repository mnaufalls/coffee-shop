import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f0e8] px-4">
      <div className="border-2 border-black bg-white p-10 text-center shadow-[8px_8px_0_0_#000] sm:p-14">
        <p className="font-[family-name:var(--font-bricolage)] text-8xl font-extrabold uppercase sm:text-[10rem]">
          404
        </p>

        <h1 className="mt-4 font-[family-name:var(--font-bricolage)] text-3xl font-extrabold uppercase sm:text-4xl">
          Page Not Found
        </h1>

        <p className="mt-3 font-[family-name:var(--font-dm-sans)] text-zinc-600">
          The page you&apos;re looking for doesn&apos;t
          exist.
        </p>

        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 border-2 border-black bg-yellow-300 px-6 py-3 font-[family-name:var(--font-dm-sans)] font-extrabold uppercase shadow-[4px_4px_0_0_#000] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
        >
          <ArrowLeft size={20} weight="bold" />
          BACK TO HOME
        </Link>
      </div>
    </div>
  );
}
