// src/screens/user/ProductListScreen.js

import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, FlatList,
  StatusBar, Dimensions, Image, Animated,
  Modal, SafeAreaView,
} from 'react-native';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useTheme } from '../../context/ThemeContext';
import { useProducts } from '../../context/ProductsContext';

const { width, height } = Dimensions.get('window');

const LIGHT = {
  bg: '#FFFFFF', card: '#FFFFFF',
  blush: '#FDECEA', inputBg: '#FDF0EE', border: '#F2D4D0',
  roseGold: '#C9967A', roseGoldDark: '#A87060', roseGoldLight: '#E8C4B8',
  cardBg: '#F7E8E4', textPrimary: '#1A1A1A', textSecondary: '#8A7B78',
  textMuted: '#BFB0AE', success: '#2D9E75', danger: '#E24B4A', white: '#FFFFFF',
};

const DARK = {
  bg: '#1C0A1A', card: '#2D1225',
  blush: '#3D1A2A', inputBg: '#2A1020', border: '#4A2040',
  roseGold: '#C9956C', roseGoldDark: '#E8B4A0', roseGoldLight: '#7A4A5A',
  cardBg: '#2D1225', textPrimary: '#F5E6E0', textSecondary: '#B08080',
  textMuted: '#7A5A5A', success: '#2D9E75', danger: '#E24B4A', white: '#FFFFFF',
};

const FILTERS = ['All', 'Price ↑', 'Price ↓', 'In Stock', 'On Sale'];

// ── Star Rating ─────────────────────────────────────────────
const StarRating = ({ rating, C }) => (
  <View style={{ flexDirection: 'row', gap: 1 }}>
    {[1, 2, 3, 4, 5].map(i => (
      <Text key={i} style={{ fontSize: 11, color: i <= Math.round(rating) ? '#F5A623' : C.border }}>★</Text>
    ))}
  </View>
);

