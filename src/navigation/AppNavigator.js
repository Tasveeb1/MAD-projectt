import { createStackNavigator } from '@react-navigation/stack';
import SplashScreen from '../screens/auth/SplashScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import HomeScreen from '../screens/user/HomeScreen';
import ProductListScreen from '../screens/user/ProductListScreen';
import CartScreen from '../screens/user/CartScreen';
import CheckoutScreen from '../screens/user/CheckoutScreen';
import WishListScreen from '../screens/user/WishListScreen';
import SettingsScreen from '../screens/user/SettingsScreen';
import AdminDashboard  from '../screens/admin/AdminDashboard';
import ManageProducts  from '../screens/admin/ManageProducts';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="ProductList" component={ProductListScreen} />
       <Stack.Screen name="Cart" component={CartScreen} />
           <Stack.Screen name="Checkout" component={CheckoutScreen} />
           <Stack.Screen name="Wishlist" component={WishListScreen} />
             <Stack.Screen name="Settings" component={SettingsScreen} />
                 <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
        <Stack.Screen name="ManageProducts" component={ManageProducts} />
    </Stack.Navigator>
  );
}