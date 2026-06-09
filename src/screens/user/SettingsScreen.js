import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Switch, Alert, Linking, Image,
  TextInput, Modal, Animated, Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { logoutUser } from '../../firebase/authService';
import {
  getOrders,
  getAddresses, addAddress, deleteAddress, setDefaultAddress,
} from '../../utils/storage';

// ─── Orders Section ───────────────────────────────────────────
function OrdersSection({ theme, userId }) {
  const [expanded, setExpanded] = useState(false);
  const [orders, setOrders]     = useState([]);

  // Load on mount when userId is ready
  useEffect(() => {
    if (!userId) return;
    getOrders(userId).then(setOrders);
  }, [userId]);

  // Reload every time section is opened
  useEffect(() => {
    if (!userId || !expanded) return;
    getOrders(userId).then(setOrders);
  }, [expanded]);

  const statusColor = (s) => {
    if (s === 'Delivered')  return '#2D9E75';
    if (s === 'In Transit') return '#F59E0B';
    if (s === 'Cancelled')  return '#E24B4A';
    return theme.primary;
  };

  return (
    <View>
      <TouchableOpacity
        style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 }}
        onPress={() => setExpanded(e => !e)}
        activeOpacity={0.7}
      >
        <Text style={{ fontSize: 20, marginRight: 14, width: 26, textAlign: 'center' }}>📦</Text>
        <Text style={{ flex: 1, fontSize: 15, color: theme.text, fontWeight: '500' }}>
          My Orders {orders.length > 0 ? `(${orders.length})` : ''}
        </Text>
        <Text style={{ fontSize: 22, color: theme.subtext }}>{expanded ? '⌃' : '›'}</Text>
      </TouchableOpacity>

      {expanded && (
        <View style={{ paddingHorizontal: 16, paddingBottom: 12 }}>
          {orders.length === 0 ? (
            <View style={{
              backgroundColor: theme.bg, borderRadius: 12, padding: 20,
              alignItems: 'center', borderWidth: 1, borderColor: theme.border,
            }}>
              <Text style={{ fontSize: 32, marginBottom: 8 }}>📭</Text>
              <Text style={{ fontSize: 14, color: theme.subtext, textAlign: 'center' }}>
                No orders yet. Start shopping!
              </Text>
            </View>
          ) : (
            orders.map((o, i) => (
              <View key={i} style={{
                backgroundColor: theme.bg, borderRadius: 12, padding: 12,
                marginBottom: 8, borderWidth: 1, borderColor: theme.border,
              }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: theme.text }}>
                    #{o.orderId}
                  </Text>
                  <View style={{
                    backgroundColor: statusColor(o.status) + '22',
                    borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2,
                  }}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: statusColor(o.status) }}>
                      {o.status || 'Placed'}
                    </Text>
                  </View>
                </View>

                {o.items?.length > 0 && (
                  <Text style={{ fontSize: 13, color: theme.text, marginBottom: 2 }} numberOfLines={1}>
                    {o.items.map(x => x.name).join(', ')}
                  </Text>
                )}

                {o.address && (
                  <Text style={{ fontSize: 12, color: theme.subtext, marginBottom: 2 }} numberOfLines={1}>
                    📍 {o.address.address}{o.address.area ? `, ${o.address.area}` : ''}, {o.address.city}
                  </Text>
                )}

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                  <Text style={{ fontSize: 11, color: theme.subtext }}>{o.date}</Text>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: theme.primary }}>
                    PKR {o.total?.toLocaleString()}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      )}
    </View>
  );
}

