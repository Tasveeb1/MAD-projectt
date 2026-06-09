// CheckoutScreen_fixed.jsx
// FIXES:
// 1. AsyncStorage import at top (not require() inside function)
// 2. Address auto-saved to savedAddresses on order placement
// 3. all_user_uids update is reliable now

import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  TextInput, SafeAreaView, StatusBar,
  Animated, Modal, KeyboardAvoidingView, Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // ✅ FIX 1: top-level import
import { getAuth } from 'firebase/auth';
import { useTheme } from '../../context/ThemeContext';
import {
  getOrders, saveOrder,
  getAddresses, addAddress,
} from '../../utils/storage';

const STEPS = ['Address', 'Payment', 'Review'];

// ─────────────────────────────────────────────────────────────
// StepBar
// ─────────────────────────────────────────────────────────────
function StepBar({ current, theme }) {
  return (
    <View style={{
      flexDirection: 'row', alignItems: 'center',
      paddingHorizontal: 24, paddingVertical: 16,
      borderBottomWidth: 1, borderBottomColor: theme.border,
      backgroundColor: theme.card,
    }}>
      {STEPS.map((label, i) => {
        const done   = i < current;
        const active = i === current;
        return (
          <React.Fragment key={label}>
            <View style={{ alignItems: 'center', gap: 4 }}>
              <View style={{
                width: 32, height: 32, borderRadius: 16,
                borderWidth: 1.5,
                borderColor: done ? '#2D9E75' : active ? theme.primary : theme.border,
                alignItems: 'center', justifyContent: 'center',
                backgroundColor: done ? '#2D9E75' : active ? theme.primary : theme.card,
              }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: (done || active) ? '#fff' : theme.subtext }}>
                  {done ? '✓' : i + 1}
                </Text>
              </View>
              <Text style={{
                fontSize: 11,
                fontWeight: active ? '700' : '500',
                color: active ? theme.primary : theme.subtext,
              }}>
                {label}
              </Text>
            </View>
            {i < STEPS.length - 1 && (
              <View style={{
                flex: 1, height: 1.5, marginBottom: 16, marginHorizontal: 4,
                backgroundColor: done ? '#2D9E75' : theme.border,
              }} />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

function PaymentOption({ icon, title, subtitle, selected, onPress, theme }) {
  return (
    <TouchableOpacity
      style={{
        flexDirection: 'row', alignItems: 'center',
        borderWidth: 1.5,
        borderColor: selected ? theme.primary : theme.border,
        borderRadius: 14, padding: 14, marginBottom: 10,
        backgroundColor: selected ? theme.blush : theme.card,
        gap: 12,
      }}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Text style={{ fontSize: 24 }}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: '600', color: selected ? theme.primary : theme.text }}>
          {title}
        </Text>
        <Text style={{ fontSize: 11, color: theme.subtext, marginTop: 2 }}>{subtitle}</Text>
      </View>
      <View style={{
        width: 20, height: 20, borderRadius: 10,
        borderWidth: 2, borderColor: selected ? theme.primary : theme.border,
        alignItems: 'center', justifyContent: 'center',
      }}>
        {selected && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: theme.primary }} />}
      </View>
    </TouchableOpacity>
  );
}

function SuccessModal({ visible, orderId, onHome, theme }) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (visible)
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 60, friction: 10 }).start();
  }, [visible]);

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
        <Animated.View style={{
          backgroundColor: theme.card, borderRadius: 24, padding: 28,
          alignItems: 'center', width: '100%',
          borderWidth: 1, borderColor: theme.border,
          transform: [{ scale: scaleAnim }],
        }}>
          <View style={{
            width: 80, height: 80, borderRadius: 40,
            backgroundColor: theme.blush,
            alignItems: 'center', justifyContent: 'center', marginBottom: 16,
          }}>
            <Text style={{ fontSize: 40 }}>🎉</Text>
          </View>
          <Text style={{ fontSize: 24, fontWeight: '800', color: theme.primary, marginBottom: 6 }}>Order Placed!</Text>
          <Text style={{ fontSize: 14, color: theme.subtext, marginBottom: 20 }}>Your order has been confirmed</Text>
          <View style={{
            backgroundColor: theme.blush, borderRadius: 12,
            paddingHorizontal: 24, paddingVertical: 12, alignItems: 'center',
            marginBottom: 16, borderWidth: 1, borderColor: theme.border,
          }}>
            <Text style={{ fontSize: 11, color: theme.subtext, marginBottom: 4 }}>Order ID</Text>
            <Text style={{ fontSize: 22, fontWeight: '800', color: theme.primary, letterSpacing: 2 }}>#{orderId}</Text>
          </View>
          <Text style={{ fontSize: 13, color: theme.subtext, textAlign: 'center', lineHeight: 20, marginBottom: 24 }}>
            You will receive a confirmation shortly.{'\n'}Thank you for shopping with us! 💕
          </Text>
          <TouchableOpacity
            style={{ width: '100%', height: 52, borderRadius: 16, backgroundColor: theme.primary, alignItems: 'center', justifyContent: 'center' }}
            onPress={onHome}
          >
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>Back to Home</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

