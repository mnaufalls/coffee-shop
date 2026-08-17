import CashierNavbar from "@/components/cashier/navbar";

export default function CashierLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      <CashierNavbar />
      <main>{children}</main>
    </div>
  );
}