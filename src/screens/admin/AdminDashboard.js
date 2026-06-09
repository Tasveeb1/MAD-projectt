// AdminDashboard_fixed.jsx
// FIXES:
// 1. AsyncStorage top-level import (no require())
// 2. getAllOrders se aane wale orders mein uid properly attached hai
// 3. updateStatus mein order.uid correctly use hota hai
// 4. Pull-to-refresh + auto-load on mount

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, StatusBar, Dimensions, RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // ✅ FIX 1
import { useTheme } from '../../context/ThemeContext';
import { useProducts } from '../../context/ProductsContext';
import { getAllOrders } from '../../utils/storage';

const { width } = Dimensions.get('window');

const LIGHT = {
  bg: '#F8F2F0', card: '#FFFFFF', blush: '#FDECEA', border: '#F2D4D0',
  roseGold: '#C9967A', roseGoldDark: '#A87060', roseGoldLight: '#E8C4B8',
  textPrimary: '#1A1A1A', textSecondary: '#8A7B78', textMuted: '#BFB0AE',
  success: '#2D9E75', successBg: '#E8F8F2', danger: '#E24B4A', dangerBg: '#FDE8E8',
  warning: '#F5A623', warningBg: '#FEF6E8', infoBg: '#E8F0FE', info: '#4A80F0',
};

const DARK = {
  bg: '#1C0A1A', card: '#2D1225', blush: '#3D1A2A', border: '#4A2040',
  roseGold: '#C9956C', roseGoldDark: '#E8B4A0', roseGoldLight: '#7A4A5A',
  textPrimary: '#F5E6E0', textSecondary: '#B08080', textMuted: '#7A5A5A',
  success: '#2D9E75', successBg: '#0D3A2A', danger: '#E24B4A', dangerBg: '#3A0D0D',
  warning: '#F5A623', warningBg: '#3A2A0D', infoBg: '#0D1A3A', info: '#4A80F0',
};

const STATUS_CONFIG = {
  Placed:       { label: 'Placed',      color: '#4A80F0', bg: '#E8F0FE' },
  Processing:   { label: 'Processing',  color: '#4A80F0', bg: '#E8F0FE' },
  Shipped:      { label: 'Shipped',     color: '#F5A623', bg: '#FEF6E8' },
  'In Transit': { label: 'In Transit',  color: '#F5A623', bg: '#FEF6E8' },
  Delivered:    { label: 'Delivered',   color: '#2D9E75', bg: '#E8F8F2' },
  Cancelled:    { label: 'Cancelled',   color: '#E24B4A', bg: '#FDE8E8' },
  pending:      { label: 'Pending',     color: '#8A7B78', bg: '#F7E8E4' },
};

