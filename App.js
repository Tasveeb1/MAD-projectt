import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';
import { ThemeProvider } from './src/context/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';
import { ProductsProvider } from './src/context/ProductsContext';
import { WishlistProvider } from './src/context/WishlistContext';
import { getOrders } from './src/utils/storage';

export default function App() {
  return (
    <ProductsProvider>
       <WishlistProvider>
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
    </WishlistProvider>
    </ProductsProvider>
  );
}