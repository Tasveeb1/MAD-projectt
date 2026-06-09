// src/context/ProductsContext.js
import { createContext, useContext, useState } from 'react';

const ProductsContext = createContext();
export const useProducts = () => useContext(ProductsContext);

const INITIAL_PRODUCTS = [
  {
    id: '1',
    name: 'Elegant Evening Gown',
    brand: 'Luxury Couture',
    price: 12500,
    oldPrice: 18000,
    discount: '34% OFF',
    rating: 4.8,
    reviews: 124,
    category: 'Women',
    inStock: true,
    isSale: true,
    colors: ['#F4A7A0', '#C9967A', '#1A1A1A', '#FFFFFF'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    description: 'Exquisite evening gown crafted from premium materials. Features elegant silhouette, intricate detailing, and timeless design. Perfect for special occasions and formal events.',
    image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=400&q=80',
  },
  {
    id: '2',
    name: 'Blue Sleeveless Dress',
    brand: 'Modern Fashion',
    price: 7800,
    oldPrice: 11500,
    discount: '33% OFF',
    rating: 4.6,
    reviews: 89,
    category: 'Women',
    inStock: true,
    isSale: true,
    colors: ['#4169E1', '#1A1A1A', '#F4A7A0'],
    sizes: ['XS', 'S', 'M', 'L'],
    description: 'Bold and sleeveless fitted dress perfect for evening outings. Made with stretch fabric for a comfortable, flattering fit.',
    image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&q=80',
  },
  {
    id: '3',
    name: "Classic Men's Suit",
    brand: 'Elite Tailoring',
    price: 24999,
    oldPrice: 35000,
    discount: '30% OFF',
    rating: 4.9,
    reviews: 156,
    category: 'Men',
    inStock: true,
    isSale: false,
    colors: ['#1A1A1A', '#4A4A4A', '#8B7355'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    description: 'Impeccably tailored suit made from premium wool blend. Features sharp lapels and a classic silhouette that commands attention.',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&q=80',
  },
  {
    id: '4',
    name: 'Floral Print Dress',
    brand: 'Bohemian Style',
    price: 5500,
    oldPrice: null,
    discount: null,
    rating: 4.4,
    reviews: 78,
    category: 'Women',
    inStock: true,
    isSale: false,
    colors: ['#2E8B57', '#FF7F50', '#FFD700'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    description: 'Vibrant floral print dress with a relaxed bohemian vibe. Perfect for summer outings and garden parties.',
    image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&q=80',
  },
  {
    id: '5',
    name: 'Rose Oud Perfume',
    brand: 'Al Haramain',
    price: 4800,
    oldPrice: 7200,
    discount: '33% OFF',
    rating: 4.9,
    reviews: 200,
    category: 'Fragrance',
    inStock: true,
    isSale: true,
    colors: ['#C9967A', '#F4A7A0'],
    sizes: ['30ml', '50ml', '100ml'],
    description: 'Rich and captivating rose oud fragrance from the finest Arabian ingredients. Long-lasting scent that lingers beautifully.',
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=400&q=80',
  },
  {
    id: '6',
    name: 'Embroidered Kurti',
    brand: 'Khaadi',
    price: 3200,
    oldPrice: null,
    discount: null,
    rating: 4.7,
    reviews: 95,
    category: 'Women',
    inStock: false,
    isSale: false,
    colors: ['#E8C4B8', '#F4A7A0', '#FFFFFF'],
    sizes: ['XS', 'S', 'M', 'L'],
    description: 'Handcrafted embroidered kurti with delicate floral motifs. Made from breathable cotton fabric ideal for everyday wear.',
    image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400&q=80',
  },
];

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState(INITIAL_PRODUCTS);

  // ADD new product
  const addProduct = (product) => {
    const newProduct = {
      ...product,
      id: Date.now().toString(),
      rating: 0,
      reviews: 0,
    };
    setProducts(prev => [newProduct, ...prev]);
    return newProduct;
  };

  // UPDATE existing product
  const updateProduct = (id, updatedFields) => {
    setProducts(prev =>
      prev.map(p => p.id === id ? { ...p, ...updatedFields } : p)
    );
  };

  // DELETE product
  const deleteProduct = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  // TOGGLE stock
  const toggleStock = (id) => {
    setProducts(prev =>
      prev.map(p => p.id === id ? { ...p, inStock: !p.inStock } : p)
    );
  };

  // TOGGLE sale
  const toggleSale = (id) => {
    setProducts(prev =>
      prev.map(p => p.id === id ? { ...p, isSale: !p.isSale } : p)
    );
  };

  return (
    <ProductsContext.Provider value={{
      products,
      addProduct,
      updateProduct,
      deleteProduct,
      toggleStock,
      toggleSale,
    }}>
      {children}
    </ProductsContext.Provider>
  );
}