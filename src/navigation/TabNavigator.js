import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useContext } from 'react';
import { CartContext } from '../context/CartContext';

import HomeScreen     from '../screens/user/HomeScreen';
import ProductListScreen from '../screens/user/ProductListScreen';
import WishlistScreen from '../screens/user/WishlistScreen';
import SettingsScreen from '../screens/user/SettingsScreen';

const Tab = createBottomTabNavigator();

const COLORS = {
  roseGold:  '#C9967A',
  border:    '#F2D4D0',
  white:     '#FFFFFF',
  textMuted: '#BFB0AE',
  danger:    '#E24B4A',
};

// ── Custom Tab Bar ──────────────────────────────────────────
function CustomTabBar({ state, descriptors, navigation }) {
  const { cartItems } = useContext(CartContext);
  const cartCount = cartItems?.length || 0;

  const TABS = [
    { name: 'Home',       icon: '🏠', label: 'Home'       },
    { name: 'Products',   icon: '⊞',  label: 'Products'   },
    { name: 'Cart',       icon: '🛒',  label: 'Cart', isFab: true },
    { name: 'Wishlist',   icon: '🤍',  label: 'Wishlist'   },
    { name: 'Settings',   icon: '👤',  label: 'Profile'    },
  ];

  return (
    <View style={styles.tabBar}>
      {state.routes.map((route, index) => {
        const tab        = TABS[index];
        const isFocused  = state.index === index;
        const isFab      = tab?.isFab;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress', target: route.key, canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        if (isFab) {
          return (
            <View key={route.key} style={styles.fabWrapper}>
              <TouchableOpacity style={styles.fab} onPress={onPress} activeOpacity={0.85}>
                <Text style={styles.fabIcon}>🛒</Text>
              </TouchableOpacity>
              {cartCount > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>
                    {cartCount > 9 ? '9+' : cartCount}
                  </Text>
                </View>
              )}
            </View>
          );
        }

        return (
          <TouchableOpacity
            key={route.key}
            style={styles.tabItem}
            onPress={onPress}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabIcon, isFocused && styles.tabIconActive]}>
              {tab?.icon}
            </Text>
            <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>
              {tab?.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ── Tab Navigator ───────────────────────────────────────────
export default function TabNavigator() {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home"     component={HomeScreen}        />
      <Tab.Screen name="Products" component={ProductListScreen} />
      <Tab.Screen name="Cart"     component={CartPlaceholder}   />
      <Tab.Screen name="Wishlist" component={WishlistScreen}    />
      <Tab.Screen name="Settings" component={SettingsScreen}    />
    </Tab.Navigator>
  );
}

// Cart tab is just a placeholder — actual CartScreen opens as a stack screen
function CartPlaceholder() { return null; }

// ── Styles ──────────────────────────────────────────────────
const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    height: 70,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingBottom: 8,
  },
  tabItem: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
  },
  tabIcon:  { fontSize: 22, color: COLORS.textMuted },
  tabLabel: { fontSize: 10, color: COLORS.textMuted, marginTop: 2 },
  tabIconActive:  { color: COLORS.roseGold },
  tabLabelActive: { color: COLORS.roseGold, fontWeight: '700' },

  // Cart FAB
  fabWrapper: {
    alignItems: 'center', justifyContent: 'center', position: 'relative',
  },
  fab: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: COLORS.roseGold,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
    shadowColor: COLORS.roseGold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 8, elevation: 8,
  },
  fabIcon: { fontSize: 24 },
  cartBadge: {
    position: 'absolute', top: -2, right: -4,
    backgroundColor: COLORS.danger,
    minWidth: 18, height: 18, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: COLORS.white,
    paddingHorizontal: 3,
  },
  cartBadgeText: { color: COLORS.white, fontSize: 9, fontWeight: '700' },
});