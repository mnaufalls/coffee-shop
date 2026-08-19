import { X } from "@phosphor-icons/react";

interface StaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit" | "password";
  editingName?: string;
  form: {
    name: string;
    email: string;
    phoneNumber: string;
    password: string;
  };
  setForm: (form: any) => void;
  formErrors: Record<string, string>;
  submitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export function StaffModal({
  isOpen,
  onClose,
  mode,
  editingName,
  form,
  setForm,
  formErrors,
  submitting,
  onSubmit,
}: StaffModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="mx-4 w-full max-w-md border-2 border-black bg-white p-6 shadow-[5px_5px_0_0_#000]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-black font-[family-name:var(--font-bricolage)] uppercase">
            {mode === "create" && "Add Staff"}
            {mode === "edit" && "Edit Staff"}
            {mode === "password" && "Change Password"}
          </h2>
          <button onClick={onClose} className="p-1">
            <X size={20} weight="bold" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {mode === "password" ? (
            <>
              <p className="text-sm font-bold">Changing password for: {editingName}</p>
              <div>
                <label className="mb-1 block text-sm font-bold">New Password</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full border-2 border-black bg-white px-4 py-3 text-sm font-bold outline-none focus:bg-orange-50"
                  required
                  minLength={8}
                />
                {formErrors.password && (
                  <p className="mt-1 text-xs font-bold text-red-600">{formErrors.password[0]}</p>
                )}
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="mb-1 block text-sm font-bold">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border-2 border-black bg-white px-4 py-3 text-sm font-bold outline-none focus:bg-orange-50"
                  required
                />
                {formErrors.name && <p className="mt-1 text-xs font-bold text-red-600">{formErrors.name[0]}</p>}
              </div>
              <div>
                <label className="mb-1 block text-sm font-bold">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full border-2 border-black bg-white px-4 py-3 text-sm font-bold outline-none focus:bg-orange-50"
                  required
                />
                {formErrors.email && <p className="mt-1 text-xs font-bold text-red-600">{formErrors.email[0]}</p>}
              </div>
              <div>
                <label className="mb-1 block text-sm font-bold">Phone Number</label>
                <input
                  type="text"
                  value={form.phoneNumber}
                  onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                  className="w-full border-2 border-black bg-white px-4 py-3 text-sm font-bold outline-none focus:bg-orange-50"
                  required
                />
                {formErrors.phoneNumber && (
                  <p className="mt-1 text-xs font-bold text-red-600">{formErrors.phoneNumber[0]}</p>
                )}
              </div>
              {mode === "create" && (
                <div>
                  <label className="mb-1 block text-sm font-bold">Password</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full border-2 border-black bg-white px-4 py-3 text-sm font-bold outline-none focus:bg-orange-50"
                    required
                    minLength={8}
                  />
                  {formErrors.password && (
                    <p className="mt-1 text-xs font-bold text-red-600">{formErrors.password[0]}</p>
                  )}
                </div>
              )}
            </>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="border-2 border-black bg-white px-4 py-2 text-sm font-black shadow-[3px_3px_0_0_#000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 border-2 border-black bg-yellow-300 px-4 py-2 text-sm font-black shadow-[3px_3px_0_0_#000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Saving..." : mode === "password" ? "Change Password" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}