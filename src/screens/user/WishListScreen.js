// src/screens/user/WishlistScreen.js
import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Image, ScrollView, StatusBar, Dimensions,
} from 'react-native';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';

const { width } = Dimensions.get('window');

const LIGHT = {
  bg: '#FFFFFF', card: '#FFFFFF',
  blush: '#FDECEA', inputBg: '#FDF0EE', border: '#F2D4D0',
  roseGold: '#C9967A', roseGoldDark: '#A87060',
  textPrimary: '#1A1A1A', textSecondary: '#8A7B78',
  textMuted: '#BFB0AE', danger: '#E24B4A',
  success: '#2D9E75',
};
const DARK = {
  bg: '#1C0A1A', card: '#2D1225',
  blush: '#3D1A2A', inputBg: '#2A1020', border: '#4A2040',
  roseGold: '#C9956C', roseGoldDark: '#E8B4A0',
  textPrimary: '#F5E6E0', textSecondary: '#B08080',
  textMuted: '#7A5A5A', danger: '#E24B4A',
  success: '#2D9E75',
};

const WishlistScreen = ({ navigation }) => {
  const { isDark } = useTheme();
  const C = isDark ? DARK : LIGHT;
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const s = makeStyles(C);

  const handleAddToCart = (item) => {
    addToCart({ ...item, quantity: 1 });
  };

  if (wishlist.length === 0) {
    return (
      <View style={s.container}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={C.bg} />
        <View style={s.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
            <Text style={s.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={s.headerTitle}>My Wishlist</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={s.emptyContainer}>
          <Text style={s.emptyEmoji}>💔</Text>
          <Text style={s.emptyTitle}>Wishlist is Empty</Text>
          <Text style={s.emptyText}>
            Heart products you love and they'll appear here
          </Text>
          <TouchableOpacity style={s.shopBtn} onPress={() => navigation.navigate('Home')}>
            <Text style={s.shopBtnText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={C.bg} />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>My Wishlist</Text>
        <View style={s.countBadge}>
          <Text style={s.countText}>{wishlist.length}</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scrollContent}
      >
        {wishlist.map(item => (
          <View key={item.id} style={s.card}>
            {/* Image */}
            {item.image ? (
              <Image source={{ uri: item.image }} style={s.image} resizeMode="cover" />
            ) : (
              <View style={[s.image, s.imagePlaceholder]}>
                <Text style={{ fontSize: 36 }}>{item.emoji || '🛍️'}</Text>
              </View>
            )}

            {/* Info */}
            <View style={s.info}>
              <Text style={s.brand}>{item.brand}</Text>
              <Text style={s.name} numberOfLines={2}>{item.name}</Text>

              {/* Price */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <Text style={s.price}>
                  PKR {typeof item.price === 'number'
                    ? item.price.toLocaleString()
                    : item.price}
                </Text>
                {item.oldPrice && (
                  <Text style={s.oldPrice}>
                    PKR {typeof item.oldPrice === 'number'
                      ? item.oldPrice.toLocaleString()
                      : item.oldPrice}
                  </Text>
                )}
              </View>

              {/* Stock badge */}
              {item.inStock === false && (
                <Text style={s.outOfStock}>Out of Stock</Text>
              )}

              {/* Buttons */}
              <View style={s.btnRow}>
                <TouchableOpacity
                  style={[s.cartBtn, item.inStock === false && { opacity: 0.5 }]}
                  onPress={() => handleAddToCart(item)}
                  disabled={item.inStock === false}
                >
                  <Text style={s.cartBtnText}>🛒 Add to Cart</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={s.deleteBtn}
                  onPress={() => removeFromWishlist(item.id)}
                >
                  <Text style={s.deleteText}>🗑</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const makeStyles = (C) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },

  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 55, paddingBottom: 20,
    backgroundColor: C.card,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: C.blush,
    alignItems: 'center', justifyContent: 'center',
  },
  backIcon: { fontSize: 20, color: C.textPrimary },
  headerTitle: { fontSize: 20, fontWeight: '700', color: C.textPrimary },
  countBadge: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: C.blush,
    alignItems: 'center', justifyContent: 'center',
  },
  countText: { fontSize: 15, fontWeight: '800', color: C.roseGold },

  scrollContent: { padding: 16, gap: 14, paddingBottom: 100 },

  card: {
    flexDirection: 'row',
    backgroundColor: C.card,
    borderWidth: 1, borderColor: C.border,
    borderRadius: 18, overflow: 'hidden',
  },
  image: { width: 120, height: 150 },
  imagePlaceholder: {
    backgroundColor: C.blush,
    alignItems: 'center', justifyContent: 'center',
  },

  info: { flex: 1, padding: 14, justifyContent: 'space-between' },
  brand: { fontSize: 11, color: C.textMuted, marginBottom: 3 },
  name: { fontSize: 15, fontWeight: '700', color: C.textPrimary, marginBottom: 6 },
  price: { fontSize: 15, fontWeight: '700', color: C.roseGold },
  oldPrice: {
    fontSize: 12, color: C.textMuted,
    textDecorationLine: 'line-through',
  },
  outOfStock: {
    fontSize: 11, fontWeight: '700', color: C.danger,
    marginBottom: 4,
  },

  btnRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  cartBtn: {
    flex: 1, backgroundColor: C.roseGold,
    paddingVertical: 10, borderRadius: 10,
    alignItems: 'center',
  },
  cartBtnText: { color: '#FFF', fontWeight: '700', fontSize: 12 },
  deleteBtn: {
    width: 40, backgroundColor: C.blush,
    borderWidth: 1, borderColor: C.border,
    justifyContent: 'center', alignItems: 'center',
    borderRadius: 10,
  },
  deleteText: { fontSize: 16 },

  // Empty state
  emptyContainer: {
    flex: 1, justifyContent: 'center',
    alignItems: 'center', paddingHorizontal: 40,
  },
  emptyEmoji: { fontSize: 70, marginBottom: 14 },
  emptyTitle: { fontSize: 22, fontWeight: '700', color: C.textPrimary, marginBottom: 8 },
  emptyText: {
    fontSize: 14, color: C.textSecondary,
    textAlign: 'center', marginBottom: 24, lineHeight: 20,
  },
  shopBtn: {
    backgroundColor: C.roseGold,
    paddingHorizontal: 28, paddingVertical: 14, borderRadius: 14,
  },
  shopBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
});

export default WishlistScreen;