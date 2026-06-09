import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, StatusBar,
  KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { registerUser } from '../../firebase/authService';
const COLORS = {
  white: '#FFFFFF',
  background: '#FFFFFF',
  blush: '#FDECEA',
  inputBg: '#FDF0EE',
  border: '#F2D4D0',
  roseGold: '#C9967A',
  roseGoldDark: '#A87060',
  textPrimary: '#1A1A1A',
  textSecondary: '#8A7B78',
  textMuted: '#BFB0AE',
};

const SignupScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [agreed, setAgreed] = useState(false);

 const handleSignup = async () => {
  if (!name || !email || !password || !confirmPass) {
    Alert.alert('Error', 'Fill all fields');
    return;
  }

  if (password !== confirmPass) {
    Alert.alert('Error', 'Passwords not match');
    return;
  }

  try {
    await registerUser(name, email, password);

    Alert.alert('Success', 'Account Created');
    navigation.replace('Home');
  } catch (error) {
    Alert.alert('Signup Failed', error.message);
  }
};

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScrollView
        style={styles.screen}
        contentContainerStyle={{ paddingBottom: 48 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Blobs */}
        <View style={styles.blobTopRight} />
        <View style={styles.blobTopLeft} />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join ShopSmart today</Text>
        </View>

        {/* Tab Row */}
        <View style={styles.tabRow}>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.tabInactiveText}>Login</Text>
          </TouchableOpacity>
          <View style={styles.tabActive}>
            <Text style={styles.tabActiveText}>Sign Up</Text>
          </View>
        </View>

        <View style={styles.form}>

          {/* Full Name */}
          <Text style={styles.label}>Full Name</Text>
          <View style={styles.inputBox}>
            <Text style={styles.icon}>👤</Text>
            <TextInput
              style={styles.input}
              placeholder="Your full name"
              placeholderTextColor={COLORS.textMuted}
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* Email */}
          <Text style={styles.label}>Email</Text>
          <View style={styles.inputBox}>
            <Text style={styles.icon}>✉️</Text>
            <TextInput
              style={styles.input}
              placeholder="your@email.com"
              placeholderTextColor={COLORS.textMuted}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          {/* Password */}
          <Text style={styles.label}>Password</Text>
          <View style={styles.inputBox}>
            <Text style={styles.icon}>🔒</Text>
            <TextInput
              style={styles.input}
              placeholder="Create password"
              placeholderTextColor={COLORS.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPass}
            />
            <TouchableOpacity onPress={() => setShowPass(!showPass)}>
              <Text style={styles.icon}>{showPass ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>

          {/* Confirm Password */}
          <Text style={styles.label}>Confirm Password</Text>
          <View style={styles.inputBox}>
            <Text style={styles.icon}>🔒</Text>
            <TextInput
              style={styles.input}
              placeholder="Re-enter password"
              placeholderTextColor={COLORS.textMuted}
              value={confirmPass}
              onChangeText={setConfirmPass}
              secureTextEntry
            />
          </View>

          {/* Terms */}
          <TouchableOpacity
            style={styles.checkRow}
            onPress={() => setAgreed(!agreed)}
          >
            <View style={[styles.checkbox, agreed && styles.checkboxActive]}>
              {agreed && <Text style={styles.checkMark}>✓</Text>}
            </View>
            <Text style={styles.rememberText}>
              I agree to{' '}
              <Text style={styles.link}>Terms & Conditions</Text>
            </Text>
          </TouchableOpacity>

          {/* Signup Button */}
          <TouchableOpacity style={styles.primaryBtn} onPress={handleSignup}>
            <Text style={styles.primaryBtnText}>Create Account</Text>
          </TouchableOpacity>

          {/* Switch to Login */}
          <View style={styles.switchRow}>
            <Text style={styles.switchText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.switchLink}>Login</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },

  blobTopRight: {
    position: 'absolute', width: 200, height: 200,
    borderRadius: 100, backgroundColor: '#FDECEA',
    top: -60, right: -60, opacity: 0.8,
  },
  blobTopLeft: {
    position: 'absolute', width: 120, height: 120,
    borderRadius: 60, backgroundColor: '#F7C5BC',
    top: 60, right: 30, opacity: 0.4,
  },

  header: { paddingTop: 72, paddingHorizontal: 28, marginBottom: 24 },
  title: {
    fontFamily: 'serif', fontSize: 30, fontWeight: '700',
    color: COLORS.roseGoldDark, marginBottom: 6,
  },
  subtitle: { fontSize: 14, color: COLORS.textSecondary },

  tabRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 28, marginBottom: 28, gap: 24,
  },
  tabActive: {
    backgroundColor: COLORS.roseGold,
    paddingHorizontal: 28, paddingVertical: 10,
    borderRadius: 50,
  },
  tabActiveText: { color: COLORS.white, fontWeight: '700', fontSize: 14 },
  tabInactiveText: { color: COLORS.textSecondary, fontWeight: '600', fontSize: 14 },

  form: { paddingHorizontal: 28 },

  label: {
    fontSize: 13, fontWeight: '600',
    color: COLORS.textPrimary, marginBottom: 8,
  },
  inputBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 14, paddingHorizontal: 14,
    height: 52, marginBottom: 16,
  },
  icon: { fontSize: 16, marginRight: 8 },
  input: { flex: 1, fontSize: 14, color: COLORS.textPrimary },

  checkRow: {
    flexDirection: 'row', alignItems: 'center', marginBottom: 24,
  },
  checkbox: {
    width: 20, height: 20, borderWidth: 1.5,
    borderColor: COLORS.border, borderRadius: 5,
    marginRight: 8, alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.white,
  },
  checkboxActive: {
    backgroundColor: COLORS.roseGold, borderColor: COLORS.roseGold,
  },
  checkMark: { color: COLORS.white, fontSize: 12, fontWeight: '700' },
  rememberText: { fontSize: 13, color: COLORS.textSecondary },
  link: { fontSize: 13, fontWeight: '700', color: COLORS.roseGold },

  primaryBtn: {
    backgroundColor: COLORS.roseGold, borderRadius: 14,
    height: 54, alignItems: 'center', justifyContent: 'center',
    shadowColor: COLORS.roseGold, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  primaryBtnText: {
    color: COLORS.white, fontSize: 16, fontWeight: '700', letterSpacing: 0.5,
  },

  switchRow: {
    flexDirection: 'row', justifyContent: 'center',
    alignItems: 'center', marginTop: 20,
  },
  switchText: { fontSize: 13, color: COLORS.textSecondary },
  switchLink: { fontSize: 13, fontWeight: '700', color: COLORS.roseGold },
});

export default SignupScreen;