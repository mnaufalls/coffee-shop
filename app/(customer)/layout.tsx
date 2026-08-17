import CustomerNavbar from "@/components/customer/navbar";

export default function CustomerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <CustomerNavbar />
      <main>{children}</main>
    </>
  );
}