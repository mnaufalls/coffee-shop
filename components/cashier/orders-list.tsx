import OrderCard, {
  type Order,
  type OrderStatus,
} from "./order-card";

type OrdersListProps = {
  orders: Order[];
  updatingId: string | null;
  onUpdateStatus: (
    orderId: string,
    status: OrderStatus,
  ) => void;
};

export default function OrdersList({
  orders,
  updatingId,
  onUpdateStatus,
}: OrdersListProps) {
  if (orders.length === 0) {
    return (
      <div className="border-2 border-black bg-white p-8 text-center shadow-[4px_4px_0_0_#000]">
        <p className="font-bold">No orders found.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-5">
      {orders.map((order) => (
        <OrderCard
          key={order.id}
          order={order}
          updating={updatingId === order.id}
          onUpdateStatus={onUpdateStatus}
        />
      ))}
    </div>
  );
}