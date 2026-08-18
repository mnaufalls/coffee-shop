export type OrderStatus =
  | "pending"
  | "processing"
  | "completed"
  | "cancelled";

export type OrderDetail = {
  id: string;
  productId: string;
  productName: string;
  price: string;
  quantity: number;
  subtotal: string;
};

export type Order = {
  id: string;
  orderType: "dine_in" | "takeaway";
  subtotal: string;
  discountAmount: string;
  taxPercentage: string;
  taxAmount: string;
  totalAmount: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
  } | null;
  cashier: {
    id: string;
    name: string;
    email: string;
  } | null;
  orderDetails: OrderDetail[];
};

type OrderCardProps = {
  order: Order;
  updating: boolean;
  onUpdateStatus: (
    orderId: string,
    status: OrderStatus,
  ) => void;
  showActions?: boolean;
};

const statusLabels: Record<OrderStatus, string> = {
  pending: "Pending",
  processing: "Processing",
  completed: "Completed",
  cancelled: "Cancelled",
};

const statusClasses: Record<OrderStatus, string> = {
  pending: "bg-yellow-300",
  processing: "bg-blue-300",
  completed: "bg-green-300",
  cancelled: "bg-red-300",
};

function formatRupiah(value: string) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

function formatOrderId(id: string) {
  return `#${id.slice(-8).toUpperCase()}`;
}

function getNextStatuses(status: OrderStatus) {
  if (status === "pending") {
    return ["processing", "cancelled"] as const;
  }

  if (status === "processing") {
    return ["completed", "cancelled"] as const;
  }

  return [];
}

export default function OrderCard({
  order,
  updating,
  onUpdateStatus,
  showActions = true,
}: OrderCardProps) {
  const nextStatuses = getNextStatuses(order.status);

  return (
    <article className="border-2 border-black bg-white p-5 shadow-[4px_4px_0_0_#000]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-black">
              {formatOrderId(order.id)}
            </h3>

            <span
              className={`border-2 border-black px-3 py-1 text-xs font-black uppercase ${statusClasses[order.status]}`}
            >
              {statusLabels[order.status]}
            </span>

            <span className="border-2 border-black px-3 py-1 text-xs font-bold">
              {order.orderType === "dine_in"
                ? "Dine In"
                : "Takeaway"}
            </span>
          </div>

          <p className="text-sm font-bold">
            {order.customer?.name ?? "Walk-in Customer"}
          </p>

          <p className="text-xs text-zinc-600">
            {new Date(order.createdAt).toLocaleString(
              "id-ID",
            )}
          </p>
        </div>

        <div className="lg:text-right">
          <p className="text-sm font-bold uppercase">
            Total
          </p>

          <p className="text-xl font-black">
            {formatRupiah(order.totalAmount)}
          </p>
        </div>
      </div>

      <div className="my-5 border-t-2 border-black" />

      <div className="space-y-2">
        {order.orderDetails.map((detail) => (
          <div
            key={detail.id}
            className="flex items-center justify-between text-sm"
          >
            <span className="font-medium">
              {detail.quantity} x {detail.productName}
            </span>

            <span className="font-bold">
              {formatRupiah(detail.subtotal)}
            </span>
          </div>
        ))}
      </div>

      {showActions && nextStatuses.length > 0 && (
        <>
          <div className="my-5 border-t-2 border-black" />

          <div className="flex flex-wrap gap-3">
            {nextStatuses.map((status) => (
              <button
                key={status}
                type="button"
                disabled={updating}
                onClick={() =>
                  onUpdateStatus(order.id, status)
                }
                className="border-2 border-black bg-yellow-300 px-4 py-2 text-sm font-black uppercase shadow-[3px_3px_0_0_#000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:cursor-not-allowed disabled:opacity-50"
              >
                {updating
                  ? "Updating..."
                  : statusLabels[status]}
              </button>
            ))}
          </div>
        </>
      )}
    </article>
  );
}
