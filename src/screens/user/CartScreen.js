// src/screens/user/CartScreen.js
import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  FlatList, Animated, TextInput,
  SafeAreaView, StatusBar, Alert,
} from 'react-native';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';

const LIGHT = {
  bg: '#FDF6F0', card: '#FFFFFF',
  blush: '#FDECEA', inputBg: '#FDF0EE', border: '#F2D4D0',
  roseGold: '#C9956C', roseGoldDark: '#A87060', roseGoldLight: '#E8C4B8',
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

const PROMO_CODES = {
  SAVE10:  { type: 'percent', value: 10,  label: '10% Off' },
  FLAT500: { type: 'flat',    value: 500, label: 'PKR 500 Off' },
  LUXE20:  { type: 'percent', value: 20,  label: '20% Off' },
  WELCOME: { type: 'flat',    value: 300, label: 'PKR 300 Off' },
};

// ── Cart Item ────────────────────────────────────────────────
const CartItem = ({ item, onRemove, onQtyChange, C }) => {
  const slideX = useRef(new Animated.Value(0)).current;
  const [swiped, setSwiped] = useState(false);

  const handleSwipeToggle = () => {
    Animated.spring(slideX, {
      toValue: swiped ? 0 : -72,
      useNativeDriver: true, tension: 80, friction: 12,
    }).start();
    setSwiped(!swiped);
  };

  return (
    <View style={{ marginBottom: 14, borderRadius: 16, overflow: 'hidden' }}>
      {/* Delete bg */}
      <View style={{
        position: 'absolute', right: 0, top: 0, bottom: 0, width: 72,
        backgroundColor: C.danger, justifyContent: 'center', alignItems: 'center', borderRadius: 16,
      }}>
        <TouchableOpacity onPress={() => onRemove(item.id)} style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 20 }}>🗑</Text>
          <Text style={{ fontSize: 10, color: '#FFF', fontWeight: '600', marginTop: 2 }}>Remove</Text>
        </TouchableOpacity>
      </View>

      <Animated.View style={[{
        backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 16,
      }, { transform: [{ translateX: slideX }] }]}>
        <TouchableOpacity onPress={handleSwipeToggle} activeOpacity={0.97}
          style={{ flexDirection: 'row', alignItems: 'center', padding: 12 }}>
          {/* Thumb */}
          <View style={{
            width: 80, height: 80, borderRadius: 12,
            backgroundColor: C.blush, alignItems: 'center', justifyContent: 'center',
          }}>
            <Text style={{ fontSize: 34 }}>{item.emoji || '🛍️'}</Text>
          </View>

          {/* Meta */}
          <View style={{ flex: 1, paddingHorizontal: 10 }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: C.textPrimary, marginBottom: 3 }} numberOfLines={2}>
              {item.name}
            </Text>
            <Text style={{ fontSize: 11, color: C.textMuted, marginBottom: 4 }}>
              {item.selectedSize ? `Size: ${item.selectedSize}` : item.category || 'General'}
            </Text>
            <Text style={{ fontSize: 14, fontWeight: '700', color: C.roseGold }}>
              PKR {item.price.toLocaleString()}
            </Text>
          </View>

          {/* Qty */}
          <View style={{ alignItems: 'center', gap: 6 }}>
            <TouchableOpacity
              style={{ width: 30, height: 30, borderRadius: 15, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center', backgroundColor: C.inputBg }}
              onPress={() => onQtyChange(item.id, (item.quantity || 1) - 1)}
            >
              <Text style={{ fontSize: 18, color: C.textPrimary, lineHeight: 22 }}>−</Text>
            </TouchableOpacity>
            <Text style={{ fontSize: 14, fontWeight: '700', color: C.textPrimary }}>{item.quantity || 1}</Text>
            <TouchableOpacity
              style={{ width: 30, height: 30, borderRadius: 15, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center', backgroundColor: C.inputBg }}
              onPress={() => onQtyChange(item.id, (item.quantity || 1) + 1)}
            >
              <Text style={{ fontSize: 18, color: C.textPrimary, lineHeight: 22 }}>+</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

// ── Main Screen ──────────────────────────────────────────────
const CartScreen = ({ navigation }) => {
  const { isDark } = useTheme();
  const C = isDark ? DARK : LIGHT;
  const { cartItems, removeFromCart, updateQuantity, clearCart } = useCart();

  const [promoInput, setPromoInput]     = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError]     = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');
  const promoShake = useRef(new Animated.Value(0)).current;

  const subtotal = cartItems.reduce((sum, i) => sum + i.price * (i.quantity || 1), 0);
  const delivery = subtotal > 10000 ? 0 : 250;
  let discount = 0;
  if (appliedPromo) {
    const p = PROMO_CODES[appliedPromo];
    discount = p.type === 'percent' ? Math.round(subtotal * p.value / 100) : p.value;
  }
  const total = subtotal + delivery - discount;

  const applyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) return;
    if (PROMO_CODES[code]) {
      setAppliedPromo(code);
      setPromoSuccess(`✓ "${code}" applied — ${PROMO_CODES[code].label}`);
      setPromoError('');
      setPromoInput('');
    } else {
      setAppliedPromo(null);
      setPromoError('Invalid code. Try: SAVE10, FLAT500, LUXE20');
      setPromoSuccess('');
      Animated.sequence([
        Animated.timing(promoShake, { toValue: 10,  duration: 60, useNativeDriver: true }),
        Animated.timing(promoShake, { toValue: -10, duration: 60, useNativeDriver: true }),
        Animated.timing(promoShake, { toValue: 6,   duration: 60, useNativeDriver: true }),
        Animated.timing(promoShake, { toValue: 0,   duration: 60, useNativeDriver: true }),
      ]).start();
    }
  };

  const handleQtyChange = (id, newQty) => {
    if (newQty < 1) {
      Alert.alert('Remove Item', 'Remove this item from cart?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removeFromCart(id) },
      ]);
    } else {
      updateQuantity(id, newQty);
    }
  };

  const s = makeStyles(C);

  const ListFooter = () => (
    <>
      {/* Promo Section */}
      <View style={s.promoSection}>
        <Text style={s.sectionTitle}>🏷️ Promo Code</Text>
        {appliedPromo ? (
          <View style={s.promoBadge}>
            <Text style={s.promoTag}>🏷 {appliedPromo} — {PROMO_CODES[appliedPromo].label}</Text>
            <TouchableOpacity onPress={() => { setAppliedPromo(null); setPromoSuccess(''); setPromoError(''); }}>
              <Text style={s.promoBadgeRemove}>✕</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Animated.View style={[s.promoInputRow, { transform: [{ translateX: promoShake }] }]}>
            <TextInput
              style={s.promoInput}
              placeholder="Enter promo code"
              placeholderTextColor={C.textMuted}
              value={promoInput}
              onChangeText={t => { setPromoInput(t); setPromoError(''); }}
              autoCapitalize="characters"
              returnKeyType="done"
              onSubmitEditing={applyPromo}
              blurOnSubmit={false}
            />
            <TouchableOpacity style={s.applyBtn} onPress={applyPromo}>
              <Text style={s.applyBtnText}>Apply</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
        {promoError  ? <Text style={s.promoError}>{promoError}</Text>   : null}
        {promoSuccess ? <Text style={s.promoSuccess}>{promoSuccess}</Text> : null}

        {/* Hint chips */}
        {!appliedPromo && (
          <View style={s.promoHints}>
            {Object.entries(PROMO_CODES).map(([code, info]) => (
              <TouchableOpacity key={code} style={s.hintChip} onPress={() => setPromoInput(code)}>
                <Text style={s.hintChipText}>{code}</Text>
                <Text style={s.hintChipSub}>{info.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Order Summary */}
      <View style={s.summaryCard}>
        <Text style={s.sectionTitle}>Order Summary</Text>
        <View style={s.summaryRow}>
          <Text style={s.summaryLabel}>Subtotal</Text>
          <Text style={s.summaryValue}>PKR {subtotal.toLocaleString()}</Text>
        </View>
        <View style={s.summaryRow}>
          <Text style={s.summaryLabel}>Delivery</Text>
          <Text style={[s.summaryValue, delivery === 0 && { color: C.success }]}>
            {delivery === 0 ? 'FREE 🎉' : `PKR ${delivery.toLocaleString()}`}
          </Text>
        </View>
        {delivery > 0 && (
          <Text style={s.deliveryNote}>Add PKR {(10000 - subtotal).toLocaleString()} more for free delivery</Text>
        )}
        {appliedPromo && (
          <View style={s.summaryRow}>
            <Text style={[s.summaryLabel, { color: C.success }]}>Promo ({appliedPromo})</Text>
            <Text style={[s.summaryValue, { color: C.success }]}>− PKR {discount.toLocaleString()}</Text>
          </View>
        )}
        <View style={s.divider} />
        <View style={s.summaryRow}>
          <Text style={s.totalLabel}>Total</Text>
          <Text style={s.totalValue}>PKR {total.toLocaleString()}</Text>
        </View>
      </View>
      <View style={{ height: 120 }} />
    </>
  );

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={C.bg} />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>My Cart</Text>
        {cartItems.length > 0 && (
          <TouchableOpacity onPress={() =>
            Alert.alert('Clear Cart', 'Remove all items?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Clear', style: 'destructive', onPress: clearCart },
            ])
          }>
            <Text style={s.clearText}>Clear All</Text>
          </TouchableOpacity>
        )}
        {cartItems.length === 0 && <View style={{ width: 60 }} />}
      </View>

      {cartItems.length === 0 ? (
        <View style={s.emptyWrap}>
          <Text style={s.emptyEmoji}>🛍️</Text>
          <Text style={s.emptyTitle}>Your cart is empty</Text>
          <Text style={s.emptySubtitle}>Add something beautiful to get started</Text>
          <TouchableOpacity style={s.emptyBtn} onPress={() => navigation.navigate('Home')}>
            <Text style={s.emptyBtnText}>Explore Collection</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <Text style={s.itemCount}>
            {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in your cart
          </Text>
          <FlatList
            data={cartItems}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="none"
            keyExtractor={(item, i) => `${item.id}_${i}`}
            renderItem={({ item }) => (
              <CartItem item={item} onRemove={removeFromCart} onQtyChange={handleQtyChange} C={C} />
            )}
            contentContainerStyle={{ paddingHorizontal: 16 }}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={<ListFooter />}
          />

          {/* Checkout Bar */}
          <View style={s.checkoutBar}>
            <View>
              <Text style={s.checkoutTotalLabel}>Total</Text>
              <Text style={s.checkoutTotalValue}>PKR {total.toLocaleString()}</Text>
            </View>
            <TouchableOpacity
              style={s.checkoutBtn}
              onPress={() => navigation.navigate('Checkout', { subtotal, delivery, discount, total, appliedPromo })}
            >
              <Text style={s.checkoutBtnText}>Proceed to Checkout →</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
};

const makeStyles = (C) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  backBtn: { padding: 6 },
  backIcon: { fontSize: 22, color: C.textPrimary },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: C.roseGoldDark },
  clearText: { fontSize: 13, color: C.danger, fontWeight: '600' },
  itemCount: { marginHorizontal: 16, marginBottom: 8, fontSize: 13, color: C.textMuted },

  promoSection: {
    marginTop: 8, marginBottom: 14,
    backgroundColor: C.blush, borderRadius: 16,
    padding: 16, borderWidth: 1, borderColor: C.border,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: C.roseGoldDark, marginBottom: 12 },
  promoInputRow: { flexDirection: 'row', gap: 8 },
  promoInput: {
    flex: 1, height: 46, backgroundColor: C.card,
    borderWidth: 1, borderColor: C.border,
    borderRadius: 12, paddingHorizontal: 14,
    fontSize: 14, color: C.textPrimary,
    fontWeight: '600', letterSpacing: 1,
  },
  applyBtn: { height: 46, paddingHorizontal: 20, backgroundColor: C.roseGold, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  applyBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  promoError:   { marginTop: 8, fontSize: 12, color: C.danger,   fontWeight: '500' },
  promoSuccess: { marginTop: 8, fontSize: 12, color: C.success, fontWeight: '600' },
  promoHints: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  hintChip: {
    backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6, alignItems: 'center',
  },
  hintChipText: { fontSize: 11, fontWeight: '700', color: C.roseGoldDark },
  hintChipSub:  { fontSize: 10, color: C.textMuted, marginTop: 1 },
  promoBadge: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: C.card, borderWidth: 1, borderColor: C.success,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
  },
  promoTag: { fontSize: 13, fontWeight: '700', color: C.success },
  promoBadgeRemove: { fontSize: 14, color: C.textMuted, fontWeight: '700' },

  summaryCard: { backgroundColor: C.cardBg, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.border, marginBottom: 10 },
  summaryRow:  { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { fontSize: 14, color: C.textSecondary },
  summaryValue: { fontSize: 14, fontWeight: '600', color: C.textPrimary },
  deliveryNote: { fontSize: 11, color: C.success, marginBottom: 8 },
  divider: { height: 1, backgroundColor: C.border, marginVertical: 10 },
  totalLabel: { fontSize: 16, fontWeight: '700', color: C.textPrimary },
  totalValue: { fontSize: 18, fontWeight: '800', color: C.roseGoldDark },

  checkoutBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.card,
    borderTopWidth: 1, borderTopColor: C.border,
    paddingHorizontal: 16, paddingVertical: 12, paddingBottom: 20, gap: 12,
  },
  checkoutTotalLabel: { fontSize: 11, color: C.textMuted },
  checkoutTotalValue: { fontSize: 18, fontWeight: '800', color: C.roseGoldDark },
  checkoutBtn: { flex: 1, height: 52, borderRadius: 16, backgroundColor: C.roseGold, alignItems: 'center', justifyContent: 'center' },
  checkoutBtnText: { color: '#FFF', fontWeight: '700', fontSize: 15 },

  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 80 },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 22, fontWeight: '700', color: C.textPrimary, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: C.textMuted, marginBottom: 28, textAlign: 'center' },
  emptyBtn: { backgroundColor: C.roseGold, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 16 },
  emptyBtnText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
});

export default CartScreen;