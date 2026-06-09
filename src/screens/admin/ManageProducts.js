// src/screens/admin/ManageProducts.js

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar, Modal, TextInput, ScrollView,
  Alert, Switch, KeyboardAvoidingView, Platform,
  SafeAreaView,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useProducts } from '../../context/ProductsContext';

const LIGHT = {
  bg: '#F8F2F0',
  card: '#FFFFFF',
  blush: '#FDECEA',
  inputBg: '#FDF0EE',
  border: '#F2D4D0',
  roseGold: '#C9967A',
  roseGoldDark: '#A87060',
  roseGoldLight: '#E8C4B8',
  textPrimary: '#1A1A1A',
  textSecondary: '#8A7B78',
  textMuted: '#BFB0AE',
  success: '#2D9E75',
  successBg: '#E8F8F2',
  danger: '#E24B4A',
  dangerBg: '#FDE8E8',
  warning: '#F5A623',
  warningBg: '#FEF6E8',
};

const DARK = {
  bg: '#1C0A1A',
  card: '#2D1225',
  blush: '#3D1A2A',
  inputBg: '#2A1020',
  border: '#4A2040',
  roseGold: '#C9956C',
  roseGoldDark: '#E8B4A0',
  roseGoldLight: '#7A4A5A',
  textPrimary: '#F5E6E0',
  textSecondary: '#B08080',
  textMuted: '#7A5A5A',
  success: '#2D9E75',
  successBg: '#0D3A2A',
  danger: '#E24B4A',
  dangerBg: '#3A0D0D',
  warning: '#F5A623',
  warningBg: '#3A2A0D',
};

const CATEGORIES = ['Women', 'Men', 'Fragrance', 'Kids', 'Accessories'];
const DEFAULT_SIZES = { Women: ['XS', 'S', 'M', 'L', 'XL'], Men: ['S', 'M', 'L', 'XL', 'XXL'], Fragrance: ['30ml', '50ml', '100ml'], Kids: ['2Y', '4Y', '6Y', '8Y'], Accessories: ['One Size'] };

const EMPTY_FORM = {
  name: '', brand: '', price: '', oldPrice: '',
  category: 'Women', description: '', image: '',
  inStock: true, isSale: false, discount: '',
  sizes: ['S', 'M', 'L'],
};

// ── Field Component ──────────────────────────────────────────
const Field = ({ label, value, onChangeText, placeholder, keyboardType, multiline, C }) => (
  <View style={{ marginBottom: 12 }}>
    <Text style={{ fontSize: 12, fontWeight: '600', color: C.textSecondary, marginBottom: 5 }}>{label}</Text>
    <TextInput
      style={{
        backgroundColor: C.inputBg,
        borderWidth: 1, borderColor: C.border,
        borderRadius: 10, paddingHorizontal: 12,
        paddingVertical: multiline ? 10 : 0,
        height: multiline ? 80 : 44,
        fontSize: 14, color: C.textPrimary,
        textAlignVertical: multiline ? 'top' : 'center',
      }}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder || ''}
      placeholderTextColor={C.textMuted}
      keyboardType={keyboardType || 'default'}
      multiline={multiline}
      blurOnSubmit={false}
    />
  </View>
);

