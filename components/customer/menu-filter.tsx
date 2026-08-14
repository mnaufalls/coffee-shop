"use client";

import { MagnifyingGlass, X } from "@phosphor-icons/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

type Category = {
  id: string;
  name: string;
};

type MenuFilterProps = {
  categories: Category[];
};

export default function MenuFilter({ categories }: MenuFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSearch = searchParams.get("search") ?? "";
  const currentCategory = searchParams.get("categoryId") ?? "";

  const [search, setSearch] = useState(currentSearch);

  function updateParams(searchValue: string, categoryId: string) {
    const params = new URLSearchParams();

    if (searchValue.trim()) {
      params.set("search", searchValue.trim());
    }

    if (categoryId) {
      params.set("categoryId", categoryId);
    }

    const query = params.toString();

    router.push(query ? `${pathname}?${query}` : pathname);
  }

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateParams(search, currentCategory);
  }

  function handleCategoryChange(categoryId: string) {
    updateParams(currentSearch, categoryId);
  }

  function clearFilters() {
    setSearch("");
    router.push(pathname);
  }

  const hasFilters = Boolean(currentSearch || currentCategory);

  return (
    <div className="space-y-5">
      <form onSubmit={handleSearchSubmit} className="flex gap-3">
        <div className="relative flex-1">
          <MagnifyingGlass
            size={22}
            weight="bold"
            className="absolute left-4 top-1/2 -translate-y-1/2"
          />

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search your favorite coffee..."
            className="h-12 w-full border-2 border-black bg-white pl-12 pr-4 font-medium outline-none placeholder:text-zinc-400 focus:shadow-[4px_4px_0_0_#000]"
          />
        </div>

        <button
          type="submit"
          className="border-2 border-black bg-yellow-300 px-5 font-black shadow-[4px_4px_0_0_#000] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
        >
          SEARCH
        </button>
      </form>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => handleCategoryChange("")}
          className={`border-2 border-black px-4 py-2 text-sm font-black transition-all ${
            !currentCategory
              ? "bg-black text-white"
              : "bg-white hover:bg-zinc-100"
          }`}
        >
          ALL
        </button>

        {categories.map((category) => {
          const active = currentCategory === category.id;

          return (
            <button
              key={category.id}
              type="button"
              onClick={() => handleCategoryChange(category.id)}
              className={`border-2 border-black px-4 py-2 text-sm font-black uppercase transition-all ${
                active
                  ? "bg-orange-400"
                  : "bg-white hover:bg-orange-100"
              }`}
            >
              {category.name}
            </button>
          );
        })}

        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="flex items-center gap-1 px-3 py-2 text-sm font-black underline"
          >
            <X size={16} weight="bold" />
            CLEAR
          </button>
        )}
      </div>
    </div>
  );
}