// src/context/WishlistContext.js  ← copy to src/context/
import { createContext, useContext, useState } from 'react';

const WishlistContext = createContext();
export const useWishlist = () => useContext(WishlistContext);

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState([]);

  // item should be a product object { id, name, brand, price, image, ... }
  const toggleWishlist = (item) => {
    setWishlist(prev => {
      const exists = prev.find(w => w.id === item.id);
      if (exists) {
        return prev.filter(w => w.id !== item.id);
      }
      return [...prev, item];
    });
  };

  const isWishlisted = (id) => wishlist.some(w => w.id === id);

  const removeFromWishlist = (id) => {
    setWishlist(prev => prev.filter(w => w.id !== id));
  };

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isWishlisted, removeFromWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}