// ─── Addresses Section ────────────────────────────────────────
function AddressesSection({ theme, userId }) {
  const [expanded,  setExpanded]  = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [showAdd,   setShowAdd]   = useState(false);
  const [newLabel,  setNewLabel]  = useState('');
  const [newAddr,   setNewAddr]   = useState('');
  const [newPhone,  setNewPhone]  = useState('');

  // Load on mount
  useEffect(() => {
    if (!userId) return;
    getAddresses(userId).then(setAddresses);
  }, [userId]);

  // Reload when expanded
  useEffect(() => {
    if (!userId || !expanded) return;
    getAddresses(userId).then(setAddresses);
  }, [expanded]);

  const handleAdd = async () => {
    if (!newLabel.trim() || !newAddr.trim()) {
      Alert.alert('', 'Please fill in Label and Address.');
      return;
    }
    const updated = await addAddress(userId, {
      label: newLabel,
      address: newAddr,
      phone: newPhone,
    });
    if (updated) {
      setAddresses(updated);
      setNewLabel('');
      setNewAddr('');
      setNewPhone('');
      setShowAdd(false);
    }
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Address', 'Remove this address?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          const u = await deleteAddress(userId, id);
          if (u) setAddresses(u);
        },
      },
    ]);
  };

  const handleSetDefault = async (id) => {
    const updated = await setDefaultAddress(userId, id);
    if (updated) setAddresses(updated);
  };

  const inp = {
    height: 44, backgroundColor: theme.inputBg,
    borderWidth: 1, borderColor: theme.border,
    borderRadius: 10, paddingHorizontal: 12,
    fontSize: 14, color: theme.text,
  };

  return (
    <View>
      <TouchableOpacity
        style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 }}
        onPress={() => setExpanded(e => !e)}
        activeOpacity={0.7}
      >
        <Text style={{ fontSize: 20, marginRight: 14, width: 26, textAlign: 'center' }}>📍</Text>
        <Text style={{ flex: 1, fontSize: 15, color: theme.text, fontWeight: '500' }}>
          Saved Addresses {addresses.length > 0 ? `(${addresses.length})` : ''}
        </Text>
        <Text style={{ fontSize: 22, color: theme.subtext }}>{expanded ? '⌃' : '›'}</Text>
      </TouchableOpacity>

      {expanded && (
        <View style={{ paddingHorizontal: 16, paddingBottom: 12 }}>
          {addresses.length === 0 && !showAdd && (
            <View style={{
              backgroundColor: theme.bg, borderRadius: 12, padding: 16,
              alignItems: 'center', borderWidth: 1, borderColor: theme.border, marginBottom: 8,
            }}>
              <Text style={{ fontSize: 13, color: theme.subtext }}>No saved addresses yet.</Text>
            </View>
          )}

          {addresses.map(a => (
            <View key={a.id} style={{
              backgroundColor: theme.bg, borderRadius: 12, padding: 12, marginBottom: 8,
              borderWidth: 1, borderColor: a.default ? theme.primary : theme.border,
              flexDirection: 'row', alignItems: 'flex-start',
            }}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: theme.text }}>{a.label}</Text>
                  {a.default && (
                    <View style={{
                      backgroundColor: theme.primary + '22', borderRadius: 6,
                      paddingHorizontal: 6, paddingVertical: 1,
                    }}>
                      <Text style={{ fontSize: 10, fontWeight: '700', color: theme.primary }}>Default</Text>
                    </View>
                  )}
                </View>
                <Text style={{ fontSize: 13, color: theme.subtext, lineHeight: 18 }}>{a.address}</Text>
                {a.phone ? (
                  <Text style={{ fontSize: 12, color: theme.subtext, marginTop: 2 }}>{a.phone}</Text>
                ) : null}
                {!a.default && (
                  <TouchableOpacity onPress={() => handleSetDefault(a.id)} style={{ marginTop: 6 }}>
                    <Text style={{ fontSize: 12, color: theme.primary, fontWeight: '600' }}>
                      Set as Default
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              <TouchableOpacity onPress={() => handleDelete(a.id)} style={{ padding: 4, marginLeft: 8 }}>
                <Text style={{ fontSize: 16 }}>🗑️</Text>
              </TouchableOpacity>
            </View>
          ))}

          {showAdd && (
            <View style={{
              backgroundColor: theme.bg, borderRadius: 12, padding: 14,
              borderWidth: 1, borderColor: theme.border, marginBottom: 8,
            }}>
              <Text style={{ fontSize: 12, color: theme.subtext, marginBottom: 6 }}>
                Label (e.g. Home, Office) *
              </Text>
              <TextInput
                value={newLabel} onChangeText={setNewLabel}
                placeholder="Home" placeholderTextColor={theme.subtext}
                style={{ ...inp, marginBottom: 10 }}
              />
              <Text style={{ fontSize: 12, color: theme.subtext, marginBottom: 6 }}>Full Address *</Text>
              <TextInput
                value={newAddr} onChangeText={setNewAddr}
                placeholder="House no, Street, City..."
                placeholderTextColor={theme.subtext}
                style={{ ...inp, marginBottom: 10 }}
              />
              <Text style={{ fontSize: 12, color: theme.subtext, marginBottom: 6 }}>Phone (optional)</Text>
              <TextInput
                value={newPhone} onChangeText={setNewPhone}
                placeholder="03XX-XXXXXXX" placeholderTextColor={theme.subtext}
                keyboardType="phone-pad"
                style={{ ...inp, marginBottom: 12 }}
              />
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity
                  onPress={() => { setShowAdd(false); setNewLabel(''); setNewAddr(''); setNewPhone(''); }}
                  style={{
                    flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center',
                    backgroundColor: theme.bg, borderWidth: 1, borderColor: theme.border,
                  }}
                >
                  <Text style={{ color: theme.subtext, fontWeight: '600' }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleAdd}
                  style={{
                    flex: 1, paddingVertical: 10, borderRadius: 10,
                    alignItems: 'center', backgroundColor: theme.primary,
                  }}
                >
                  <Text style={{ color: '#fff', fontWeight: '700' }}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {!showAdd && (
            <TouchableOpacity
              onPress={() => setShowAdd(true)}
              style={{
                borderWidth: 1.5, borderColor: theme.primary, borderStyle: 'dashed',
                borderRadius: 12, padding: 12, alignItems: 'center', marginTop: 4,
              }}
            >
              <Text style={{ fontSize: 13, color: theme.primary, fontWeight: '600' }}>
                + Add New Address
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

// ─── Payment Section ──────────────────────────────────────────
function PaymentSection({ theme, userId }) {
  const [expanded, setExpanded] = useState(false);
  const [selected, setSelected] = useState('cod');

  useEffect(() => {
    if (!userId) return;
    AsyncStorage.getItem(`payment_method_${userId}`)
      .then(d => { if (d) setSelected(d); })
      .catch(() => {});
  }, [userId]);

  const choose = async (method) => {
    setSelected(method);
    if (userId) await AsyncStorage.setItem(`payment_method_${userId}`, method);
  };

  const OPTIONS = [
    { key: 'cod',    icon: '💵', label: 'Cash on Delivery',     sub: 'Pay when order arrives' },
    { key: 'card',   icon: '💳', label: 'Credit / Debit Card',  sub: 'Visa, Mastercard, UnionPay' },
    { key: 'wallet', icon: '📱', label: 'JazzCash / EasyPaisa', sub: 'Mobile wallet' },
  ];

  return (
    <View>
      <TouchableOpacity
        style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 }}
        onPress={() => setExpanded(e => !e)}
        activeOpacity={0.7}
      >
        <Text style={{ fontSize: 20, marginRight: 14, width: 26, textAlign: 'center' }}>💳</Text>
        <Text style={{ flex: 1, fontSize: 15, color: theme.text, fontWeight: '500' }}>Payment Methods</Text>
        <Text style={{ fontSize: 22, color: theme.subtext }}>{expanded ? '⌃' : '›'}</Text>
      </TouchableOpacity>

      {expanded && (
        <View style={{ paddingHorizontal: 16, paddingBottom: 12 }}>
          {OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt.key}
              onPress={() => choose(opt.key)}
              style={{
                flexDirection: 'row', alignItems: 'center',
                backgroundColor: selected === opt.key ? theme.blush : theme.bg,
                borderWidth: 1.5,
                borderColor: selected === opt.key ? theme.primary : theme.border,
                borderRadius: 12, padding: 12, marginBottom: 8, gap: 12,
              }}
            >
              <Text style={{ fontSize: 22 }}>{opt.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{
                  fontSize: 14, fontWeight: '600',
                  color: selected === opt.key ? theme.primary : theme.text,
                }}>
                  {opt.label}
                </Text>
                <Text style={{ fontSize: 11, color: theme.subtext, marginTop: 1 }}>{opt.sub}</Text>
              </View>
              <View style={{
                width: 20, height: 20, borderRadius: 10,
                borderWidth: 2,
                borderColor: selected === opt.key ? theme.primary : theme.border,
                alignItems: 'center', justifyContent: 'center',
              }}>
                {selected === opt.key && (
                  <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: theme.primary }} />
                )}
              </View>
            </TouchableOpacity>
          ))}
          <Text style={{ fontSize: 12, color: theme.subtext, textAlign: 'center', marginTop: 4 }}>
            ✅ Default payment method saved
          </Text>
        </View>
      )}
    </View>
  );
}

