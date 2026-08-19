import { SignOut } from "@phosphor-icons/react";

interface LogoutCardProps {
  isLoggingOut: boolean;
  onLogout: () => void;
}

export function LogoutCard({ isLoggingOut, onLogout }: LogoutCardProps) {
  return (
    <div className="flex flex-col items-center justify-center border-2 border-black bg-red-300 p-6 text-center shadow-[5px_5px_0_0_#000]">
      <SignOut size={48} weight="bold" className="mb-4" />
      <h3 className="font-[family-name:var(--font-bricolage)] text-xl font-black uppercase">Done for now?</h3>
      <p className="mt-2 text-sm font-bold text-zinc-700">Stay caffeinated out there.</p>
      <button
        type="button"
        onClick={onLogout}
        disabled={isLoggingOut}
        className="mt-6 border-2 border-black bg-white px-8 py-3 font-black shadow-[3px_3px_0_0_#000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:cursor-not-allowed disabled:opacity-50 uppercase text-sm"
      >
        {isLoggingOut ? "LOGGING OUT..." : "LOGOUT"}
      </button>
    </div>
  );
}