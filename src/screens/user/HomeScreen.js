import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, StatusBar, Dimensions, Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getUserData } from '../../firebase/authService';
import { useTheme } from '../../context/ThemeContext';

const { width } = Dimensions.get('window');

const BANNERS = [
  { id: '1', title: "New Men's Arrivals", sub: 'Shop Now', emoji: '👔' },
  { id: '2', title: 'Signature Fragrances', sub: 'Exclusive Collection', emoji: '🌸' },
  { id: '3', title: "Summer Sale 50% OFF", sub: "Women's Collection", emoji: '👗' },
];

const CATEGORIES = [
  { id: '1', label: 'Women', count: '120 items', emoji: '🛍️' },
  { id: '2', label: 'Men', count: '85 items', emoji: '👔' },
  { id: '3', label: 'Fragrance', count: '40 items', emoji: '✨' },
  { id: '4', label: 'Sale', count: '60 items', emoji: '🏷️' },
];

const TRENDING = [
  { id: '1', name: 'Floral Summer Dress', brand: 'Zara', price: 'PKR 3,500', oldPrice: 'PKR 5,000', rating: '4.8', reviews: '120', image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=300&q=80' },
  { id: '2', name: "Men's Linen Shirt", brand: 'H&M', price: 'PKR 2,200', oldPrice: '', rating: '4.6', reviews: '85', image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=300&q=80' },
  { id: '3', name: 'Rose Oud Perfume', brand: 'Al Haramain', price: 'PKR 4,800', oldPrice: 'PKR 6,000', rating: '4.9', reviews: '200', image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=300&q=80' },
  { id: '4', name: 'Embroidered Kurti', brand: 'Khaadi', price: 'PKR 1,800', oldPrice: '', rating: '4.7', reviews: '95', image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=300&q=80' },
];

const FLASH_SALE = [
  { id: '1', name: 'Summer Top', price: 'PKR 999', oldPrice: 'PKR 2,000', emoji: '👚', discount: '50%' },
  { id: '2', name: 'Silk Scarf', price: 'PKR 750', oldPrice: 'PKR 1,500', emoji: '🧣', discount: '50%' },
  { id: '3', name: 'Men Kurta', price: 'PKR 1,200', oldPrice: 'PKR 2,400', emoji: '👘', discount: '50%' },
  { id: '4', name: 'Fragrance', price: 'PKR 2,000', oldPrice: 'PKR 4,000', emoji: '🌸', discount: '50%' },
];

const useCountdown = () => {
  const [time, setTime] = React.useState({ h: 1, m: 30, s: 45 });
  React.useEffect(() => {
    const interval = setInterval(() => {
      setTime(prev => {
        let { h, m, s } = prev;
        if (s > 0) return { h, m, s: s - 1 };
        if (m > 0) return { h, m: m - 1, s: 59 };
        if (h > 0) return { h: h - 1, m: 59, s: 59 };
        return { h: 0, m: 0, s: 0 };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  const pad = n => String(n).padStart(2, '0');
  return `${pad(time.h)}:${pad(time.m)}:${pad(time.s)}`;
};

const NOTIFICATIONS = [
  { id: '1', text: 'Your order has been shipped! 🚚', time: '2 min ago' },
  { id: '2', text: 'Flash Sale starts in 1 hour ⚡', time: '15 min ago' },
  { id: '3', text: "New arrivals in Women's collection 👗", time: '1 hr ago' },
  { id: '4', text: 'Your wishlist item is on sale! ❤️', time: '3 hr ago' },
  { id: '5', text: "Welcome back! Check today's deals 🎉", time: '1 day ago' },
];

export default function HomeScreen({ navigation }) {
  const { isDark, theme } = useTheme();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('1');
  const [activeBanner, setActiveBanner] = useState(0);
  const [wishlist, setWishlist] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState(null);
  const countdown = useCountdown();

  useEffect(() => {
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        const data = await getUserData(user.uid);
        if (data) setUserName(data.name || data.displayName || '');
        try {
          const saved = await AsyncStorage.getItem(`wishlist_${user.uid}`);
          if (saved) setWishlist(JSON.parse(saved));
        } catch (_) {}
        try {
          const savedCart = await AsyncStorage.getItem(`cart_${user.uid}`);
          if (savedCart) setCartItems(JSON.parse(savedCart));
        } catch (_) {}
      } else {
        setUserId(null);
        setUserName('');
        setWishlist([]);
        setCartItems([]);
      }
    });
    return () => unsub();
  }, []);

  const toggleWishlist = async (id) => {
    const updated = wishlist.includes(id)
      ? wishlist.filter(w => w !== id)
      : [...wishlist, id];
    setWishlist(updated);
    if (userId) {
      await AsyncStorage.setItem(`wishlist_${userId}`, JSON.stringify(updated));
    }
  };

  const addToCart = async (item) => {
    const exists = cartItems.find(c => c.id === item.id);
    const updated = exists
      ? cartItems.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c)
      : [...cartItems, { ...item, qty: 1 }];
    setCartItems(updated);
    if (userId) {
      await AsyncStorage.setItem(`cart_${userId}`, JSON.stringify(updated));
    }
  };

  const t = theme; // shorthand

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={t.bg}
      />

      {/* ── Notification Panel ── */}
      {showNotifications && (
        <View style={[styles.notifOverlay]}>
          <View style={[styles.notifPanel, { backgroundColor: t.card, borderColor: t.border }]}>
            <View style={styles.notifHeader}>
              <Text style={[styles.notifTitle, { color: t.text }]}>Notifications</Text>
              <TouchableOpacity onPress={() => setShowNotifications(false)}>
                <Text style={{ fontSize: 18, color: t.subtext, padding: 4 }}>✕</Text>
              </TouchableOpacity>
            </View>
            {NOTIFICATIONS.map((n, i) => (
              <View key={n.id} style={[
                styles.notifItem,
                { borderBottomColor: t.border },
                i === NOTIFICATIONS.length - 1 && { borderBottomWidth: 0 },
              ]}>
                <Text style={{ fontSize: 13, color: t.text, marginBottom: 3 }}>{n.text}</Text>
                <Text style={{ fontSize: 11, color: t.subtext }}>{n.time}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Header ── */}
        <View style={[styles.header, { backgroundColor: t.bg }]}>
          <View style={styles.headerLeft}>
            <View style={[styles.avatar, { backgroundColor: t.blush, borderColor: t.primary }]}>
              <Text style={styles.avatarIcon}>👤</Text>
            </View>
            <View>
              <Text style={[styles.heyText, { color: t.text }]}>
                Hey, {userName || 'there'} ✨
              </Text>
              <Text style={[styles.subText, { color: t.subtext }]}>Welcome back!</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.bellWrapper}
            onPress={() => setShowNotifications(p => !p)}
          >
            <Text style={styles.bellIcon}>🔔</Text>
            <View style={styles.bellBadge}>
              <Text style={styles.bellBadgeText}>{NOTIFICATIONS.length}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* ── Search Bar ── */}
        <View style={[styles.searchBar, {
          backgroundColor: t.inputBg,
          borderColor: t.border,
        }]}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={[styles.searchInput, { color: t.text }]}
            placeholder="Search dresses, fragrances..."
            placeholderTextColor={t.subtext}
            value={search}
            onChangeText={setSearch}
          />
          <TouchableOpacity>
            <Text style={styles.micIcon}>🎙️</Text>
          </TouchableOpacity>
        </View>

        {/* ── Promo Banners ── */}
        <ScrollView
          horizontal pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={styles.bannerScroll}
          onMomentumScrollEnd={e => {
            setActiveBanner(Math.round(e.nativeEvent.contentOffset.x / (width - 48)));
          }}
        >
          {BANNERS.map(b => (
            <View key={b.id} style={[styles.bannerCard, { backgroundColor: t.primary }]}>
              <View style={styles.bannerLeft}>
                <Text style={styles.bannerTitle}>{b.title}</Text>
                <Text style={styles.bannerSub}>{b.sub}</Text>
                <TouchableOpacity style={styles.bannerBtn}>
                  <Text style={styles.bannerBtnText}>Shop Now →</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.bannerRight}>
                <Text style={styles.bannerEmoji}>{b.emoji}</Text>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Banner Dots */}
        <View style={styles.dotsRow}>
          {BANNERS.map((_, i) => (
            <View key={i} style={[
              styles.dot,
              { backgroundColor: t.border },
              activeBanner === i && { backgroundColor: t.primary, width: 18 },
            ]} />
          ))}
        </View>

        {/* ── Categories ── */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: t.text }]}>Shop by Category</Text>
          <TouchableOpacity onPress={() => navigation.navigate('ProductList')}>
            <Text style={[styles.seeAll, { color: t.primary }]}>See All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesRow}
        >
          {CATEGORIES.map(cat => {
            const isActive = activeCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.categoryCard, {
                  backgroundColor: isActive ? t.primary : t.card,
                  borderColor: isActive ? t.primary : t.border,
                }]}
                onPress={() => {
                  setActiveCategory(cat.id);
                  navigation.navigate('ProductList', { category: cat.label });
                }}
              >
                <View style={[styles.categoryIconBox, {
                  backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : t.blush,
                }]}>
                  <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                </View>
                <Text style={[styles.categoryLabel, {
                  color: isActive ? '#FFFFFF' : t.text,
                }]}>{cat.label}</Text>
                <Text style={[styles.categoryCount, {
                  color: isActive ? 'rgba(255,255,255,0.75)' : t.subtext,
                }]}>{cat.count}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ── Flash Sale ── */}
        <View style={[styles.flashSaleStrip, { backgroundColor: t.blush }]}>
          <Text style={styles.flashEmoji}>⚡</Text>
          <Text style={[styles.flashText, { color: t.primary }]}>Flash Sale — Ends in</Text>
          <View style={[styles.timerBox, { backgroundColor: t.primary }]}>
            <Text style={styles.timerText}>{countdown}</Text>
          </View>
        </View>

        <ScrollView
          horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.flashRow}
        >
          {FLASH_SALE.map(item => (
            <TouchableOpacity
              key={item.id}
              style={[styles.flashCard, { backgroundColor: t.card, borderColor: t.border }]}
            >
              <View style={styles.flashDiscountBadge}>
                <Text style={styles.flashDiscountText}>{item.discount}</Text>
              </View>
              <Text style={styles.flashEmojiBig}>{item.emoji}</Text>
              <Text style={[styles.flashName, { color: t.text }]}>{item.name}</Text>
              <Text style={[styles.flashOld, { color: t.subtext }]}>{item.oldPrice}</Text>
              <Text style={[styles.flashPrice, { color: t.primary }]}>{item.price}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── Trending ── */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: t.text }]}>Trending Now 🔥</Text>
          <TouchableOpacity onPress={() => navigation.navigate('ProductList')}>
            <Text style={[styles.seeAll, { color: t.primary }]}>See All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.productsGrid}>
          {TRENDING.map(item => (
            <TouchableOpacity
              key={item.id}
              style={[styles.productCard, { backgroundColor: t.card, borderColor: t.border }]}
              onPress={() => navigation.navigate('ProductList')}
            >
              <TouchableOpacity
                style={styles.wishlistBtn}
                onPress={() => toggleWishlist(item.id)}
              >
                <Text style={styles.wishlistIcon}>
                  {wishlist.includes(item.id) ? '❤️' : '🤍'}
                </Text>
              </TouchableOpacity>

              <View style={[styles.productImageBox, { backgroundColor: t.inputBg }]}>
                <Image source={{ uri: item.image }} style={styles.productImage} resizeMode="cover" />
              </View>

              <View style={styles.productInfo}>
                <Text style={[styles.productBrand, { color: t.subtext }]}>{item.brand}</Text>
                <Text style={[styles.productName, { color: t.text }]} numberOfLines={2}>
                  {item.name}
                </Text>
                <View style={styles.ratingRow}>
                  <Text style={styles.star}>⭐</Text>
                  <Text style={[styles.ratingText, { color: t.text }]}>{item.rating}</Text>
                  <Text style={[styles.reviewText, { color: t.subtext }]}>({item.reviews})</Text>
                </View>
                <View style={styles.priceRow}>
                  {item.oldPrice !== '' && (
                    <Text style={[styles.oldPrice, { color: t.subtext }]}>{item.oldPrice}</Text>
                  )}
                  <Text style={[styles.price, { color: t.primary }]}>{item.price}</Text>
                </View>
                <TouchableOpacity
                  style={[styles.addToCartBtn, { backgroundColor: t.blush, borderColor: t.border }]}
                  onPress={() => addToCart(item)}
                >
                  <Text style={[styles.addToCartText, { color: t.primary }]}>Add to Cart</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 90 }} />
      </ScrollView>

      {/* ── Bottom Nav ── */}
      <View style={[styles.bottomNav, {
        backgroundColor: t.card,
        borderTopColor: t.border,
      }]}>
        <TouchableOpacity style={styles.navItem}>
          <Text style={[styles.navIconActive, { color: t.primary }]}>🏠</Text>
          <Text style={[styles.navLabelActive, { color: t.primary }]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('ProductList')}
        >
          <Text style={[styles.navIcon, { color: t.subtext }]}>⊞</Text>
          <Text style={[styles.navLabel, { color: t.subtext }]}>Categories</Text>
        </TouchableOpacity>

        <View style={styles.cartFabWrapper}>
          <TouchableOpacity
            style={[styles.cartFab, { backgroundColor: t.primary }]}
            onPress={() => navigation.navigate('Cart', { cartItems })}
          >
            <Text style={styles.cartFabIcon}>🛒</Text>
          </TouchableOpacity>
          {cartItems.length > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartItems.length}</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Wishlist')}
        >
          <Text style={[styles.navIcon, { color: t.subtext }]}>❤️</Text>
          <Text style={[styles.navLabel, { color: t.subtext }]}>Wishlist</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Settings')}
        >
          <Text style={[styles.navIcon, { color: t.subtext }]}>👤</Text>
          <Text style={[styles.navLabel, { color: t.subtext }]}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 20,
    paddingTop: 52, paddingBottom: 12,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    borderWidth: 2, alignItems: 'center', justifyContent: 'center',
  },
  avatarIcon: { fontSize: 20 },
  heyText: { fontSize: 15, fontWeight: '700' },
  subText: { fontSize: 12, marginTop: 1 },
  bellWrapper: { position: 'relative', padding: 4 },
  bellIcon: { fontSize: 22 },
  bellBadge: {
    position: 'absolute', top: 0, right: 0,
    backgroundColor: '#E24B4A',
    width: 16, height: 16, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  bellBadgeText: { color: '#FFF', fontSize: 9, fontWeight: '700' },

  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderRadius: 14,
    marginHorizontal: 20, paddingHorizontal: 14,
    height: 48, marginBottom: 16,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14 },
  micIcon: { fontSize: 16, marginLeft: 8 },

  bannerScroll: { paddingLeft: 20, marginBottom: 10 },
  bannerCard: {
    width: width - 48, marginRight: 12,
    borderRadius: 20, padding: 20, height: 140,
    flexDirection: 'row', overflow: 'hidden',
  },
  bannerLeft: { flex: 1, justifyContent: 'center' },
  bannerTitle: { color: '#FFF', fontSize: 18, fontWeight: '800', marginBottom: 4 },
  bannerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginBottom: 12 },
  bannerBtn: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 20, alignSelf: 'flex-start',
  },
  bannerBtnText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  bannerRight: { alignItems: 'center', justifyContent: 'center', width: 80 },
  bannerEmoji: { fontSize: 52 },

  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: 20 },
  dot: { width: 6, height: 6, borderRadius: 3 },

  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 20, marginBottom: 14,
  },
  sectionTitle: { fontFamily: 'serif', fontSize: 20, fontWeight: '700' },
  seeAll: { fontSize: 13, fontWeight: '600' },

  categoriesRow: { paddingHorizontal: 20, gap: 12, paddingBottom: 20 },
  categoryCard: {
    width: 100, borderWidth: 1, borderRadius: 16,
    padding: 14, alignItems: 'center',
  },
  categoryIconBox: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  categoryEmoji: { fontSize: 20 },
  categoryLabel: { fontSize: 13, fontWeight: '700', marginBottom: 2 },
  categoryCount: { fontSize: 11 },

  flashSaleStrip: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 20, borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 10,
    marginBottom: 12, gap: 8,
  },
  flashEmoji: { fontSize: 18 },
  flashText: { fontSize: 13, fontWeight: '600', flex: 1 },
  timerBox: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  timerText: { color: '#FFF', fontSize: 13, fontWeight: '700' },

  flashRow: { paddingHorizontal: 20, gap: 10, paddingBottom: 20 },
  flashCard: {
    width: 100, borderWidth: 1, borderRadius: 14,
    padding: 10, alignItems: 'center', position: 'relative',
  },
  flashDiscountBadge: {
    position: 'absolute', top: 8, left: 8,
    backgroundColor: '#E24B4A',
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6,
  },
  flashDiscountText: { color: '#FFF', fontSize: 9, fontWeight: '700' },
  flashEmojiBig: { fontSize: 32, marginBottom: 6, marginTop: 8 },
  flashName: { fontSize: 11, fontWeight: '600', textAlign: 'center', marginBottom: 2 },
  flashOld: { fontSize: 10, textDecorationLine: 'line-through' },
  flashPrice: { fontSize: 12, fontWeight: '700' },

  productsGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 20, gap: 12, marginBottom: 8,
  },
  productCard: {
    width: (width - 52) / 2,
    borderWidth: 1, borderRadius: 16,
    overflow: 'hidden', position: 'relative',
  },
  wishlistBtn: { position: 'absolute', top: 8, right: 8, zIndex: 1 },
  wishlistIcon: { fontSize: 18 },
  productImageBox: { height: 130, overflow: 'hidden' },
  productImage: { width: '100%', height: '100%' },
  productInfo: { padding: 10 },
  productBrand: { fontSize: 10, marginBottom: 2 },
  productName: { fontSize: 13, fontWeight: '600', marginBottom: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 4 },
  star: { fontSize: 10 },
  ratingText: { fontSize: 11, fontWeight: '700' },
  reviewText: { fontSize: 10 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 },
  oldPrice: { fontSize: 10, textDecorationLine: 'line-through' },
  price: { fontSize: 13, fontWeight: '700' },
  addToCartBtn: {
    borderWidth: 1, borderRadius: 8,
    paddingVertical: 6, alignItems: 'center',
  },
  addToCartText: { fontSize: 11, fontWeight: '700' },

  bottomNav: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: 70, borderTopWidth: 1,
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 10, paddingBottom: 8,
  },
  navItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  navIcon: { fontSize: 22 },
  navLabel: { fontSize: 10, marginTop: 2 },
  navIconActive: { fontSize: 22 },
  navLabelActive: { fontSize: 10, fontWeight: '700', marginTop: 2 },

  cartFabWrapper: { alignItems: 'center', justifyContent: 'center', position: 'relative' },
  cartFab: {
    width: 56, height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  cartFabIcon: { fontSize: 24 },
  cartBadge: {
    position: 'absolute', top: -4, right: -4,
    backgroundColor: '#E24B4A',
    width: 18, height: 18, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#FFF',
  },
  cartBadgeText: { color: '#FFF', fontSize: 9, fontWeight: '700' },

  notifOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 999,
  },
  notifPanel: {
    position: 'absolute', top: 100, right: 16, left: 16,
    borderRadius: 16, padding: 16,
    borderWidth: 1,
  },
  notifHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 12,
  },
  notifTitle: { fontSize: 16, fontWeight: '700' },
  notifItem: {
    paddingVertical: 10,
    borderBottomWidth: 0.5,
  },
});