import { create } from "zustand";
import { persist } from "zustand/middleware";

type CartLine = {
  product_id: number;
  name: string;
  price: number;
  quantity: number;
};

type CartState = {
  restaurantId: number | null;
  items: CartLine[];
  addItem: (restaurantId: number, item: Omit<CartLine, "quantity">) => void;
  decrementItem: (productId: number) => void;
  removeItem: (productId: number) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      restaurantId: null,
      items: [],
      addItem: (restaurantId, item) => {
        const current = get();
        if (current.restaurantId && current.restaurantId !== restaurantId) {
          set({ restaurantId, items: [{ ...item, quantity: 1 }] });
          return;
        }

        const existing = current.items.find((line) => line.product_id === item.product_id);
        if (existing) {
          set({
            restaurantId,
            items: current.items.map((line) =>
              line.product_id === item.product_id ? { ...line, quantity: line.quantity + 1 } : line
            )
          });
          return;
        }

        set({ restaurantId, items: [...current.items, { ...item, quantity: 1 }] });
      },
      decrementItem: (productId) => {
        const current = get();
        const items = current.items
          .map((line) => (line.product_id === productId ? { ...line, quantity: line.quantity - 1 } : line))
          .filter((line) => line.quantity > 0);

        set({
          items,
          restaurantId: items.length ? current.restaurantId : null
        });
      },
      removeItem: (productId) => {
        const current = get();
        const items = current.items.filter((line) => line.product_id !== productId);
        set({
          items,
          restaurantId: items.length ? current.restaurantId : null
        });
      },
      clear: () => set({ restaurantId: null, items: [] })
    }),
    {
      name: "delivery-cart"
    }
  )
);
