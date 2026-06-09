import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

const COLORS = {
  white: '#FFFFFF',
  background: '#FFFFFF',
  blush: '#FDECEA',
  inputBg: '#FDF0EE',
  border: '#F2D4D0',
  roseGold: '#C9967A',
  roseGoldDark: '#A87060',
  roseGoldLight: '#E8C4B8',
  cardBg: '#F7E8E4',
  textPrimary: '#1A1A1A',
  textSecondary: '#8A7B78',
  textMuted: '#BFB0AE',
  success: '#2D9E75',
  danger: '#E24B4A',
};

/**
 * ProductCard
 *
 * Props:
 * - item: { id, name, brand, price, oldPrice, rating, reviews, emoji, discount, inStock }
 * - onPress: () => void
 * - onAddToCart: (item) => void
 * - onToggleWishlist: (id) => void
 * - isWishlisted: bool
 * - size: 'grid' | 'list'  (default: 'grid')
 */
export default function ProductCard({
  item,
  onPress,
  onAddToCart,
  onToggleWishlist,
  isWishlisted = false,
  size = 'grid',
}) {
  if (size === 'list') {
    return (
      <TouchableOpacity style={styles.listCard} onPress={onPress} activeOpacity={0.85}>
        {/* Image Box */}
        <View style={styles.listImageBox}>
          <Text style={styles.listEmoji}>{item.emoji}</Text>
          {item.discount ? (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{item.discount}</Text>
            </View>
          ) : null}
        </View>

        {/* Info */}
        <View style={styles.listInfo}>
          <Text style={styles.brandText}>{item.brand}</Text>
          <Text style={styles.listName} numberOfLines={2}>{item.name}</Text>

          <View style={styles.ratingRow}>
            <Text style={styles.star}>⭐</Text>
            <Text style={styles.ratingText}>{item.rating}</Text>
            <Text style={styles.reviewText}>({item.reviews})</Text>
          </View>

          <View style={styles.priceRow}>
            {item.oldPrice ? (
              <Text style={styles.oldPrice}>{item.oldPrice}</Text>
            ) : null}
            <Text style={styles.price}>{item.price}</Text>
          </View>

          {item.inStock === false && (
            <Text style={styles.outOfStock}>Out of Stock</Text>
          )}
        </View>

        {/* Right Actions */}
        <View style={styles.listActions}>
          <TouchableOpacity
            style={styles.wishlistBtnList}
            onPress={() => onToggleWishlist?.(item.id)}
          >
            <Text style={{ fontSize: 20 }}>{isWishlisted ? '❤️' : '🤍'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.cartBtnList,
              item.inStock === false && { opacity: 0.4 },
            ]}
            onPress={() => item.inStock !== false && onAddToCart?.(item)}
            disabled={item.inStock === false}
          >
            <Text style={styles.cartBtnListText}>Add</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  }

  // Grid (default)
  return (
    <TouchableOpacity style={styles.gridCard} onPress={onPress} activeOpacity={0.85}>
      {/* Wishlist */}
      <TouchableOpacity
        style={styles.wishlistBtn}
        onPress={() => onToggleWishlist?.(item.id)}
      >
        <Text style={{ fontSize: 18 }}>{isWishlisted ? '❤️' : '🤍'}</Text>
      </TouchableOpacity>

      {/* Discount Badge */}
      {item.discount ? (
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>{item.discount}</Text>
        </View>
      ) : null}

      {/* Image */}
      <View style={styles.gridImageBox}>
        <Text style={styles.gridEmoji}>{item.emoji}</Text>
      </View>

      {/* Info */}
      <View style={styles.gridInfo}>
        <Text style={styles.brandText}>{item.brand}</Text>
        <Text style={styles.gridName} numberOfLines={2}>{item.name}</Text>

        <View style={styles.ratingRow}>
          <Text style={styles.star}>⭐</Text>
          <Text style={styles.ratingText}>{item.rating}</Text>
          <Text style={styles.reviewText}>({item.reviews})</Text>
        </View>

        <View style={styles.priceRow}>
          {item.oldPrice ? (
            <Text style={styles.oldPrice}>{item.oldPrice}</Text>
          ) : null}
          <Text style={styles.price}>{item.price}</Text>
        </View>

        {item.inStock === false ? (
          <View style={styles.outOfStockBtn}>
            <Text style={styles.outOfStockText}>Out of Stock</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.addToCartBtn}
            onPress={() => onAddToCart?.(item)}
          >
            <Text style={styles.addToCartText}>Add to Cart</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

const cardWidth = (width - 52) / 2;

const styles = StyleSheet.create({
  // ── Grid Card ──
  gridCard: {
    width: cardWidth,
    backgroundColor: COLORS.white,
    borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 16, overflow: 'hidden',
    position: 'relative',
  },
  wishlistBtn: {
    position: 'absolute', top: 8, right: 8, zIndex: 2,
  },
  discountBadge: {
    position: 'absolute', top: 8, left: 8, zIndex: 2,
    backgroundColor: COLORS.danger,
    paddingHorizontal: 7, paddingVertical: 3, borderRadius: 7,
  },
  discountText: { color: COLORS.white, fontSize: 9, fontWeight: '800' },
  gridImageBox: {
    height: 130, backgroundColor: COLORS.inputBg,
    alignItems: 'center', justifyContent: 'center',
  },
  gridEmoji: { fontSize: 52 },
  gridInfo: { padding: 10 },
  gridName: {
    fontSize: 13, fontWeight: '600',
    color: COLORS.textPrimary, marginBottom: 4,
  },

  // ── List Card ──
  listCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 16, overflow: 'hidden',
    marginBottom: 10, marginHorizontal: 20,
  },
  listImageBox: {
    width: 100, backgroundColor: COLORS.inputBg,
    alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  listEmoji: { fontSize: 44 },
  listInfo: { flex: 1, padding: 12 },
  listName: {
    fontSize: 14, fontWeight: '600',
    color: COLORS.textPrimary, marginBottom: 4,
  },
  listActions: {
    width: 52, alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12, paddingRight: 8,
  },
  wishlistBtnList: { padding: 4 },
  cartBtnList: {
    backgroundColor: COLORS.roseGold,
    paddingHorizontal: 8, paddingVertical: 6,
    borderRadius: 10,
  },
  cartBtnListText: { color: COLORS.white, fontSize: 11, fontWeight: '700' },
  outOfStockBtn: {
    backgroundColor: '#f0f0f0', borderRadius: 8,
    paddingVertical: 6, alignItems: 'center',
  },
  outOfStockText: { fontSize: 11, fontWeight: '700', color: COLORS.textMuted },
  outOfStock: { fontSize: 11, color: COLORS.danger, fontWeight: '600', marginTop: 4 },

  // ── Shared ──
  brandText: { fontSize: 10, color: COLORS.textMuted, marginBottom: 2 },
  ratingRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: 3, marginBottom: 4,
  },
  star: { fontSize: 10 },
  ratingText: { fontSize: 11, fontWeight: '700', color: COLORS.textPrimary },
  reviewText: { fontSize: 10, color: COLORS.textMuted },
  priceRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: 4, marginBottom: 8,
  },
  oldPrice: {
    fontSize: 10, color: COLORS.textMuted,
    textDecorationLine: 'line-through',
  },
  price: { fontSize: 13, fontWeight: '700', color: COLORS.roseGold },
  addToCartBtn: {
    backgroundColor: COLORS.blush,
    borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 8, paddingVertical: 6, alignItems: 'center',
  },
  addToCartText: { fontSize: 11, fontWeight: '700', color: COLORS.roseGoldDark },
});