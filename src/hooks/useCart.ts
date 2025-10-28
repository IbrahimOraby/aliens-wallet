import { useState, useEffect } from 'react';
import { ProductVariation } from '@/types/product';

export interface CartItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
  specifications?: {
    plan?: string;
    duration?: string;
    accountType?: string;
  };
  variation?: ProductVariation;
}

export const useCart = () => {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setItems(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addItem = (item: CartItem) => {
    setItems(current => {
      const existingItem = current.find(i => 
        i.id === item.id && 
        i.variation?.id === item.variation?.id &&
        JSON.stringify(i.specifications) === JSON.stringify(item.specifications)
      );
      
      if (existingItem) {
        return current.map(i => 
          i.id === item.id && 
          i.variation?.id === item.variation?.id &&
          JSON.stringify(i.specifications) === JSON.stringify(item.specifications)
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      
      return [...current, item];
    });
  };

  const removeItem = (id: string, specifications?: CartItem['specifications'], variationId?: number) => {
    setItems(current => 
      current.filter(item => 
        !(item.id === id && 
          item.variation?.id === variationId &&
          JSON.stringify(item.specifications) === JSON.stringify(specifications))
      )
    );
  };

  const updateQuantity = (id: string, quantity: number, specifications?: CartItem['specifications'], variationId?: number) => {
    if (quantity <= 0) {
      removeItem(id, specifications, variationId);
      return;
    }
    
    setItems(current =>
      current.map(item =>
        item.id === id && 
        item.variation?.id === variationId &&
        JSON.stringify(item.specifications) === JSON.stringify(specifications)
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    total,
  };
};