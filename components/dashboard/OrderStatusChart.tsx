import { useMemo } from "react";
import type { OrderStatusItem } from "@/hooks/useMonthlyReport";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-300",
  processing: "bg-blue-300",
  completed: "bg-green-300",
  cancelled: "bg-red-300",
  refunded: "bg-gray-300",
};

export function OrderStatusChart({
  orderStatusBreakdown,
}: {
  orderStatusBreakdown: OrderStatusItem[];
}) {
  const maxStatusCount = useMemo(() => {
    const max = orderStatusBreakdown.reduce((m, s) => Math.max(m, s.count), 0);
    return max || 1;
  }, [orderStatusBreakdown]);

  return (
    <div className="border-2 border-black bg-white p-6 shadow-[4px_4px_0_0_#000]">
      <h2 className="mb-4 text-lg font-black font-[family-name:var(--font-bricolage)] uppercase">
        Order Status
      </h2>
      {orderStatusBreakdown.length === 0 ? (
        <p className="text-sm font-bold text-zinc-500">No data</p>
      ) : (
        <div className="space-y-3">
          {orderStatusBreakdown.map((s) => {
            const pct = (s.count / maxStatusCount) * 100;
            return (
              <div key={s.status}>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm font-bold capitalize">{s.status}</span>
                  <span className="text-xs font-bold">{s.count}</span>
                </div>
                <div
                  className={`h-6 border-2 border-black ${STATUS_COLORS[s.status] ?? "bg-gray-300"}`}
                  style={{ width: `${Math.max(pct, 5)}%` }}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}