// ── Product Detail Modal ─────────────────────────────────────
const ProductDetail = ({ product, onClose, onAddToCart, C }) => {
  const { wishlist, toggleWishlist } = useWishlist();
  const [selectedSize, setSelectedSize]   = useState(product.sizes?.[1] || product.sizes?.[0] || '');
  const [selectedColor, setSelectedColor] = useState(0);
  const [quantity, setQuantity]           = useState(1);
  const slideAnim = useRef(new Animated.Value(height)).current;

  React.useEffect(() => {
    Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 65, friction: 11 }).start();
  }, []);

  const handleClose = () => {
    Animated.timing(slideAnim, { toValue: height, duration: 280, useNativeDriver: true }).start(onClose);
  };

  const isWished = wishlist.some(w => w.id === product.id);

  return (
    <Modal transparent animationType="none" visible>
      <View style={{ flex: 1 }}>
        <TouchableOpacity style={StyleSheet.absoluteFillObject} activeOpacity={1}
          onPress={handleClose}
          // transparent backdrop
        >
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' }} />
        </TouchableOpacity>

        <Animated.View style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: height * 0.92,
          backgroundColor: C.card,
          borderTopLeftRadius: 24, borderTopRightRadius: 24,
          overflow: 'hidden',
          transform: [{ translateY: slideAnim }],
        }}>
          {/* Image */}
          <View style={{ position: 'relative', height: 300 }}>
            {product.image ? (
              <Image source={{ uri: product.image }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
            ) : (
              <View style={{ width: '100%', height: '100%', backgroundColor: C.blush, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 60 }}>🛍️</Text>
              </View>
            )}
            <TouchableOpacity
              onPress={handleClose}
              style={{ position: 'absolute', top: 16, left: 16, width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 20, color: '#1A1A1A' }}>←</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => toggleWishlist(product)}
              style={{ position: 'absolute', top: 16, right: 16, width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 18 }}>{isWished ? '❤️' : '🤍'}</Text>
            </TouchableOpacity>
            {!product.inStock && (
              <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.55)', padding: 10, alignItems: 'center' }}>
                <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 14 }}>Out of Stock</Text>
              </View>
            )}
          </View>

          <ScrollView style={{ paddingHorizontal: 20, paddingTop: 16 }} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, color: C.textMuted, marginBottom: 2 }}>{product.brand}</Text>
                <Text style={{ fontSize: 20, fontWeight: '700', color: C.textPrimary }}>{product.name}</Text>
              </View>
              {product.isSale && (
                <View style={{ backgroundColor: C.blush, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, marginTop: 4 }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: C.roseGold }}>SALE</Text>
                </View>
              )}
            </View>

            {/* Rating */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <StarRating rating={product.rating || 0} C={C} />
              <Text style={{ fontSize: 13, fontWeight: '700', color: C.textPrimary }}>{product.rating || 'New'}</Text>
              <Text style={{ fontSize: 13, color: C.textMuted }}>({product.reviews || 0} reviews)</Text>
            </View>

            {/* Price */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 18 }}>
              <Text style={{ fontSize: 24, fontWeight: '800', color: C.textPrimary }}>PKR {product.price.toLocaleString()}</Text>
              {product.oldPrice && <Text style={{ fontSize: 16, color: C.textMuted, textDecorationLine: 'line-through' }}>PKR {product.oldPrice.toLocaleString()}</Text>}
              {product.discount && <Text style={{ fontSize: 13, fontWeight: '700', color: C.success }}>{product.discount}</Text>}
            </View>

            {/* Size */}
            {product.sizes?.length > 0 && (
              <>
                <Text style={{ fontSize: 14, fontWeight: '700', color: C.textPrimary, marginBottom: 10 }}>Select Size</Text>
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
                  {product.sizes.map(s => (
                    <TouchableOpacity key={s} onPress={() => setSelectedSize(s)}
                      style={{ width: 44, height: 44, borderRadius: 22, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center',
                        borderColor: selectedSize === s ? C.roseGold : C.border,
                        backgroundColor: selectedSize === s ? C.roseGoldLight : C.inputBg }}>
                      <Text style={{ fontSize: 12, fontWeight: '600', color: selectedSize === s ? C.roseGoldDark : C.textSecondary }}>{s}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            {/* Quantity */}
            <Text style={{ fontSize: 14, fontWeight: '700', color: C.textPrimary, marginBottom: 10 }}>Quantity</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 18 }}>
              <TouchableOpacity onPress={() => setQuantity(q => Math.max(1, q - 1))}
                style={{ width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center', backgroundColor: C.inputBg }}>
                <Text style={{ fontSize: 20, color: C.textPrimary, lineHeight: 24 }}>−</Text>
              </TouchableOpacity>
              <Text style={{ fontSize: 18, fontWeight: '700', color: C.textPrimary }}>{quantity}</Text>
              <TouchableOpacity onPress={() => setQuantity(q => q + 1)}
                style={{ width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center', backgroundColor: C.inputBg }}>
                <Text style={{ fontSize: 20, color: C.textPrimary, lineHeight: 24 }}>+</Text>
              </TouchableOpacity>
            </View>

            {/* Description */}
            <Text style={{ fontSize: 14, fontWeight: '700', color: C.textPrimary, marginBottom: 8 }}>Description</Text>
            <Text style={{ fontSize: 14, color: C.textSecondary, lineHeight: 22, marginBottom: 20 }}>{product.description}</Text>

            {/* Actions */}
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 8 }}>
              <TouchableOpacity
                onPress={() => toggleWishlist(product)}
                style={{ flex: 1, height: 50, borderRadius: 14, borderWidth: 1.5, borderColor: C.border, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: C.textSecondary }}>
                  {isWished ? '♥ Wishlisted' : 'Add to Wishlist'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                disabled={!product.inStock}
                onPress={() => { onAddToCart({ ...product, quantity, selectedSize }); handleClose(); }}
                style={{ flex: 1.4, height: 50, borderRadius: 14, backgroundColor: product.inStock ? C.roseGold : C.border, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#FFF' }}>
                  {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={{ height: 30 }} />
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

// ── Main Screen ──────────────────────────────────────────────
const ProductListScreen = ({ navigation, route }) => {
  const categoryTitle = route?.params?.category || "Women's Fashion";
  const { addToCart, cartCount } = useCart();
  const { wishlist, toggleWishlist } = useWishlist();
  const { isDark } = useTheme();
  const { products } = useProducts();   // ← live from context, admin changes reflected here
  const C = isDark ? DARK : LIGHT;

  const [search, setSearch]             = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Filter & sort
  const filteredProducts = products
    .filter(p => {
      if (!search) return true;
      return (
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.brand.toLowerCase().includes(search.toLowerCase())
      );
    })
    .filter(p => {
      if (activeFilter === 'In Stock') return p.inStock;
      if (activeFilter === 'On Sale')  return p.isSale;
      return true;
    })
    .sort((a, b) => {
      if (activeFilter === 'Price ↑') return a.price - b.price;
      if (activeFilter === 'Price ↓') return b.price - a.price;
      return 0;
    });

  const s = makeStyles(C);

  const renderProduct = ({ item, index }) => {
    const isWished = wishlist.some(w => w.id === item.id);
    return (
      <TouchableOpacity
        style={[s.productCard, index % 2 === 0 ? { marginRight: 6 } : { marginLeft: 6 }]}
        onPress={() => setSelectedProduct(item)}
        activeOpacity={0.9}
      >
        <View style={s.productImageWrap}>
          {item.image ? (
            <Image source={{ uri: item.image }} style={s.productImage} resizeMode="cover" />
          ) : (
            <View style={[s.productImage, { backgroundColor: C.blush, alignItems: 'center', justifyContent: 'center' }]}>
              <Text style={{ fontSize: 40 }}>🛍️</Text>
            </View>
          )}
          {item.isSale && (
            <View style={s.saleTag}><Text style={s.saleTagText}>SALE</Text></View>
          )}
          {!item.inStock && (
            <View style={s.outOfStockOverlay}><Text style={s.outOfStockText}>Out of Stock</Text></View>
          )}
          <TouchableOpacity style={s.cardWishBtn} onPress={() => toggleWishlist(item)}>
            <Text style={s.cardWishIcon}>{isWished ? '❤️' : '🤍'}</Text>
          </TouchableOpacity>
        </View>

        <View style={s.cardInfo}>
          <Text style={s.cardBrand}>{item.brand}</Text>
          <Text style={s.cardName} numberOfLines={2}>{item.name}</Text>
          <View style={s.cardRatingRow}>
            <StarRating rating={item.rating || 0} C={C} />
            <Text style={s.cardReviews}>({item.reviews || 0})</Text>
          </View>
          <View style={s.cardPriceRow}>
            {item.oldPrice && <Text style={s.cardOldPrice}>PKR {item.oldPrice.toLocaleString()}</Text>}
            <Text style={s.cardPrice}>PKR {item.price.toLocaleString()}</Text>
          </View>
          <TouchableOpacity
            style={[s.cardAddBtn, !item.inStock && { opacity: 0.5 }]}
            onPress={() => addToCart(item)}
            disabled={!item.inStock}
          >
            <Text style={s.cardAddText}>🛒 Add to Cart</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={C.bg} />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>{categoryTitle}</Text>
        <TouchableOpacity style={s.filterIconBtn} onPress={() => navigation.navigate('Settings')}>
          <Text style={s.filterIcon}>⚙</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={s.searchBar}>
        <Text style={s.searchIcon}>🔍</Text>
        <TextInput
          style={s.searchInput}
          placeholder="Search in category..."
          placeholderTextColor={C.textMuted}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={{ color: C.textMuted, fontSize: 16 }}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filtersRow}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            style={[s.filterChip, activeFilter === f && s.filterChipActive]}
            onPress={() => setActiveFilter(f)}
          >
            <Text style={[s.filterChipText, activeFilter === f && s.filterChipTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={s.productCount}>Showing {filteredProducts.length} products</Text>

      {/* Grid */}
      <FlatList
        data={filteredProducts}
        keyExtractor={item => item.id}
        numColumns={2}
        renderItem={renderProduct}
        contentContainerStyle={s.grid}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={<View style={{ height: 90 }} />}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 60 }}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>🔍</Text>
            <Text style={{ fontSize: 16, fontWeight: '700', color: C.textPrimary }}>No products found</Text>
          </View>
        }
      />

      {/* Bottom Nav */}
      <View style={s.bottomNav}>
        <TouchableOpacity style={s.navItem} onPress={() => navigation.navigate('Home')}>
          <Text style={s.navIcon}>🏠</Text>
          <Text style={s.navLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.navItem}>
          <Text style={[s.navIcon, { color: C.roseGold }]}>⊞</Text>
          <Text style={[s.navLabel, { color: C.roseGold, fontWeight: '700' }]}>Categories</Text>
        </TouchableOpacity>
        <View style={s.cartFabWrapper}>
          <TouchableOpacity style={s.cartFab} onPress={() => navigation.navigate('Cart')}>
            <Text style={s.cartFabIcon}>🛒</Text>
          </TouchableOpacity>
          {cartCount > 0 && (
            <View style={s.cartBadge}><Text style={s.cartBadgeText}>{cartCount}</Text></View>
          )}
        </View>
        <TouchableOpacity style={s.navItem} onPress={() => navigation.navigate('Wishlist')}>
          <Text style={s.navIcon}>❤️</Text>
          <Text style={s.navLabel}>Wishlist</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.navItem} onPress={() => navigation.navigate('Settings')}>
          <Text style={s.navIcon}>👤</Text>
          <Text style={s.navLabel}>Profile</Text>
        </TouchableOpacity>
      </View>

      {selectedProduct && (
        <ProductDetail
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={addToCart}
          C={C}
        />
      )}
    </SafeAreaView>
  );
};

const makeStyles = (C) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 10 },
  backBtn: { padding: 6 },
  backIcon: { fontSize: 22, color: C.textPrimary },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700', color: C.roseGoldDark, fontFamily: 'serif' },
  filterIconBtn: { padding: 6 },
  filterIcon: { fontSize: 20, color: C.textPrimary },

  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: C.inputBg,
    borderWidth: 1, borderColor: C.border, borderRadius: 14,
    marginHorizontal: 16, paddingHorizontal: 14, height: 46, marginBottom: 12,
  },
  searchIcon: { fontSize: 15, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: C.textPrimary },

  filtersRow: { paddingHorizontal: 16, gap: 8, paddingBottom: 4 },
  filterChip: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: C.border, backgroundColor: C.card },
  filterChipActive: { backgroundColor: C.roseGold, borderColor: C.roseGold },
  filterChipText: { fontSize: 13, color: C.textSecondary, fontWeight: '500' },
  filterChipTextActive: { color: '#FFF', fontWeight: '700' },

  productCount: { marginHorizontal: 16, marginTop: 10, marginBottom: 6, fontSize: 13, color: C.textMuted },

  grid: { paddingHorizontal: 10 },
  productCard: { flex: 1, marginBottom: 14, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 16, overflow: 'hidden' },
  productImageWrap: { position: 'relative' },
  productImage: { width: '100%', height: 180 },
  saleTag: { position: 'absolute', top: 10, left: 10, backgroundColor: C.roseGold, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  saleTagText: { color: '#FFF', fontSize: 10, fontWeight: '700' },
  outOfStockOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center' },
  outOfStockText: { fontSize: 11, fontWeight: '700', color: '#FFF' },
  cardWishBtn: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(255,255,255,0.85)', width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  cardWishIcon: { fontSize: 15 },
  cardInfo: { padding: 10 },
  cardBrand: { fontSize: 10, color: C.textMuted, marginBottom: 2 },
  cardName: { fontSize: 13, fontWeight: '600', color: C.textPrimary, marginBottom: 4 },
  cardRatingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  cardReviews: { fontSize: 10, color: C.textMuted },
  cardPriceRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 8 },
  cardOldPrice: { fontSize: 11, color: C.textMuted, textDecorationLine: 'line-through' },
  cardPrice: { fontSize: 14, fontWeight: '700', color: C.roseGold },
  cardAddBtn: { backgroundColor: C.blush, borderWidth: 1, borderColor: C.border, borderRadius: 8, paddingVertical: 7, alignItems: 'center' },
  cardAddText: { fontSize: 11, fontWeight: '700', color: C.roseGoldDark },

  bottomNav: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 70, backgroundColor: C.card, borderTopWidth: 1, borderTopColor: C.border, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingBottom: 8 },
  navItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  navIcon: { fontSize: 22, color: C.textMuted },
  navLabel: { fontSize: 10, color: C.textMuted, marginTop: 2 },
  cartFabWrapper: { alignItems: 'center', justifyContent: 'center', position: 'relative' },
  cartFab: { width: 56, height: 56, borderRadius: 28, backgroundColor: C.roseGold, alignItems: 'center', justifyContent: 'center', marginBottom: 16, elevation: 8 },
  cartFabIcon: { fontSize: 24 },
  cartBadge: { position: 'absolute', top: -4, right: -4, backgroundColor: C.danger, width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: C.bg },
  cartBadgeText: { color: '#FFF', fontSize: 9, fontWeight: '700' },
});

export default ProductListScreen;