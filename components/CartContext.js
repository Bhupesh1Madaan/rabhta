'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('rabhta_cart');
      if (stored) setItems(JSON.parse(stored));
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem('rabhta_cart', JSON.stringify(items));
  }, [items]);

  const addToCart = useCallback((product, size, color, qty = 1) => {
    setItems(prev => {
      const key = `${product.id}-${size}-${color}`;
      const existing = prev.find(i => `${i.id}-${i.selectedSize}-${i.selectedColor}` === key);
      if (existing) {
        return prev.map(i =>
          `${i.id}-${i.selectedSize}-${i.selectedColor}` === key
            ? { ...i, qty: i.qty + qty }
            : i
        );
      }
      return [...prev, {
        id: product.id,
        name: product.name,
        price: product.salePrice || product.price,
        image: JSON.parse(product.images || '[]')[0] || '',
        selectedSize: size,
        selectedColor: color,
        qty,
      }];
    });
    setIsOpen(true);
  }, []);

  const removeFromCart = useCallback((id, size, color) => {
    setItems(prev => prev.filter(i =>
      !(i.id === id && i.selectedSize === size && i.selectedColor === color)
    ));
  }, []);

  const updateQty = useCallback((id, size, color, qty) => {
    if (qty <= 0) { removeFromCart(id, size, color); return; }
    setItems(prev => prev.map(i =>
      i.id === id && i.selectedSize === size && i.selectedColor === color
        ? { ...i, qty }
        : i
    ));
  }, [removeFromCart]);

  const clearCart = useCallback(() => setItems([]), []);

  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const count = items.reduce((sum, i) => sum + i.qty, 0);

  return (
    <CartContext.Provider value={{
      items, addToCart, removeFromCart, updateQty, clearCart,
      total, count, isOpen, setIsOpen,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
};
