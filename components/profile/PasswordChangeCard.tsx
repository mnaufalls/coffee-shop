import { LockKey } from "@phosphor-icons/react";

interface PasswordChangeCardProps {
  currentPassword: string;
  setCurrentPassword: (v: string) => void;
  newPassword: string;
  setNewPassword: (v: string) => void;
  confirmPassword: string;
  setConfirmPassword: (v: string) => void;
  isChangingPassword: boolean;
  passwordSuccess: string | null;
  passwordError: string | null;
  onSubmit: (e: React.FormEvent) => void;
}

export function PasswordChangeCard({
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  isChangingPassword,
  passwordSuccess,
  passwordError,
  onSubmit,
}: PasswordChangeCardProps) {
  return (
    <div className="border-2 border-black bg-pink-300 p-6 shadow-[5px_5px_0_0_#000]">
      <div className="flex items-center gap-3 mb-6">
        <LockKey size={32} weight="bold" />
        <h3 className="font-[family-name:var(--font-bricolage)] text-xl font-black uppercase">Security</h3>
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-black uppercase text-zinc-700">Current Password</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            className="w-full border-2 border-black bg-white p-3 font-bold outline-none focus:bg-orange-50"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-black uppercase text-zinc-700">New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={8}
            className="w-full border-2 border-black bg-white p-3 font-bold outline-none focus:bg-orange-50"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-black uppercase text-zinc-700">Confirm New Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
            className="w-full border-2 border-black bg-white p-3 font-bold outline-none focus:bg-orange-50"
          />
        </div>
        {passwordSuccess && (
          <div className="border-2 border-black bg-green-300 p-3 text-sm font-bold">{passwordSuccess}</div>
        )}
        {passwordError && (
          <div className="border-2 border-black bg-red-300 p-3 text-sm font-bold">{passwordError}</div>
        )}
        <button
          type="submit"
          disabled={isChangingPassword}
          className="mt-2 flex w-full items-center justify-center gap-2 border-2 border-black bg-yellow-300 px-5 py-3 font-black shadow-[4px_4px_0_0_#000] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none disabled:cursor-not-allowed disabled:opacity-50 uppercase text-sm"
        >
          {isChangingPassword ? "CHANGING..." : "UPDATE PASSWORD"}
        </button>
      </form>
    </div>
  );
}