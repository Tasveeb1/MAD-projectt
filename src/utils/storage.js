// src/utils/storage.js
// ─────────────────────────────────────────────────────────────────
// SINGLE source of truth for all AsyncStorage keys & helpers.
// Import this in CheckoutScreen, SettingsScreen, and AdminDashboard.
// ─────────────────────────────────────────────────────────────────
import AsyncStorage from '@react-native-async-storage/async-storage';

// ── Key builders ──────────────────────────────────────────────
export const KEYS = {
  orders:         (uid) => `orders_${uid}`,
  addresses:      (uid) => `addresses_${uid}`,
  paymentMethod:  (uid) => `payment_method_${uid}`,
};

// ── Orders ────────────────────────────────────────────────────
export const getOrders = async (uid) => {
  try {
    const data = await AsyncStorage.getItem(KEYS.orders(uid));
    return data ? JSON.parse(data) : [];
  } catch { return []; }
};

export const saveOrder = async (uid, orderObj) => {
  try {
    const existing = await getOrders(uid);
    const updated  = [orderObj, ...existing];
    await AsyncStorage.setItem(KEYS.orders(uid), JSON.stringify(updated));
    return updated;
  } catch (e) { console.log('saveOrder error:', e); return null; }
};

// ── ALL orders (admin) — returns { uid, orders[] }[] ─────────
// Works only if you also store a user-index. See note below.
// Simpler approach: admin reads from a known list of UIDs,
// or you push orders to Firestore in placeOrder() as well.
export const getAllOrders = async (knownUids = []) => {
  try {
    const results = await Promise.all(
      knownUids.map(async uid => {
        const orders = await getOrders(uid);
        return orders.map(o => ({ ...o, uid }));
      })
    );
    return results.flat().sort((a, b) => new Date(b.placedAt) - new Date(a.placedAt));
  } catch { return []; }
};

// ── Addresses ─────────────────────────────────────────────────
export const getAddresses = async (uid) => {
  try {
    const data = await AsyncStorage.getItem(KEYS.addresses(uid));
    return data ? JSON.parse(data) : [];
  } catch { return []; }
};

export const saveAddresses = async (uid, addresses) => {
  try {
    await AsyncStorage.setItem(KEYS.addresses(uid), JSON.stringify(addresses));
    return addresses;
  } catch (e) { console.log('saveAddresses error:', e); return null; }
};

export const addAddress = async (uid, { label, address, phone = '' }) => {
  const existing = await getAddresses(uid);
  const entry = {
    id:        Date.now().toString(),
    label:     label.trim(),
    address:   address.trim(),
    phone:     phone.trim(),
    default:   existing.length === 0,   // first one becomes default
    createdAt: new Date().toISOString(),
  };
  return saveAddresses(uid, [...existing, entry]);
};

export const deleteAddress = async (uid, id) => {
  const existing = await getAddresses(uid);
  return saveAddresses(uid, existing.filter(a => a.id !== id));
};

export const setDefaultAddress = async (uid, id) => {
  const existing = await getAddresses(uid);
  return saveAddresses(uid, existing.map(a => ({ ...a, default: a.id === id })));
};