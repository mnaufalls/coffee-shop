export type Category = {
  id: string;
  name: string;
};

export type Product = {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: string;
  stock: number;
  isAvailable: boolean;
  imageUrl: string | null;
  category: {
    id: string;
    name: string;
  };
};

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
  status: "pending" | "processing" | "completed" | "cancelled" | "refunded";
  note: string | null;
  createdAt: string;
  orderDetails: OrderDetail[];
};

export type Meta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};