function AddressStep({
  theme, uid,
  fullName, setFullName, phone, setPhone,
  address, setAddress, city, setCity, area, setArea,
  phoneRef, addressRef, cityRef, areaRef,
}) {
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [showSaved, setShowSaved]           = useState(false);

  useEffect(() => {
    if (uid) getAddresses(uid).then(setSavedAddresses);
  }, [uid]);

  const fillFromSaved = (a) => {
    setFullName(a.label);
    setPhone(a.phone || '');
    setAddress(a.address);
    setCity(a.city || '');
    setArea(a.area || '');
    setShowSaved(false);
  };

  const inp = {
    height: 48, backgroundColor: theme.inputBg,
    borderWidth: 1, borderColor: theme.border,
    borderRadius: 12, paddingHorizontal: 14,
    fontSize: 14, color: theme.text,
  };
  const lbl = { fontSize: 12, fontWeight: '600', color: theme.subtext, marginBottom: 6 };

  return (
    <View>
      <Text style={{ fontSize: 20, fontWeight: '700', color: theme.primary, marginBottom: 18 }}>
        Delivery Address
      </Text>

      {savedAddresses.length > 0 && (
        <View style={{ marginBottom: 16 }}>
          <TouchableOpacity
            onPress={() => setShowSaved(s => !s)}
            style={{
              flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
              backgroundColor: theme.blush, borderRadius: 12, padding: 12,
              borderWidth: 1, borderColor: theme.border,
            }}
          >
            <Text style={{ fontSize: 13, color: theme.primary, fontWeight: '600' }}>
              📍 Use a Saved Address ({savedAddresses.length})
            </Text>
            <Text style={{ color: theme.subtext }}>{showSaved ? '∧' : '∨'}</Text>
          </TouchableOpacity>

          {showSaved && savedAddresses.map(a => (
            <TouchableOpacity
              key={a.id}
              onPress={() => fillFromSaved(a)}
              style={{
                backgroundColor: theme.card, borderRadius: 10, padding: 12,
                borderWidth: 1, borderColor: a.default ? theme.primary : theme.border,
                marginTop: 6,
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: '700', color: theme.text }}>{a.label}</Text>
              <Text style={{ fontSize: 12, color: theme.subtext, marginTop: 2 }}>{a.address}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={{ marginBottom: 14 }}>
        <Text style={lbl}>Full Name *</Text>
        <TextInput
          style={inp} value={fullName} onChangeText={setFullName}
          placeholder="e.g. Ayesha Khan" placeholderTextColor={theme.subtext}
          returnKeyType="next" blurOnSubmit={false}
          onSubmitEditing={() => phoneRef.current?.focus()}
        />
      </View>

      <View style={{ marginBottom: 14 }}>
        <Text style={lbl}>Phone Number *</Text>
        <TextInput
          ref={phoneRef} style={inp} value={phone} onChangeText={setPhone}
          placeholder="03XX-XXXXXXX" placeholderTextColor={theme.subtext}
          keyboardType="phone-pad" maxLength={13}
          returnKeyType="next" blurOnSubmit={false}
          onSubmitEditing={() => addressRef.current?.focus()}
        />
      </View>

      <View style={{ marginBottom: 14 }}>
        <Text style={lbl}>Street Address *</Text>
        <TextInput
          ref={addressRef} style={inp} value={address} onChangeText={setAddress}
          placeholder="House no, Street, Block..." placeholderTextColor={theme.subtext}
          returnKeyType="next" blurOnSubmit={false}
          onSubmitEditing={() => cityRef.current?.focus()}
        />
      </View>

      <View style={{ marginBottom: 14 }}>
        <Text style={lbl}>City *</Text>
        <TextInput
          ref={cityRef} style={inp} value={city} onChangeText={setCity}
          placeholder="e.g. Rawalpindi" placeholderTextColor={theme.subtext}
          returnKeyType="next" blurOnSubmit={false}
          onSubmitEditing={() => areaRef.current?.focus()}
        />
      </View>

      <View style={{ marginBottom: 14 }}>
        <Text style={lbl}>Area / Sector</Text>
        <TextInput
          ref={areaRef} style={inp} value={area} onChangeText={setArea}
          placeholder="e.g. Bahria Town, Phase 1" placeholderTextColor={theme.subtext}
          returnKeyType="done" blurOnSubmit
        />
      </View>

      <View style={{ backgroundColor: theme.blush, borderRadius: 10, padding: 12 }}>
        <Text style={{ fontSize: 12, color: theme.subtext }}>
          💡 Your address will be saved automatically after placing the order.
        </Text>
      </View>
    </View>
  );
}

function PaymentStep({
  theme, payMethod, setPayMethod,
  cardNumber, setCardNumber, cardName, setCardName,
  expiry, setExpiry, cvv, setCvv,
  cardNameRef, expiryRef, cvvRef,
}) {
  const inp = {
    height: 48, backgroundColor: theme.inputBg,
    borderWidth: 1, borderColor: theme.border,
    borderRadius: 12, paddingHorizontal: 14,
    fontSize: 14, color: theme.text,
  };
  const lbl = { fontSize: 12, fontWeight: '600', color: theme.subtext, marginBottom: 6 };

  return (
    <View>
      <Text style={{ fontSize: 20, fontWeight: '700', color: theme.primary, marginBottom: 18 }}>
        Payment Method
      </Text>

      <PaymentOption theme={theme} icon="💵" title="Cash on Delivery"     subtitle="Pay when your order arrives"    selected={payMethod === 'cod'}    onPress={() => setPayMethod('cod')} />
      <PaymentOption theme={theme} icon="💳" title="Credit / Debit Card"  subtitle="Visa, Mastercard, UnionPay"     selected={payMethod === 'card'}   onPress={() => setPayMethod('card')} />
      <PaymentOption theme={theme} icon="📱" title="JazzCash / EasyPaisa" subtitle="Mobile wallet payment"          selected={payMethod === 'wallet'} onPress={() => setPayMethod('wallet')} />

      {payMethod === 'card' && (
        <View style={{ backgroundColor: theme.blush, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: theme.border, marginTop: 4 }}>
          <Text style={{ fontSize: 13, fontWeight: '700', color: theme.primary, marginBottom: 12 }}>Card Details</Text>

          <View style={{ marginBottom: 12 }}>
            <Text style={lbl}>Card Number</Text>
            <TextInput
              style={inp} value={cardNumber}
              onChangeText={txt => {
                const c = txt.replace(/\D/g, '').slice(0, 16);
                setCardNumber(c.replace(/(.{4})/g, '$1 ').trim());
              }}
              placeholder="XXXX XXXX XXXX XXXX" placeholderTextColor={theme.subtext}
              keyboardType="number-pad" maxLength={19}
              returnKeyType="next" blurOnSubmit={false}
              onSubmitEditing={() => cardNameRef.current?.focus()}
            />
          </View>

          <View style={{ marginBottom: 12 }}>
            <Text style={lbl}>Cardholder Name</Text>
            <TextInput
              ref={cardNameRef} style={inp} value={cardName} onChangeText={setCardName}
              placeholder="Name on card" placeholderTextColor={theme.subtext}
              returnKeyType="next" blurOnSubmit={false}
              onSubmitEditing={() => expiryRef.current?.focus()}
            />
          </View>

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={lbl}>Expiry</Text>
              <TextInput
                ref={expiryRef} style={inp} value={expiry}
                onChangeText={txt => {
                  const c = txt.replace(/\D/g, '').slice(0, 4);
                  setExpiry(c.length > 2 ? `${c.slice(0, 2)}/${c.slice(2)}` : c);
                }}
                placeholder="MM/YY" placeholderTextColor={theme.subtext}
                keyboardType="number-pad" maxLength={5}
                returnKeyType="next" blurOnSubmit={false}
                onSubmitEditing={() => cvvRef.current?.focus()}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={lbl}>CVV</Text>
              <TextInput
                ref={cvvRef} style={inp} value={cvv} onChangeText={setCvv}
                placeholder="123" placeholderTextColor={theme.subtext}
                keyboardType="number-pad" maxLength={3}
                returnKeyType="done" blurOnSubmit secureTextEntry
              />
            </View>
          </View>
        </View>
      )}

      {payMethod === 'wallet' && (
        <View style={{ backgroundColor: theme.blush, borderRadius: 12, padding: 14, marginTop: 8, borderWidth: 1, borderColor: theme.border }}>
          <Text style={{ fontSize: 13, color: theme.subtext, lineHeight: 20 }}>
            📲 After placing your order, you will receive a payment request on your mobile wallet.
          </Text>
        </View>
      )}
    </View>
  );
}

function ReviewStep({
  theme, setStep,
  fullName, phone, address, area, city,
  payMethod, cardNumber,
  subtotal, delivery, discount, total, appliedPromo,
  cartItems,
}) {
  return (
    <View>
      <Text style={{ fontSize: 20, fontWeight: '700', color: theme.primary, marginBottom: 18 }}>
        Review Order
      </Text>

      <View style={{ backgroundColor: theme.card, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: theme.border, marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text style={{ fontSize: 13, fontWeight: '700', color: theme.primary }}>📍 Delivery Address</Text>
          <TouchableOpacity onPress={() => setStep(0)}>
            <Text style={{ fontSize: 12, color: theme.primary, fontWeight: '600' }}>Edit</Text>
          </TouchableOpacity>
        </View>
        <Text style={{ fontSize: 13, color: theme.subtext, lineHeight: 22 }}>
          {fullName}{'\n'}{phone}{'\n'}{address}{area ? `, ${area}` : ''}{'\n'}{city}
        </Text>
      </View>

      <View style={{ backgroundColor: theme.card, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: theme.border, marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text style={{ fontSize: 13, fontWeight: '700', color: theme.primary }}>
            {payMethod === 'cod' ? '💵' : payMethod === 'card' ? '💳' : '📱'} Payment
          </Text>
          <TouchableOpacity onPress={() => setStep(1)}>
            <Text style={{ fontSize: 12, color: theme.primary, fontWeight: '600' }}>Edit</Text>
          </TouchableOpacity>
        </View>
        <Text style={{ fontSize: 13, color: theme.subtext }}>
          {payMethod === 'cod' ? 'Cash on Delivery' : payMethod === 'card' ? `Card ending in ${cardNumber.slice(-4)}` : 'JazzCash / EasyPaisa'}
        </Text>
      </View>

      {cartItems.length > 0 && (
        <View style={{ backgroundColor: theme.card, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: theme.border, marginBottom: 12 }}>
          <Text style={{ fontSize: 13, fontWeight: '700', color: theme.primary, marginBottom: 10 }}>
            🛍 Items ({cartItems.length})
          </Text>
          {cartItems.map((item, i) => (
            <View key={i} style={{
              flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6,
              borderBottomWidth: i < cartItems.length - 1 ? 1 : 0, borderBottomColor: theme.border,
            }}>
              <Text style={{ fontSize: 13, color: theme.text, flex: 1 }} numberOfLines={1}>
                {item.name}{item.qty > 1 ? ` ×${item.qty}` : ''}
              </Text>
              <Text style={{ fontSize: 13, fontWeight: '600', color: theme.primary }}>{item.price}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={{ backgroundColor: theme.card, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: theme.border, marginBottom: 12 }}>
        <Text style={{ fontSize: 13, fontWeight: '700', color: theme.primary, marginBottom: 10 }}>🧾 Price Breakdown</Text>
        {[
          { label: 'Subtotal', value: `PKR ${subtotal.toLocaleString()}`, color: theme.text },
          { label: 'Delivery', value: delivery === 0 ? 'FREE' : `PKR ${delivery.toLocaleString()}`, color: delivery === 0 ? '#2D9E75' : theme.text },
        ].map(r => (
          <View key={r.label} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 }}>
            <Text style={{ fontSize: 13, color: theme.subtext }}>{r.label}</Text>
            <Text style={{ fontSize: 13, fontWeight: '600', color: r.color }}>{r.value}</Text>
          </View>
        ))}
        {discount > 0 && (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 }}>
            <Text style={{ fontSize: 13, color: '#2D9E75' }}>Promo {appliedPromo ? `(${appliedPromo})` : ''}</Text>
            <Text style={{ fontSize: 13, fontWeight: '600', color: '#2D9E75' }}>− PKR {discount.toLocaleString()}</Text>
          </View>
        )}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, marginTop: 6, borderTopWidth: 1, borderTopColor: theme.border }}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: theme.text }}>Total</Text>
          <Text style={{ fontSize: 17, fontWeight: '800', color: theme.primary }}>PKR {total.toLocaleString()}</Text>
        </View>
      </View>

      <Text style={{ fontSize: 11, color: theme.subtext, textAlign: 'center', lineHeight: 16 }}>
        By placing this order you agree to our Terms & Conditions and Return Policy.
      </Text>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN CheckoutScreen
// ─────────────────────────────────────────────────────────────
export default function CheckoutScreen({ navigation, route }) {
  const { theme, isDark } = useTheme();
  const {
    subtotal = 0, delivery = 250,
    discount = 0, total = 0,
    appliedPromo = null,
    cartItems = [],
  } = route?.params || {};

  const [step, setStep]               = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [orderId]                     = useState(() => Math.floor(100000 + Math.random() * 900000).toString());

  const [fullName, setFullName] = useState('');
  const [phone, setPhone]       = useState('');
  const [address, setAddress]   = useState('');
  const [city, setCity]         = useState('');
  const [area, setArea]         = useState('');

  const [payMethod, setPayMethod]   = useState('cod');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName]     = useState('');
  const [expiry, setExpiry]         = useState('');
  const [cvv, setCvv]               = useState('');

  const phoneRef    = useRef(); const addressRef = useRef();
  const cityRef     = useRef(); const areaRef    = useRef();
  const cardNameRef = useRef(); const expiryRef  = useRef();
  const cvvRef      = useRef();

  const slideAnim = useRef(new Animated.Value(0)).current;

  const animateStep = (dir) => {
    Animated.sequence([
      Animated.timing(slideAnim, { toValue: dir * -30, duration: 120, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 180, useNativeDriver: true }),
    ]).start();
  };

  const isNextEnabled = () => {
    if (step === 0) return fullName.trim() && phone.trim() && address.trim() && city.trim();
    if (step === 1 && payMethod === 'card')
      return cardNumber.length === 19 && cardName.trim() && expiry.length === 5 && cvv.length === 3;
    return true;
  };

  const goBack = () => {
    if (step > 0) { animateStep(-1); setStep(s => s - 1); }
    else navigation.goBack();
  };

  const goNext = () => {
    if (step < 2) { animateStep(1); setStep(s => s + 1); }
    else placeOrder();
  };

  // ✅ FIX 2 & 3: Proper AsyncStorage + address auto-save
  const placeOrder = async () => {
    try {
      const uid = getAuth().currentUser?.uid;
      if (uid) {
        const newOrder = {
          orderId,
          items: cartItems,
          subtotal, delivery, discount, total,
          payMethod,
          address: { fullName, phone, address, area, city },
          placedAt: new Date().toISOString(),
          date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
          status: 'Placed',
        };

        // Save order
        await saveOrder(uid, newOrder);

        // ✅ FIX 3: Auto-save address to savedAddresses
        // Check if this address already exists to avoid duplicates
        const existingAddresses = await getAddresses(uid);
        const alreadyExists = existingAddresses.some(
          a => a.address === address.trim() && a.phone === phone.trim()
        );
        if (!alreadyExists) {
          await addAddress(uid, {
            label: fullName.trim(),   // use full name as label
            address: `${address.trim()}${area ? ', ' + area.trim() : ''}, ${city.trim()}`,
            phone: phone.trim(),
          });
        }

        // ✅ FIX 2: Use top-level AsyncStorage (no require())
        const raw  = await AsyncStorage.getItem('all_user_uids');
        const uids = raw ? JSON.parse(raw) : [];
        if (!uids.includes(uid)) {
          await AsyncStorage.setItem('all_user_uids', JSON.stringify([...uids, uid]));
        }
      }
    } catch (e) {
      console.log('placeOrder error:', e);
    }
    setShowSuccess(true);
  };

  const t = theme;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={t.bg} />

      <View style={{
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 16, paddingTop: 8, paddingBottom: 10,
        backgroundColor: t.card, borderBottomWidth: 1, borderBottomColor: t.border,
      }}>
        <TouchableOpacity onPress={goBack} style={{ padding: 6, width: 36 }}>
          <Text style={{ fontSize: 22, color: t.text }}>←</Text>
        </TouchableOpacity>
        <Text style={{ flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: t.primary }}>
          Checkout
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <StepBar current={step} theme={t} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 140 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        >
          <Animated.View style={{ transform: [{ translateX: slideAnim }] }}>
            {step === 0 && (
              <AddressStep
                theme={t} uid={getAuth().currentUser?.uid}
                fullName={fullName} setFullName={setFullName}
                phone={phone}       setPhone={setPhone}
                address={address}   setAddress={setAddress}
                city={city}         setCity={setCity}
                area={area}         setArea={setArea}
                phoneRef={phoneRef} addressRef={addressRef}
                cityRef={cityRef}   areaRef={areaRef}
              />
            )}
            {step === 1 && (
              <PaymentStep
                theme={t}
                payMethod={payMethod}   setPayMethod={setPayMethod}
                cardNumber={cardNumber} setCardNumber={setCardNumber}
                cardName={cardName}     setCardName={setCardName}
                expiry={expiry}         setExpiry={setExpiry}
                cvv={cvv}               setCvv={setCvv}
                cardNameRef={cardNameRef} expiryRef={expiryRef} cvvRef={cvvRef}
              />
            )}
            {step === 2 && (
              <ReviewStep
                theme={t} setStep={setStep}
                fullName={fullName} phone={phone} address={address} area={area} city={city}
                payMethod={payMethod} cardNumber={cardNumber}
                subtotal={subtotal} delivery={delivery} discount={discount} total={total}
                appliedPromo={appliedPromo} cartItems={cartItems}
              />
            )}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: t.card, borderTopWidth: 1, borderTopColor: t.border,
        paddingHorizontal: 16, paddingVertical: 12,
        paddingBottom: Platform.OS === 'ios' ? 28 : 16,
        gap: 12,
      }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 11, color: t.subtext }}>Step {step + 1} of 3</Text>
          <Text style={{ fontSize: 17, fontWeight: '800', color: t.primary }}>PKR {total.toLocaleString()}</Text>
        </View>
        <TouchableOpacity
          style={{
            flex: 1.6, height: 52, borderRadius: 16,
            backgroundColor: isNextEnabled() ? t.primary : t.border,
            alignItems: 'center', justifyContent: 'center',
          }}
          onPress={goNext}
          disabled={!isNextEnabled()}
        >
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>
            {step === 2 ? '🛍 Place Order' : 'Continue →'}
          </Text>
        </TouchableOpacity>
      </View>

      <SuccessModal
        visible={showSuccess} orderId={orderId} theme={t}
        onHome={() => { setShowSuccess(false); navigation.navigate('Home'); }}
      />
    </SafeAreaView>
  );
}