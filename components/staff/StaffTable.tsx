import { PencilSimple, Trash, Key, Check } from "@phosphor-icons/react";

interface Staff {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  role: string;
  isActive: boolean;
}

interface StaffTableProps {
  staff: Staff[];
  onEdit: (s: Staff) => void;
  onToggleActive: (s: Staff) => void;
  onPassword: (s: Staff) => void;
}

export function StaffTable({ staff, onEdit, onToggleActive, onPassword }: StaffTableProps) {
  if (staff.length === 0) {
    return (
      <div className="border-2 border-black bg-white p-8 text-center shadow-[4px_4px_0_0_#000]">
        <p className="font-bold">No staff found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border-2 border-black bg-white shadow-[4px_4px_0_0_#000]">
      <table className="w-full text-left text-sm">
        <thead className="border-b-2 border-black bg-yellow-300">
          <tr>
            <th className="px-4 py-3 font-black uppercase">Name</th>
            <th className="px-4 py-3 font-black uppercase">Email</th>
            <th className="px-4 py-3 font-black uppercase">Phone</th>
            <th className="px-4 py-3 font-black uppercase">Role</th>
            <th className="px-4 py-3 font-black uppercase">Status</th>
            <th className="px-4 py-3 font-black uppercase text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {staff.map((s) => (
            <tr key={s.id} className="border-b border-zinc-200 last:border-b-0 hover:bg-orange-50">
              <td className="px-4 py-3 font-bold">{s.name}</td>
              <td className="px-4 py-3 font-bold">{s.email}</td>
              <td className="px-4 py-3 font-bold">{s.phoneNumber}</td>
              <td className="px-4 py-3 font-bold capitalize">{s.role}</td>
              <td className="px-4 py-3">
                <span
                  className={`inline-block border-2 border-black px-2 py-0.5 text-xs font-black ${
                    s.isActive ? "bg-green-300" : "bg-red-300"
                  }`}
                >
                  {s.isActive ? "Active" : "Inactive"}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => onEdit(s)}
                    className="border-2 border-black bg-blue-200 p-1.5 shadow-[2px_2px_0_0_#000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                    title="Edit"
                  >
                    <PencilSimple size={14} weight="bold" />
                  </button>
                  <button
                    onClick={() => onToggleActive(s)}
                    className={`border-2 border-black p-1.5 shadow-[2px_2px_0_0_#000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none ${
                      s.isActive ? "bg-red-200" : "bg-green-200"
                    }`}
                    title={s.isActive ? "Deactivate" : "Activate"}
                  >
                    {s.isActive ? <Trash size={14} weight="bold" /> : <Check size={14} weight="bold" />}
                  </button>
                  <button
                    onClick={() => onPassword(s)}
                    className="border-2 border-black bg-yellow-200 p-1.5 shadow-[2px_2px_0_0_#000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                    title="Change Password"
                  >
                    <Key size={14} weight="bold" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}