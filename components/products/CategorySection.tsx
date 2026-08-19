import { Plus, PencilSimple, TrashSimple } from "@phosphor-icons/react";

type Category = {
  id: string;
  name: string;
};

interface CategorySectionProps {
  categories: Category[];
  onAdd: () => void;
  onEdit: (cat: Category) => void;
  onDelete: (id: string, name: string) => void;
}

export function CategorySection({ categories, onAdd, onEdit, onDelete }: CategorySectionProps) {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-black">Categories</h2>
        <button
          type="button"
          onClick={onAdd}
          className="flex items-center gap-2 border-2 border-black bg-yellow-300 px-4 py-2 text-sm font-black uppercase shadow-[3px_3px_0_0_#000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
        >
          <Plus size={18} weight="bold" />
          Add Category
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="flex items-center justify-between border-2 border-black bg-white p-4 shadow-[3px_3px_0_0_#000]"
          >
            <span className="font-black">{cat.name}</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onEdit(cat)}
                className="border-2 border-black bg-blue-200 p-1.5 shadow-[2px_2px_0_0_#000] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
              >
                <PencilSimple size={12} weight="bold" />
              </button>
              <button
                type="button"
                onClick={() => onDelete(cat.id, cat.name)}
                className="border-2 border-black bg-red-300 p-1.5 shadow-[2px_2px_0_0_#000] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
              >
                <TrashSimple size={12} weight="bold" />
              </button>
            </div>
          </div>
        ))}
        {categories.length === 0 && (
          <div className="col-span-full border-2 border-black bg-white p-8 text-center shadow-[4px_4px_0_0_#000]">
            <p className="font-bold">No categories found.</p>
          </div>
        )}
      </div>
    </section>
  );
}