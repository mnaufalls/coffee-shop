import { UserCircle } from "@phosphor-icons/react";

type Profile = {
  name: string;
  email: string;
  phoneNumber: string;
  role: string;
  createdAt: string;
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function ProfileSummary({ profile }: { profile: Profile }) {
  return (
    <section className="border-2 border-black bg-white p-6 shadow-[5px_5px_0_0_#000] sm:flex sm:items-center sm:gap-8">
      <div className="mb-6 flex h-24 w-24 shrink-0 items-center justify-center border-2 border-black bg-orange-300 sm:mb-0 sm:h-32 sm:w-32">
        <UserCircle size={64} weight="bold" className="text-black" />
      </div>
      <div className="flex-grow text-center sm:text-left">
        <h2 className="font-[family-name:var(--font-bricolage)] text-2xl font-black uppercase sm:text-3xl">
          {profile.name}
        </h2>
        <div className="mt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
          <span className="border-2 border-black bg-yellow-300 px-3 py-1 text-xs font-black uppercase">
            {profile.role}
          </span>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-4 border-t-4 border-black pt-4 sm:grid-cols-3 text-left">
          <div>
            <p className="text-xs font-black uppercase text-orange-600">Email</p>
            <p className="mt-1 break-all font-bold">{profile.email}</p>
          </div>
          <div>
            <p className="text-xs font-black uppercase text-orange-600">Phone</p>
            <p className="mt-1 font-bold">{profile.phoneNumber}</p>
          </div>
          <div>
            <p className="text-xs font-black uppercase text-orange-600">Member Since</p>
            <p className="mt-1 font-bold">{formatDate(profile.createdAt)}</p>
          </div>
        </div>
      </div>
    </section>
  );
}