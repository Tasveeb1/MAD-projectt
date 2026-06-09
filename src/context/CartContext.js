import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export function CartProvider({ children, userId }) {
  const [cartItems, setCartItems] = useState([]);

  // 🔁 LOAD CART when user logs in
  useEffect(() => {
    if (userId) loadCart();
  }, [userId]);

  // 💾 SAVE CART whenever it changes
  useEffect(() => {
    if (userId) saveCart();
  }, [cartItems]);

  const storageKey = `cart_${userId}`;

  const loadCart = async () => {
    try {
      const data = await AsyncStorage.getItem(storageKey);
      if (data) setCartItems(JSON.parse(data));
    } catch (e) {
      console.log('Load cart error', e);
    }
  };

  const saveCart = async () => {
    try {
      await AsyncStorage.setItem(storageKey, JSON.stringify(cartItems));
    } catch (e) {
      console.log('Save cart error', e);
    }
  };

  const addToCart = (product) => {
    setCartItems(prev => {
      const exists = prev.find(i => i.id === product.id);
      if (exists) {
        return prev.map(i =>
          i.id === product.id
            ? { ...i, quantity: (i.quantity || 1) + 1 }
            : i
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCartItems(prev => prev.filter(i => i.id !== id));
  };

  const updateQuantity = (id, qty) => {
    setCartItems(prev =>
      prev.map(i => i.id === id ? { ...i, quantity: qty } : i)
    );
  };

  const clearCart = () => setCartItems([]);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}