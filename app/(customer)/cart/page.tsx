import CartContent from "@/components/customer/cart-content";
import { getCurrentUser } from "@/lib/auth/current-user";

export default async function CartPage() {
  const user = await getCurrentUser();

  return <CartContent isAuthenticated={Boolean(user)} />;
}