export default function AdminDashboard({ navigation }) {
  const { isDark }   = useTheme();
  const C            = isDark ? DARK : LIGHT;
  const { products } = useProducts();

  const [orders,     setOrders]     = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // ✅ FIX 2: getAllOrders already attaches uid (from storage.js)
  // but we also log for debugging
  const loadOrders = useCallback(async () => {
    try {
      const raw  = await AsyncStorage.getItem('all_user_uids'); // ✅ top-level import
      const uids = raw ? JSON.parse(raw) : [];

      console.log('Admin: found UIDs:', uids); // debug — remove in production

      if (uids.length === 0) {
        setOrders([]);
        return;
      }

      const all = await getAllOrders(uids);
      console.log('Admin: loaded orders:', all.length); // debug
      setOrders(all);
    } catch (e) {
      console.log('loadOrders error:', e);
    }
  }, []);

  useEffect(() => { loadOrders(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  // Derived stats
  const totalProducts = products.length;
  const inStockCount  = products.filter(p => p.inStock).length;
  const outStockCount = products.filter(p => !p.inStock).length;
  const saleCount     = products.filter(p => p.isSale).length;

  const todayStr    = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  const todayOrders = orders.filter(o => o.date === todayStr);
  const todayRev    = todayOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const totalRev    = orders.reduce((sum, o) => sum + (o.total || 0), 0);

  // ✅ FIX 3: order.uid is guaranteed from getAllOrders (storage.js attaches it)
  const updateStatus = async (order, newStatus) => {
    try {
      if (!order.uid) {
        console.log('updateStatus: missing uid on order', order.orderId);
        return;
      }
      const key      = `orders_${order.uid}`;
      const raw      = await AsyncStorage.getItem(key);
      const existing = raw ? JSON.parse(raw) : [];
      const updated  = existing.map(o =>
        o.orderId === order.orderId ? { ...o, status: newStatus } : o
      );
      await AsyncStorage.setItem(key, JSON.stringify(updated));
      await loadOrders(); // refresh list
    } catch (e) {
      console.log('updateStatus error:', e);
    }
  };

  const s = makeStyles(C);

  const StatCard = ({ icon, label, value, bg, valueColor }) => (
    <View style={[s.statCard, { backgroundColor: bg || C.card }]}>
      <Text style={s.statIcon}>{icon}</Text>
      <Text style={[s.statValue, valueColor && { color: valueColor }]}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );

  return (
    <View style={s.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={C.bg} />

      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.headerGreet}>Admin Panel 🛡️</Text>
          <Text style={s.headerSub}>Welcome back, Admin</Text>
        </View>
        <TouchableOpacity style={s.logoutBtn} onPress={() => navigation.replace('Login')}>
          <Text style={s.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.roseGold} />}
      >
        {/* Stats */}
        <Text style={s.sectionTitle}>Overview</Text>
        <View style={s.statsGrid}>
          <StatCard icon="📦" label="Total Products" value={totalProducts} bg={C.blush}     valueColor={C.roseGold} />
          <StatCard icon="✅" label="In Stock"        value={inStockCount}  bg={C.successBg} valueColor={C.success}  />
          <StatCard icon="❌" label="Out of Stock"    value={outStockCount} bg={C.dangerBg}  valueColor={C.danger}   />
          <StatCard icon="🏷️" label="On Sale"         value={saleCount}     bg={C.warningBg} valueColor={C.warning}  />
        </View>

        {/* Revenue */}
        <View style={s.revenueBanner}>
          <View>
            <Text style={s.revenueLabel}>Today's Revenue</Text>
            <Text style={s.revenueValue}>PKR {todayRev.toLocaleString()}</Text>
            <Text style={s.revenueSub}>
              {todayOrders.length} order{todayOrders.length !== 1 ? 's' : ''} today
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={s.revenueEmoji}>💰</Text>
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 4 }}>
              Total: PKR {totalRev.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <Text style={s.sectionTitle}>Quick Actions</Text>
        <View style={s.actionsRow}>
          <TouchableOpacity style={[s.actionCard, { backgroundColor: C.roseGold }]} onPress={() => navigation.navigate('ManageProducts')}>
            <Text style={s.actionIcon}>➕</Text>
            <Text style={s.actionLabel}>Add Product</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.actionCard, { backgroundColor: C.card, borderWidth: 1, borderColor: C.border }]} onPress={() => navigation.navigate('ManageProducts')}>
            <Text style={s.actionIcon}>📝</Text>
            <Text style={[s.actionLabel, { color: C.textPrimary }]}>Manage Products</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.actionCard, { backgroundColor: C.card, borderWidth: 1, borderColor: C.border }]} onPress={onRefresh}>
            <Text style={s.actionIcon}>🔄</Text>
            <Text style={[s.actionLabel, { color: C.textPrimary }]}>Refresh</Text>
          </TouchableOpacity>
        </View>

        {/* Category Breakdown */}
        <Text style={s.sectionTitle}>Products by Category</Text>
        <View style={s.categoryBreakdown}>
          {['Women', 'Men', 'Fragrance'].map(cat => {
            const count = products.filter(p => p.category === cat).length;
            const pct   = totalProducts > 0 ? (count / totalProducts) * 100 : 0;
            const catColors = { Women: C.roseGold, Men: C.info, Fragrance: C.warning };
            return (
              <View key={cat} style={s.catRow}>
                <Text style={s.catLabel}>{cat}</Text>
                <View style={s.catBarBg}>
                  <View style={[s.catBarFill, { width: `${pct}%`, backgroundColor: catColors[cat] || C.roseGold }]} />
                </View>
                <Text style={[s.catCount, { color: catColors[cat] || C.roseGold }]}>{count}</Text>
              </View>
            );
          })}
        </View>

        {/* Orders */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>
            All Orders {orders.length > 0 ? `(${orders.length})` : ''}
          </Text>
          <TouchableOpacity onPress={onRefresh}>
            <Text style={s.seeAll}>Refresh</Text>
          </TouchableOpacity>
        </View>

        {orders.length === 0 ? (
          <View style={[s.orderCard, { alignItems: 'center', padding: 30 }]}>
            <Text style={{ fontSize: 36, marginBottom: 10 }}>📭</Text>
            <Text style={{ fontSize: 14, color: C.textSecondary, textAlign: 'center' }}>
              No orders yet.{'\n'}Pull down to refresh.
            </Text>
          </View>
        ) : (
          orders.map((order, idx) => {
            const st = STATUS_CONFIG[order.status] || STATUS_CONFIG['Placed'];
            return (
              <View key={`${order.orderId}-${idx}`} style={s.orderCard}>
                <View style={s.orderTop}>
                  <Text style={s.orderId}>#{order.orderId}</Text>
                  <View style={[s.statusBadge, { backgroundColor: isDark ? C.card : st.bg }]}>
                    <Text style={[s.statusText, { color: st.color }]}>{st.label}</Text>
                  </View>
                </View>

                {order.address?.fullName && (
                  <Text style={s.orderCustomer}>👤 {order.address.fullName}</Text>
                )}
                {order.address?.phone && (
                  <Text style={[s.orderMeta, { marginBottom: 4 }]}>📞 {order.address.phone}</Text>
                )}
                {order.address?.city && (
                  <Text style={[s.orderMeta, { marginBottom: 6 }]}>
                    📍 {order.address.address}{order.address.area ? `, ${order.address.area}` : ''}, {order.address.city}
                  </Text>
                )}

                {order.items?.length > 0 && (
                  <Text style={[s.orderMeta, { marginBottom: 6 }]} numberOfLines={1}>
                    🛍 {order.items.map(x => x.name).join(', ')}
                  </Text>
                )}

                <View style={s.orderBottom}>
                  <Text style={s.orderMeta}>
                    {order.payMethod === 'cod' ? '💵 COD' : order.payMethod === 'card' ? '💳 Card' : '📱 Wallet'} · {order.date}
                  </Text>
                  <Text style={s.orderAmount}>PKR {order.total?.toLocaleString()}</Text>
                </View>

                {/* Status update buttons */}
                <View style={s.statusBtns}>
                  {['Placed', 'In Transit', 'Delivered', 'Cancelled'].map(status => (
                    <TouchableOpacity
                      key={status}
                      onPress={() => updateStatus(order, status)}
                      style={[
                        s.statusBtn,
                        { borderColor: STATUS_CONFIG[status]?.color || C.border },
                        order.status === status && { backgroundColor: STATUS_CONFIG[status]?.color || C.roseGold },
                      ]}
                    >
                      <Text style={{
                        fontSize: 10, fontWeight: '700',
                        color: order.status === status ? '#fff' : STATUS_CONFIG[status]?.color || C.textMuted,
                      }}>
                        {status}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            );
          })
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const makeStyles = (C) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 54, paddingBottom: 16,
    backgroundColor: C.card, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  headerGreet: { fontSize: 22, fontWeight: '800', color: C.textPrimary },
  headerSub:   { fontSize: 13, color: C.textMuted, marginTop: 2 },
  logoutBtn:   { backgroundColor: C.dangerBg, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: C.danger },
  logoutText:  { fontSize: 13, fontWeight: '700', color: C.danger },

  scroll:        { paddingHorizontal: 16, paddingTop: 20 },
  sectionTitle:  { fontSize: 16, fontWeight: '700', color: C.textPrimary, marginBottom: 12, marginTop: 4 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, marginTop: 4 },
  seeAll:        { fontSize: 13, color: C.roseGold, fontWeight: '600' },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  statCard:  { width: (width - 42) / 2, borderRadius: 16, padding: 16, alignItems: 'flex-start' },
  statIcon:  { fontSize: 24, marginBottom: 8 },
  statValue: { fontSize: 26, fontWeight: '800', color: C.textPrimary, marginBottom: 2 },
  statLabel: { fontSize: 12, color: C.textSecondary, fontWeight: '500' },

  revenueBanner: { backgroundColor: C.roseGold, borderRadius: 18, padding: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  revenueLabel:  { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 4 },
  revenueValue:  { fontSize: 28, fontWeight: '800', color: '#FFF', marginBottom: 4 },
  revenueSub:    { fontSize: 12, color: 'rgba(255,255,255,0.75)' },
  revenueEmoji:  { fontSize: 48 },

  actionsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  actionCard: { flex: 1, borderRadius: 14, paddingVertical: 16, alignItems: 'center', justifyContent: 'center', gap: 6 },
  actionIcon: { fontSize: 24 },
  actionLabel:{ fontSize: 11, fontWeight: '700', color: '#FFF', textAlign: 'center' },

  categoryBreakdown: { backgroundColor: C.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.border, marginBottom: 20, gap: 14 },
  catRow:    { flexDirection: 'row', alignItems: 'center', gap: 10 },
  catLabel:  { fontSize: 13, color: C.textSecondary, width: 80, fontWeight: '500' },
  catBarBg:  { flex: 1, height: 8, backgroundColor: C.border, borderRadius: 4, overflow: 'hidden' },
  catBarFill:{ height: 8, borderRadius: 4 },
  catCount:  { fontSize: 13, fontWeight: '700', width: 24, textAlign: 'right' },

  orderCard:     { backgroundColor: C.card, borderRadius: 14, borderWidth: 1, borderColor: C.border, padding: 14, marginBottom: 10 },
  orderTop:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  orderId:       { fontSize: 14, fontWeight: '700', color: C.textPrimary },
  statusBadge:   { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3 },
  statusText:    { fontSize: 11, fontWeight: '700' },
  orderCustomer: { fontSize: 13, color: C.textSecondary, marginBottom: 4 },
  orderBottom:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  orderMeta:     { fontSize: 12, color: C.textMuted },
  orderAmount:   { fontSize: 14, fontWeight: '700', color: C.roseGold },

  statusBtns: { flexDirection: 'row', gap: 6, marginTop: 10, flexWrap: 'wrap' },
  statusBtn:  { borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
});