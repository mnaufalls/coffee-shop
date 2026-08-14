import { create } from "zustand";

export type CartProduct = {
  id: string;
  name: string;
  price: string;
  imageUrl: string | null;
  stock: number;
  category: {
    id: string;
    name: string;
  };
};

export type CartItem = {
  product: CartProduct;
  quantity: number;
};

type CartStore = {
  items: CartItem[];

  addItem: (product: CartProduct, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
};

export const useCartStore = create<CartStore>((set) => ({
  items: [],

  addItem: (product, quantity = 1) =>
    set((state) => {
      const existingItem = state.items.find(
        (item) => item.product.id === product.id,
      );

      if (existingItem) {
        const newQuantity = Math.min(
          existingItem.quantity + quantity,
          product.stock,
        );

        return {
          items: state.items.map((item) =>
            item.product.id === product.id
              ? {
                  ...item,
                  quantity: newQuantity,
                }
              : item,
          ),
        };
      }

      return {
        items: [
          ...state.items,
          {
            product,
            quantity: Math.min(quantity, product.stock),
          },
        ],
      };
    }),

  removeItem: (productId) =>
    set((state) => ({
      items: state.items.filter(
        (item) => item.product.id !== productId,
      ),
    })),

  updateQuantity: (productId, quantity) =>
    set((state) => ({
      items: state.items
        .map((item) => {
          if (item.product.id !== productId) {
            return item;
          }

          const safeQuantity = Math.min(
            Math.max(quantity, 1),
            item.product.stock,
          );

          return {
            ...item,
            quantity: safeQuantity,
          };
        })
        .filter((item) => item.quantity > 0),
    })),

  clearCart: () => set({ items: [] }),
}));