type CashierProfile = {
  name: string;
  email: string;
  phoneNumber: string;
  role: string;
  createdAt: string;
};

type ProfileCardProps = {
  user: CashierProfile;
};

function formatRole(role: string) {
  return role.replace("_", " ").toUpperCase();
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
  }).format(new Date(date));
}

export default function ProfileCard({
  user,
}: ProfileCardProps) {
  return (
    <section className="border-2 border-black bg-white p-6 shadow-[5px_5px_0_0_#000]">
      <div className="mb-6">
        <p className="text-sm font-bold uppercase tracking-wide">
          Account
        </p>

        <h2 className="mt-1 text-2xl font-black">
          Cashier Profile
        </h2>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <p className="text-xs font-black uppercase text-zinc-500">
            Name
          </p>
          <p className="mt-1 font-bold">{user.name}</p>
        </div>

        <div>
          <p className="text-xs font-black uppercase text-zinc-500">
            Role
          </p>
          <span className="mt-1 inline-block border-2 border-black bg-yellow-300 px-3 py-1 text-xs font-black">
            {formatRole(user.role)}
          </span>
        </div>

        <div>
          <p className="text-xs font-black uppercase text-zinc-500">
            Email
          </p>
          <p className="mt-1 font-bold">{user.email}</p>
        </div>

        <div>
          <p className="text-xs font-black uppercase text-zinc-500">
            Phone
          </p>
          <p className="mt-1 font-bold">
            {user.phoneNumber || "-"}
          </p>
        </div>

        <div>
          <p className="text-xs font-black uppercase text-zinc-500">
            Joined
          </p>
          <p className="mt-1 font-bold">
            {formatDate(user.createdAt)}
          </p>
        </div>
      </div>
    </section>
  );
}