// ── Add / Edit Modal ─────────────────────────────────────────
const ProductFormModal = ({ visible, onClose, onSave, editProduct, C }) => {
  const [form, setForm] = useState(editProduct || EMPTY_FORM);

  // Sync when editProduct changes
  React.useEffect(() => {
    setForm(editProduct || EMPTY_FORM);
  }, [editProduct, visible]);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const toggleSize = (s) => {
    setForm(f => ({
      ...f,
      sizes: f.sizes.includes(s) ? f.sizes.filter(x => x !== s) : [...f.sizes, s],
    }));
  };

  const handleSave = () => {
    if (!form.name.trim())        return Alert.alert('Validation', 'Product name is required.');
    if (!form.brand.trim())       return Alert.alert('Validation', 'Brand is required.');
    if (!form.price || isNaN(Number(form.price))) return Alert.alert('Validation', 'Valid price is required.');
    if (!form.description.trim()) return Alert.alert('Validation', 'Description is required.');
    if (form.sizes.length === 0)  return Alert.alert('Validation', 'Select at least one size.');

    const payload = {
      ...form,
      price:    Number(form.price),
      oldPrice: form.oldPrice ? Number(form.oldPrice) : null,
      discount: form.isSale && form.discount ? form.discount : null,
      colors:   ['#C9967A', '#1A1A1A', '#FFFFFF'],
    };
    onSave(payload);
    onClose();
  };

  const availableSizes = DEFAULT_SIZES[form.category] || ['S', 'M', 'L'];

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <KeyboardAvoidingView
          style={{ flex: 1, justifyContent: 'flex-end' }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={{
            backgroundColor: C.card,
            borderTopLeftRadius: 24, borderTopRightRadius: 24,
            maxHeight: '95%',
          }}>
            {/* Modal Header */}
            <View style={{
              flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
              paddingHorizontal: 20, paddingTop: 20, paddingBottom: 14,
              borderBottomWidth: 1, borderBottomColor: C.border,
            }}>
              <Text style={{ fontSize: 18, fontWeight: '800', color: C.textPrimary }}>
                {editProduct ? '✏️ Edit Product' : '➕ Add Product'}
              </Text>
              <TouchableOpacity onPress={onClose}>
                <Text style={{ fontSize: 22, color: C.textMuted, fontWeight: '700' }}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20 }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Basic Info */}
              <Text style={{ fontSize: 13, fontWeight: '700', color: C.roseGold, marginBottom: 10 }}>BASIC INFO</Text>
              <Field label="Product Name *" value={form.name} onChangeText={v => set('name', v)} placeholder="e.g. Floral Summer Dress" C={C} />
              <Field label="Brand *" value={form.brand} onChangeText={v => set('brand', v)} placeholder="e.g. Zara" C={C} />

              {/* Category */}
              <Text style={{ fontSize: 12, fontWeight: '600', color: C.textSecondary, marginBottom: 8 }}>Category *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {CATEGORIES.map(cat => (
                    <TouchableOpacity
                      key={cat}
                      onPress={() => {
                        set('category', cat);
                        set('sizes', DEFAULT_SIZES[cat]?.slice(0, 3) || ['S', 'M', 'L']);
                      }}
                      style={{
                        paddingHorizontal: 16, paddingVertical: 8,
                        borderRadius: 20,
                        backgroundColor: form.category === cat ? C.roseGold : C.inputBg,
                        borderWidth: 1, borderColor: form.category === cat ? C.roseGold : C.border,
                      }}
                    >
                      <Text style={{ fontSize: 13, fontWeight: '600', color: form.category === cat ? '#FFF' : C.textSecondary }}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              {/* Pricing */}
              <Text style={{ fontSize: 13, fontWeight: '700', color: C.roseGold, marginBottom: 10 }}>PRICING</Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Field label="Price (PKR) *" value={form.price.toString()} onChangeText={v => set('price', v)} keyboardType="numeric" placeholder="e.g. 3500" C={C} />
                </View>
                <View style={{ flex: 1 }}>
                  <Field label="Old Price (PKR)" value={form.oldPrice?.toString() || ''} onChangeText={v => set('oldPrice', v)} keyboardType="numeric" placeholder="e.g. 5000" C={C} />
                </View>
              </View>

              {/* Sale Toggle */}
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <Text style={{ fontSize: 14, color: C.textPrimary, fontWeight: '500' }}>Mark as Sale</Text>
                <Switch
                  value={form.isSale}
                  onValueChange={v => set('isSale', v)}
                  trackColor={{ false: C.border, true: C.roseGold }}
                  thumbColor="#FFF"
                />
              </View>

              {form.isSale && (
                <Field label="Discount Label" value={form.discount || ''} onChangeText={v => set('discount', v)} placeholder="e.g. 30% OFF" C={C} />
              )}

              {/* Stock Toggle */}
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <Text style={{ fontSize: 14, color: C.textPrimary, fontWeight: '500' }}>In Stock</Text>
                <Switch
                  value={form.inStock}
                  onValueChange={v => set('inStock', v)}
                  trackColor={{ false: C.border, true: C.success }}
                  thumbColor="#FFF"
                />
              </View>

              {/* Sizes */}
              <Text style={{ fontSize: 13, fontWeight: '700', color: C.roseGold, marginBottom: 10 }}>SIZES</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                {availableSizes.map(s => (
                  <TouchableOpacity
                    key={s}
                    onPress={() => toggleSize(s)}
                    style={{
                      paddingHorizontal: 16, paddingVertical: 8,
                      borderRadius: 20,
                      backgroundColor: form.sizes.includes(s) ? C.roseGold : C.inputBg,
                      borderWidth: 1, borderColor: form.sizes.includes(s) ? C.roseGold : C.border,
                    }}
                  >
                    <Text style={{ fontSize: 13, fontWeight: '600', color: form.sizes.includes(s) ? '#FFF' : C.textSecondary }}>
                      {s}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Image & Description */}
              <Text style={{ fontSize: 13, fontWeight: '700', color: C.roseGold, marginBottom: 10 }}>DETAILS</Text>
              <Field label="Image URL" value={form.image} onChangeText={v => set('image', v)} placeholder="https://..." C={C} />
              <Field label="Description *" value={form.description} onChangeText={v => set('description', v)} placeholder="Describe the product..." multiline C={C} />

              {/* Save Button */}
              <TouchableOpacity
                style={{
                  backgroundColor: C.roseGold, borderRadius: 14,
                  height: 52, alignItems: 'center', justifyContent: 'center',
                  marginTop: 8,
                  shadowColor: C.roseGold, shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
                }}
                onPress={handleSave}
              >
                <Text style={{ color: '#FFF', fontSize: 15, fontWeight: '700' }}>
                  {editProduct ? '💾 Save Changes' : '✅ Add Product'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

// ── Product Row Card ─────────────────────────────────────────
const ProductRow = ({ item, onEdit, onDelete, onToggleStock, onToggleSale, C }) => (
  <View style={{
    backgroundColor: C.card, borderRadius: 14,
    borderWidth: 1, borderColor: C.border,
    padding: 14, marginBottom: 10,
  }}>
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
      <View style={{ flex: 1, marginRight: 10 }}>
        <Text style={{ fontSize: 14, fontWeight: '700', color: C.textPrimary, marginBottom: 2 }} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={{ fontSize: 12, color: C.textMuted, marginBottom: 6 }}>
          {item.brand} · {item.category}
        </Text>
        <Text style={{ fontSize: 15, fontWeight: '800', color: C.roseGold }}>
          PKR {item.price.toLocaleString()}
        </Text>
      </View>

      {/* Edit & Delete */}
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <TouchableOpacity
          onPress={() => onEdit(item)}
          style={{
            backgroundColor: C.blush, borderRadius: 10,
            paddingHorizontal: 12, paddingVertical: 8,
            borderWidth: 1, borderColor: C.border,
          }}
        >
          <Text style={{ fontSize: 13, fontWeight: '700', color: C.roseGoldDark }}>✏️ Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onDelete(item.id, item.name)}
          style={{
            backgroundColor: C.dangerBg, borderRadius: 10,
            paddingHorizontal: 12, paddingVertical: 8,
            borderWidth: 1, borderColor: C.danger,
          }}
        >
          <Text style={{ fontSize: 13, fontWeight: '700', color: C.danger }}>🗑</Text>
        </TouchableOpacity>
      </View>
    </View>

    {/* Badges + Toggles */}
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <View style={{
          backgroundColor: item.inStock ? C.successBg : C.dangerBg,
          borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4,
        }}>
          <Text style={{ fontSize: 11, fontWeight: '700', color: item.inStock ? C.success : C.danger }}>
            {item.inStock ? '✅ In Stock' : '❌ Out of Stock'}
          </Text>
        </View>
        {item.isSale && (
          <View style={{ backgroundColor: C.warningBg, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: C.warning }}>🏷️ On Sale</Text>
          </View>
        )}
      </View>

      {/* Quick Toggles */}
      <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
        <TouchableOpacity
          onPress={() => onToggleStock(item.id)}
          style={{
            paddingHorizontal: 10, paddingVertical: 5,
            borderRadius: 8, borderWidth: 1, borderColor: C.border,
            backgroundColor: C.inputBg,
          }}
        >
          <Text style={{ fontSize: 11, color: C.textSecondary, fontWeight: '600' }}>
            {item.inStock ? 'Mark OOS' : 'Mark In Stock'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onToggleSale(item.id)}
          style={{
            paddingHorizontal: 10, paddingVertical: 5,
            borderRadius: 8, borderWidth: 1, borderColor: C.border,
            backgroundColor: C.inputBg,
          }}
        >
          <Text style={{ fontSize: 11, color: C.textSecondary, fontWeight: '600' }}>
            {item.isSale ? 'Remove Sale' : 'Add Sale'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

// ── Main Screen ──────────────────────────────────────────────
export default function ManageProducts({ navigation }) {
  const { isDark } = useTheme();
  const C = isDark ? DARK : LIGHT;
  const { products, addProduct, updateProduct, deleteProduct, toggleStock, toggleSale } = useProducts();

  const [showModal, setShowModal]       = useState(false);
  const [editProduct, setEditProduct]   = useState(null);
  const [search, setSearch]             = useState('');
  const [filterCat, setFilterCat]       = useState('All');

  const openAdd = () => { setEditProduct(null); setShowModal(true); };
  const openEdit = (product) => {
    setEditProduct({
      ...product,
      price:    product.price.toString(),
      oldPrice: product.oldPrice?.toString() || '',
      discount: product.discount || '',
    });
    setShowModal(true);
  };

  const handleSave = (payload) => {
    if (editProduct && editProduct.id) {
      updateProduct(editProduct.id, payload);
    } else {
      addProduct(payload);
    }
  };

  const handleDelete = (id, name) => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete "${name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteProduct(id) },
      ]
    );
  };

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  const filtered = products.filter(p => {
    const matchSearch = !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === 'All' || p.category === filterCat;
    return matchSearch && matchCat;
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={C.bg} />

      {/* Header */}
      <View style={{
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingTop: 10, paddingBottom: 12,
        backgroundColor: C.card,
        borderBottomWidth: 1, borderBottomColor: C.border,
      }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 6 }}>
          <Text style={{ fontSize: 22, color: C.textPrimary }}>←</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 17, fontWeight: '800', color: C.roseGoldDark }}>
          Manage Products
        </Text>
        <TouchableOpacity
          onPress={openAdd}
          style={{
            backgroundColor: C.roseGold, borderRadius: 10,
            paddingHorizontal: 14, paddingVertical: 8,
          }}
        >
          <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 13 }}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={{
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: C.card,
        borderWidth: 1, borderColor: C.border,
        borderRadius: 12, marginHorizontal: 16, marginTop: 12,
        paddingHorizontal: 12, height: 44,
      }}>
        <Text style={{ fontSize: 15, marginRight: 8 }}>🔍</Text>
        <TextInput
          style={{ flex: 1, fontSize: 14, color: C.textPrimary }}
          placeholder="Search products..."
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

      {/* Category Filter */}
      <ScrollView
        horizontal showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingVertical: 10 }}
      >
        {categories.map(cat => (
          <TouchableOpacity
            key={cat}
            onPress={() => setFilterCat(cat)}
            style={{
              paddingHorizontal: 16, paddingVertical: 7,
              borderRadius: 20,
              backgroundColor: filterCat === cat ? C.roseGold : C.card,
              borderWidth: 1, borderColor: filterCat === cat ? C.roseGold : C.border,
            }}
          >
            <Text style={{
              fontSize: 13, fontWeight: '600',
              color: filterCat === cat ? '#FFF' : C.textSecondary,
            }}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Count */}
      <Text style={{ marginHorizontal: 16, marginBottom: 6, fontSize: 13, color: C.textMuted }}>
        {filtered.length} product{filtered.length !== 1 ? 's' : ''}
      </Text>

      {/* Product List */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <ProductRow
            item={item}
            onEdit={openEdit}
            onDelete={handleDelete}
            onToggleStock={toggleStock}
            onToggleSale={toggleSale}
            C={C}
          />
        )}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 60 }}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>📦</Text>
            <Text style={{ fontSize: 16, fontWeight: '700', color: C.textPrimary }}>No products found</Text>
            <Text style={{ fontSize: 13, color: C.textMuted, marginTop: 4 }}>Add your first product above</Text>
          </View>
        }
      />

      {/* Add / Edit Modal */}
      <ProductFormModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSave}
        editProduct={editProduct}
        C={C}
      />
    </SafeAreaView>
  );
}