// ─── Rate Modal ───────────────────────────────────────────────
function RateModal({ visible, onClose, theme }) {
  const [stars,     setStars]     = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (visible) {
      setStars(0);
      setSubmitted(false);
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 80 }).start();
    }
  }, [visible]);

  const handleSubmit = () => {
    if (stars === 0) { Alert.alert('', 'Please select a rating first.'); return; }
    setSubmitted(true);
    setTimeout(() => {
      if (stars >= 4) Linking.openURL('market://details?id=com.yourapp');
      onClose();
    }, 1400);
  };

  const labels = ['', 'Poor 😞', 'Fair 😐', 'Good 🙂', 'Great 😊', 'Excellent! 🌟'];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{
        flex: 1, backgroundColor: '#00000088',
        justifyContent: 'center', alignItems: 'center', padding: 24,
      }}>
        <Animated.View style={{
          backgroundColor: theme.card, borderRadius: 24, padding: 28, width: '100%',
          borderWidth: 1, borderColor: theme.border,
          transform: [{ scale: scaleAnim }],
        }}>
          {submitted ? (
            <View style={{ alignItems: 'center', paddingVertical: 12 }}>
              <Text style={{ fontSize: 48, marginBottom: 12 }}>🎉</Text>
              <Text style={{ fontSize: 20, fontWeight: '800', color: theme.text, marginBottom: 6 }}>Thank you!</Text>
              <Text style={{ fontSize: 14, color: theme.subtext, textAlign: 'center' }}>
                Your feedback means a lot to us.
              </Text>
            </View>
          ) : (
            <>
              <Text style={{ fontSize: 22, fontWeight: '800', color: theme.text, textAlign: 'center', marginBottom: 4 }}>
                Enjoying the app? 😊
              </Text>
              <Text style={{ fontSize: 14, color: theme.subtext, textAlign: 'center', marginBottom: 24 }}>
                Tap a star to rate your experience
              </Text>
              <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
                {[1, 2, 3, 4, 5].map(i => (
                  <TouchableOpacity key={i} onPress={() => setStars(i)} activeOpacity={0.7}>
                    <Text style={{ fontSize: 38 }}>{i <= stars ? '⭐' : '☆'}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={{
                textAlign: 'center', fontSize: 15, fontWeight: '600',
                color: theme.primary, marginBottom: 24, minHeight: 22,
              }}>
                {stars > 0 ? labels[stars] : ''}
              </Text>
              <TouchableOpacity
                onPress={handleSubmit}
                style={{
                  backgroundColor: theme.primary, borderRadius: 14,
                  paddingVertical: 14, alignItems: 'center', marginBottom: 12,
                }}
              >
                <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>Submit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose} style={{ alignItems: 'center' }}>
                <Text style={{ color: theme.subtext, fontSize: 13 }}>Maybe later</Text>
              </TouchableOpacity>
            </>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

// ─── Edit Profile Modal ───────────────────────────────────────
function EditProfileModal({ visible, onClose, user, theme, onProfileUpdated }) {
  const [tab,     setTab]     = useState('name');
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) { setNewName(user?.displayName || ''); setTab('name'); }
  }, [visible]);

  const handlePickPhoto = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please allow access to your photo library.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true, aspect: [1, 1], quality: 0.7,
      });
      if (!result.canceled && result.assets?.[0]) {
        setLoading(true);
        const uri = result.assets[0].uri;
        const { getStorage, ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
        const { updateProfile, getAuth } = await import('firebase/auth');
        const response = await fetch(uri);
        const blob = await response.blob();
        const storageRef = ref(getStorage(), `avatars/${getAuth().currentUser.uid}.jpg`);
        await uploadBytes(storageRef, blob);
        const downloadURL = await getDownloadURL(storageRef);
        await updateProfile(getAuth().currentUser, { photoURL: downloadURL });
        onProfileUpdated?.({ photoURL: downloadURL });
        Alert.alert('Done!', 'Profile picture updated!');
        onClose();
      }
    } catch (e) {
      Alert.alert('Error', e.message || 'Could not update photo.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeName = async () => {
    if (!newName.trim()) { Alert.alert('', 'Please enter a name.'); return; }
    setLoading(true);
    try {
      const { updateProfile, getAuth } = await import('firebase/auth');
      await updateProfile(getAuth().currentUser, { displayName: newName.trim() });
      onProfileUpdated?.({ displayName: newName.trim() });
      Alert.alert('Done!', 'Name updated successfully!');
      onClose();
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    setLoading(true);
    try {
      const { sendPasswordResetEmail, getAuth } = await import('firebase/auth');
      await sendPasswordResetEmail(getAuth(), user?.email);
      Alert.alert('Email Sent!', `A password reset link has been sent to ${user?.email}.`);
      onClose();
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const TABS = [
    { key: 'photo',    label: '📷 Photo' },
    { key: 'name',     label: '✏️ Name' },
    { key: 'password', label: '🔑 Password' },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: '#00000088', justifyContent: 'flex-end' }}>
        <View style={{
          backgroundColor: theme.card,
          borderTopLeftRadius: 28, borderTopRightRadius: 28,
          padding: 24, borderWidth: 1, borderColor: theme.border,
        }}>
          <View style={{
            width: 36, height: 4, backgroundColor: theme.border,
            borderRadius: 2, alignSelf: 'center', marginBottom: 20,
          }} />
          <Text style={{ fontSize: 20, fontWeight: '800', color: theme.text, marginBottom: 20 }}>
            Edit Profile
          </Text>

          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 24 }}>
            {TABS.map(tb => (
              <TouchableOpacity
                key={tb.key}
                onPress={() => setTab(tb.key)}
                style={{
                  flex: 1, paddingVertical: 9, borderRadius: 12, alignItems: 'center',
                  backgroundColor: tab === tb.key ? theme.primary : theme.bg,
                  borderWidth: 1,
                  borderColor: tab === tb.key ? theme.primary : theme.border,
                }}
              >
                <Text style={{
                  fontSize: 13, fontWeight: '700',
                  color: tab === tb.key ? '#fff' : theme.subtext,
                }}>
                  {tb.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {tab === 'photo' && (
            <View style={{ alignItems: 'center', paddingVertical: 8 }}>
              <Text style={{
                fontSize: 14, color: theme.subtext,
                textAlign: 'center', marginBottom: 20, lineHeight: 20,
              }}>
                Choose a photo from your gallery to set as your profile picture.
              </Text>
              <TouchableOpacity
                onPress={handlePickPhoto} disabled={loading}
                style={{
                  backgroundColor: theme.primary, borderRadius: 14,
                  paddingVertical: 14, paddingHorizontal: 40,
                }}
              >
                <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>
                  {loading ? 'Uploading...' : 'Choose Photo'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {tab === 'name' && (
            <View>
              <Text style={{ fontSize: 13, color: theme.subtext, marginBottom: 8 }}>Display Name</Text>
              <TextInput
                value={newName} onChangeText={setNewName}
                placeholder="Enter your name" placeholderTextColor={theme.subtext}
                style={{
                  backgroundColor: theme.bg, borderWidth: 1, borderColor: theme.border,
                  borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
                  fontSize: 15, color: theme.text, marginBottom: 16,
                }}
              />
              <TouchableOpacity
                onPress={handleChangeName} disabled={loading}
                style={{
                  backgroundColor: theme.primary, borderRadius: 14,
                  paddingVertical: 14, alignItems: 'center',
                }}
              >
                <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>
                  {loading ? 'Saving...' : 'Save Name'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {tab === 'password' && (
            <View style={{ alignItems: 'center' }}>
              <Text style={{
                fontSize: 14, color: theme.subtext,
                textAlign: 'center', marginBottom: 20, lineHeight: 22,
              }}>
                We will send a password reset link to{'\n'}
                <Text style={{ color: theme.text, fontWeight: '600' }}>{user?.email}</Text>
              </Text>
              <TouchableOpacity
                onPress={handlePasswordReset} disabled={loading}
                style={{
                  backgroundColor: theme.primary, borderRadius: 14,
                  paddingVertical: 14, paddingHorizontal: 40,
                }}
              >
                <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>
                  {loading ? 'Sending...' : 'Send Reset Email'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity onPress={onClose} style={{ alignItems: 'center', marginTop: 20 }}>
            <Text style={{ color: theme.subtext, fontSize: 14 }}>Cancel</Text>
          </TouchableOpacity>
          <View style={{ height: Platform.OS === 'ios' ? 20 : 0 }} />
        </View>
      </View>
    </Modal>
  );
}

// ─── Reusable Row ─────────────────────────────────────────────
function SettingRow({ icon, label, value, onPress, theme }) {
  return (
    <TouchableOpacity
      style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 }}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={{ fontSize: 20, marginRight: 14, width: 26, textAlign: 'center' }}>{icon}</Text>
      <Text style={{ flex: 1, fontSize: 15, color: theme.text, fontWeight: '500' }}>{label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        {value && <Text style={{ fontSize: 14, color: theme.subtext }}>{value}</Text>}
        <Text style={{ fontSize: 22, color: theme.subtext }}>›</Text>
      </View>
    </TouchableOpacity>
  );
}

function Divider({ theme }) {
  return <View style={{ height: 1, backgroundColor: theme.border, marginLeft: 56 }} />;
}

// ─── MAIN SettingsScreen ──────────────────────────────────────
export default function SettingsScreen({ navigation }) {
  const { user }                       = useAuth();
  const { isDark, toggleTheme, theme } = useTheme();
  const [notifications,   setNotifications]   = useState(true);
  const [showRateModal,   setShowRateModal]   = useState(false);
  const [showEditModal,   setShowEditModal]   = useState(false);
  const [profileOverride, setProfileOverride] = useState({});

  const userId      = user?.uid;
  const displayName = profileOverride.displayName ?? user?.displayName;
  const photoURL    = profileOverride.photoURL    ?? user?.photoURL;
  const username    = displayName || user?.email?.split('@')[0] || 'Guest';
  const email       = user?.email || '';
  const initials    = username.slice(0, 2).toUpperCase();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout', style: 'destructive',
        onPress: async () => {
          try { await logoutUser(); navigation.replace('Login'); }
          catch (e) { Alert.alert('Error', e.message); }
        },
      },
    ]);
  };

  const s = makeStyles(theme, isDark);

  return (
    <View style={s.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.bg} />

      <RateModal
        visible={showRateModal}
        onClose={() => setShowRateModal(false)}
        theme={theme}
      />
      <EditProfileModal
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
        user={user}
        theme={theme}
        onProfileUpdated={(data) => setProfileOverride(prev => ({ ...prev, ...data }))}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <Text style={s.headerTitle}>Profile & Settings</Text>
        </View>

        {/* Profile Card */}
        <View style={s.profileCard}>
          <TouchableOpacity onPress={() => setShowEditModal(true)} style={s.avatarWrapper}>
            {photoURL
              ? <Image source={{ uri: photoURL }} style={s.avatarImage} />
              : (
                <View style={s.avatarCircle}>
                  <Text style={s.avatarText}>{initials}</Text>
                </View>
              )
            }
            <View style={s.cameraBadge}>
              <Text style={{ fontSize: 10 }}>📷</Text>
            </View>
          </TouchableOpacity>
          <View style={s.profileInfo}>
            <Text style={s.profileName}>{username}</Text>
            <Text style={s.profileEmail}>{email}</Text>
            <View style={s.onlineDot}>
              <View style={s.dot} />
              <Text style={s.onlineText}>Active</Text>
            </View>
          </View>
          <TouchableOpacity style={s.editBtn} onPress={() => setShowEditModal(true)}>
            <Text style={s.editBtnText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Account */}
        <Text style={s.sectionLabel}>Account</Text>
        <View style={s.sectionCard}>
          <OrdersSection theme={theme} userId={userId} />
          <Divider theme={theme} />
          <SettingRow
            theme={theme} icon="🤍" label="My Wishlist"
            onPress={() => navigation.navigate('Wishlist')}
          />
          <Divider theme={theme} />
          <AddressesSection theme={theme} userId={userId} />
          <Divider theme={theme} />
          <PaymentSection theme={theme} userId={userId} />
        </View>

        {/* Preferences */}
        <Text style={s.sectionLabel}>Preferences</Text>
        <View style={s.sectionCard}>
          <View style={s.toggleRow}>
            <Text style={s.rowIcon}>🌙</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.rowLabel}>Dark Mode</Text>
              <Text style={s.rowSub}>{isDark ? 'Dark theme active' : 'Light theme active'}</Text>
            </View>
            <Switch
              value={isDark} onValueChange={toggleTheme}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor={theme.text}
            />
          </View>
          <Divider theme={theme} />
          <View style={s.toggleRow}>
            <Text style={s.rowIcon}>🔔</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.rowLabel}>Notifications</Text>
              <Text style={s.rowSub}>{notifications ? 'Enabled' : 'Disabled'}</Text>
            </View>
            <Switch
              value={notifications} onValueChange={setNotifications}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor={theme.text}
            />
          </View>
          <Divider theme={theme} />
          <SettingRow
            theme={theme} icon="🌐" label="Language" value="English"
            onPress={() => Alert.alert('Coming Soon', 'Language options coming soon.')}
          />
          <Divider theme={theme} />
          <SettingRow
            theme={theme} icon="💰" label="Currency" value="PKR"
            onPress={() => Alert.alert('Coming Soon', 'Currency settings coming soon.')}
          />
        </View>

        {/* Support */}
        <Text style={s.sectionLabel}>Support</Text>
        <View style={s.sectionCard}>
          <SettingRow
            theme={theme} icon="❓" label="Help & FAQ"
            onPress={() => Alert.alert(
              'Help & FAQ',
              '1. How to track orders?\nGo to My Orders section.\n\n2. Return policy?\nWithin 7 days.\n\n3. Payments secure?\nYes, encrypted.',
              [{ text: 'OK' }]
            )}
          />
          <Divider theme={theme} />
          <SettingRow
            theme={theme} icon="💬" label="Contact Us"
            onPress={() => Alert.alert('Contact Us', 'Get in touch:', [
              { text: 'Cancel', style: 'cancel' },
              { text: '📧 Email', onPress: () => Linking.openURL('mailto:support@yourapp.com') },
              { text: '📱 WhatsApp', onPress: () => Linking.openURL('https://wa.me/923001234567') },
            ])}
          />
          <Divider theme={theme} />
          <SettingRow
            theme={theme} icon="⭐" label="Rate the App"
            onPress={() => setShowRateModal(true)}
          />
          <Divider theme={theme} />
          <SettingRow
            theme={theme} icon="📄" label="Privacy Policy"
            onPress={() => Linking.openURL('https://yourapp.com/privacy')}
          />
          <Divider theme={theme} />
          <SettingRow
            theme={theme} icon="📋" label="Terms of Service"
            onPress={() => Linking.openURL('https://yourapp.com/terms')}
          />
        </View>

        {/* Logout */}
        <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
          <Text style={s.logoutIcon}>🚪</Text>
          <Text style={s.logoutText}>Logout</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const makeStyles = (theme, isDark) => StyleSheet.create({
  container:    { flex: 1, backgroundColor: theme.bg },
  header:       {
    paddingHorizontal: 20, paddingTop: 54, paddingBottom: 16,
    backgroundColor: theme.card,
    borderBottomWidth: 1, borderBottomColor: theme.border,
  },
  headerTitle:  { fontSize: 26, fontWeight: '800', color: theme.text },

  profileCard:  {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: theme.card, marginHorizontal: 16, marginTop: 16,
    borderRadius: 18, padding: 16,
    borderWidth: 1, borderColor: theme.border,
  },
  avatarWrapper:{ marginRight: 14, position: 'relative' },
  avatarImage:  { width: 58, height: 58, borderRadius: 29 },
  avatarCircle: {
    width: 58, height: 58, borderRadius: 29,
    backgroundColor: theme.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText:   { fontSize: 22, fontWeight: '800', color: '#fff' },
  cameraBadge:  {
    position: 'absolute', bottom: 0, right: 0,
    backgroundColor: theme.card, borderRadius: 10,
    width: 20, height: 20,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: theme.border,
  },
  profileInfo:  { flex: 1 },
  profileName:  { fontSize: 17, fontWeight: '700', color: theme.text, marginBottom: 2 },
  profileEmail: { fontSize: 13, color: theme.subtext, marginBottom: 4 },
  onlineDot:    { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dot:          { width: 7, height: 7, borderRadius: 4, backgroundColor: '#2D9E75' },
  onlineText:   { fontSize: 11, color: '#2D9E75', fontWeight: '600' },
  editBtn:      {
    backgroundColor: theme.blush,
    borderWidth: 1, borderColor: theme.border,
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 6,
  },
  editBtnText:  { fontSize: 13, fontWeight: '700', color: theme.primary },

  sectionLabel: {
    fontSize: 12, fontWeight: '700', color: theme.subtext,
    letterSpacing: 0.8, textTransform: 'uppercase',
    marginHorizontal: 20, marginTop: 22, marginBottom: 8,
  },
  sectionCard:  {
    backgroundColor: theme.card, marginHorizontal: 16,
    borderRadius: 18, borderWidth: 1, borderColor: theme.border, overflow: 'hidden',
  },
  toggleRow:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  rowIcon:      { fontSize: 20, marginRight: 14, width: 26, textAlign: 'center' },
  rowLabel:     { fontSize: 15, color: theme.text, fontWeight: '500' },
  rowSub:       { fontSize: 11, color: theme.subtext, marginTop: 1 },

  logoutBtn:    {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, marginHorizontal: 16, marginTop: 24,
    backgroundColor: isDark ? '#3D1515' : '#FDE8E8',
    borderWidth: 1, borderColor: '#F2C4C4',
    borderRadius: 16, paddingVertical: 14,
  },
  logoutIcon:   { fontSize: 18 },
  logoutText:   { fontSize: 15, fontWeight: '700', color: '#E24B4A' },
});