import OwnerNavbar from "@/components/owner/navbar";

export default function OwnerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      <OwnerNavbar />
      <main>{children}</main>
    </div>
  );
}
