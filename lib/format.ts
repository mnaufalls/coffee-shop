export function formatPrice(price: string) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(price));
}

export function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function getStatusClass(status: string) {
  switch (status) {
    case "completed":
      return "bg-green-300";
    case "processing":
      return "bg-orange-300";
    case "cancelled":
      return "bg-red-300";
    case "refunded":
      return "bg-purple-300";
    default:
      return "bg-yellow-300";
  }
}

export function formatStatus(status: string) {
  return status.replace("_", " ").toUpperCase();
}