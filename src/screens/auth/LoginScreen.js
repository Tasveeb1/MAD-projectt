// src/screens/auth/LoginScreen.js
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, StatusBar, Dimensions,
  KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { loginUser, registerUser } from '../../firebase/authService';
import { useAuth } from '../../context/AuthContext';

const { width, height } = Dimensions.get('window');

// ── Admin credentials — change these as needed ──
const ADMIN_EMAIL    = 'admin@shoppingapp.com';
const ADMIN_PASSWORD = 'admin123';

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
  success: '#2D9E75',
  danger: '#E24B4A',
};

// ── Reusable Input ───────────────────────────────────────────
const InputField = ({ label, placeholder, value, onChangeText, secureTextEntry, leftIcon, rightIcon, keyboardType }) => (
  <View style={styles.inputGroup}>
    <Text style={styles.inputLabel}>{label}</Text>
    <View style={styles.inputWrapper}>
      {leftIcon && <Text style={styles.inputIcon}>{leftIcon}</Text>}
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textMuted}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        autoCapitalize="none"
        keyboardType={keyboardType || 'default'}
        blurOnSubmit={false}
      />
      {rightIcon && rightIcon}
    </View>
  </View>
);

// ── Login Form ───────────────────────────────────────────────
const LoginForm = ({ navigation }) => {
  const { setUser, setIsAdmin } = useAuth();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading]   = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill all fields.');
      return;
    }

    setLoading(true);
    try {
      // ── Check if admin ──────────────────────────────────
      if (
        email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase() &&
        password === ADMIN_PASSWORD
      ) {
        // Admin login — no Firebase call needed if you want offline admin
        // But we still try Firebase; if it fails we still allow admin access
        try { await loginUser(email.trim(), password); } catch (_) {}
        setIsAdmin(true);
        setUser({ email, isAdmin: true });
        navigation.replace('AdminDashboard');
        return;
      }

      // ── Normal user login ───────────────────────────────
      const user = await loginUser(email.trim(), password);
      setIsAdmin(false);
      setUser(user);
      navigation.replace('Home');

    } catch (error) {
      Alert.alert('Login Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <InputField
        label="Email"
        placeholder="your@email.com"
        value={email}
        onChangeText={setEmail}
        leftIcon="✉️"
        keyboardType="email-address"
      />

      <InputField
        label="Password"
        placeholder="Enter password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={!showPass}
        leftIcon="🔒"
        rightIcon={
          <TouchableOpacity onPress={() => setShowPass(!showPass)}>
            <Text style={styles.eyeIcon}>{showPass ? '🙈' : '👁️'}</Text>
          </TouchableOpacity>
        }
      />

      {/* Remember Me + Forgot */}
      <View style={styles.rowBetween}>
        <TouchableOpacity style={styles.checkRow} onPress={() => setRememberMe(!rememberMe)}>
          <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
            {rememberMe && <Text style={styles.checkMark}>✓</Text>}
          </View>
          <Text style={styles.rememberText}>Remember Me</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={styles.forgotText}>Forgot Password?</Text>
        </TouchableOpacity>
      </View>

     

      {/* Login Button */}
      <TouchableOpacity
        style={[styles.primaryBtn, loading && { opacity: 0.7 }]}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.primaryBtnText}>{loading ? 'Logging in...' : 'Login'}</Text>
      </TouchableOpacity>

      {/* Divider */}
      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or continue with</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* Google Button */}
      <TouchableOpacity style={styles.googleBtn}>
        <Text style={styles.googleIcon}>G</Text>
        <Text style={styles.googleText}>Google</Text>
      </TouchableOpacity>

      {/* Switch to Signup */}
      <View style={styles.switchRow}>
        <Text style={styles.switchText}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => {}/* handled by tab */}>
          <Text style={styles.switchLink}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ── Signup Form ──────────────────────────────────────────────
const SignupForm = ({ navigation }) => {
  const { setUser, setIsAdmin } = useAuth();
  const [name, setName]             = useState('');
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass]     = useState(false);
  const [agreed, setAgreed]         = useState(false);
  const [loading, setLoading]       = useState(false);

  const handleSignup = async () => {
    if (!name || !email || !password || !confirmPass) {
      Alert.alert('Error', 'Please fill all fields.');
      return;
    }
    if (password !== confirmPass) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }
    if (!agreed) {
      Alert.alert('Error', 'Please agree to Terms & Conditions.');
      return;
    }

    setLoading(true);
    try {
      const user = await registerUser(name, email, password);
      setIsAdmin(false);
      setUser(user);
      Alert.alert('Success! 🎉', 'Account created successfully!', [
        { text: 'Start Shopping', onPress: () => navigation.replace('Home') },
      ]);
    } catch (error) {
      Alert.alert('Signup Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <InputField label="Full Name" placeholder="Your full name" value={name} onChangeText={setName} leftIcon="👤" />
      <InputField label="Email" placeholder="your@email.com" value={email} onChangeText={setEmail} leftIcon="✉️" keyboardType="email-address" />
      <InputField
        label="Password" placeholder="Create password"
        value={password} onChangeText={setPassword}
        secureTextEntry={!showPass} leftIcon="🔒"
        rightIcon={
          <TouchableOpacity onPress={() => setShowPass(!showPass)}>
            <Text style={styles.eyeIcon}>{showPass ? '🙈' : '👁️'}</Text>
          </TouchableOpacity>
        }
      />
      <InputField label="Confirm Password" placeholder="Re-enter password" value={confirmPass} onChangeText={setConfirmPass} secureTextEntry leftIcon="🔒" />

      <TouchableOpacity style={styles.checkRow} onPress={() => setAgreed(!agreed)}>
        <View style={[styles.checkbox, agreed && styles.checkboxActive]}>
          {agreed && <Text style={styles.checkMark}>✓</Text>}
        </View>
        <Text style={styles.rememberText}>
          I agree to <Text style={styles.switchLink}>Terms & Conditions</Text>
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.primaryBtn, { marginTop: 20 }, loading && { opacity: 0.7 }]}
        onPress={handleSignup}
        disabled={loading}
      >
        <Text style={styles.primaryBtnText}>{loading ? 'Creating...' : 'Create Account'}</Text>
      </TouchableOpacity>

      <View style={styles.switchRow}>
        <Text style={styles.switchText}>Already have an account? </Text>
        <TouchableOpacity><Text style={styles.switchLink}>Login</Text></TouchableOpacity>
      </View>
    </View>
  );
};

// ── Main Screen ──────────────────────────────────────────────
const LoginScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('login');

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScrollView style={styles.screen} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

        {/* Decorative blobs */}
        <View style={styles.blobTopRight} />
        <View style={styles.blobTopLeft} />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>🛍️ ShopSmart</Text>
          <Text style={styles.welcomeTitle}>
            {activeTab === 'login' ? 'Welcome Back ✨' : 'Join Us Today'}
          </Text>
          <Text style={styles.welcomeSub}>
            {activeTab === 'login' ? 'Sign in to continue shopping' : 'Create your account'}
          </Text>
        </View>

        {/* Tab Switcher */}
        <View style={styles.tabSwitcher}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'login' && styles.tabBtnActive]}
            onPress={() => setActiveTab('login')}
          >
            <Text style={[styles.tabText, activeTab === 'login' && styles.tabTextActive]}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'signup' && styles.tabBtnActive]}
            onPress={() => setActiveTab('signup')}
          >
            <Text style={[styles.tabText, activeTab === 'signup' && styles.tabTextActive]}>Sign Up</Text>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          {activeTab === 'login'
            ? <LoginForm navigation={navigation} />
            : <SignupForm navigation={navigation} />
          }
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// ── Styles ───────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { paddingBottom: 48 },

  blobTopRight: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: '#FDECEA', top: -60, right: -60, opacity: 0.8 },
  blobTopLeft:  { position: 'absolute', width: 120, height: 120, borderRadius: 60,  backgroundColor: '#F7C5BC', top: 60,  right: 30,  opacity: 0.4 },

  header: { paddingTop: 68, paddingHorizontal: 28, marginBottom: 28 },
  logo: { fontSize: 16, fontWeight: '700', color: COLORS.roseGold, marginBottom: 14 },
  welcomeTitle: { fontFamily: 'serif', fontSize: 28, fontWeight: '700', color: COLORS.roseGoldDark, marginBottom: 6 },
  welcomeSub: { fontSize: 14, color: COLORS.textSecondary },

  tabSwitcher: { flexDirection: 'row', marginHorizontal: 28, backgroundColor: COLORS.blush, borderRadius: 50, padding: 4, marginBottom: 28 },
  tabBtn: { flex: 1, paddingVertical: 11, alignItems: 'center', borderRadius: 50 },
  tabBtnActive: { backgroundColor: COLORS.roseGold },
  tabText: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary },
  tabTextActive: { color: COLORS.white },

  formContainer: { paddingHorizontal: 28 },

  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 8 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.inputBg, borderWidth: 1, borderColor: COLORS.border, borderRadius: 14, paddingHorizontal: 14, height: 52 },
  inputIcon: { fontSize: 16, marginRight: 10 },
  input: { flex: 1, fontSize: 14, color: COLORS.textPrimary },
  eyeIcon: { fontSize: 16, paddingLeft: 8 },

  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, marginTop: 4 },
  checkRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  checkbox: { width: 20, height: 20, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 5, marginRight: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.white },
  checkboxActive: { backgroundColor: COLORS.roseGold, borderColor: COLORS.roseGold },
  checkMark: { color: COLORS.white, fontSize: 12, fontWeight: '700' },
  rememberText: { fontSize: 13, color: COLORS.textSecondary },
  forgotText: { fontSize: 13, color: COLORS.roseGold, fontWeight: '500' },

  adminHint: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF6E8', borderWidth: 1, borderColor: '#F5A62340', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 18, gap: 8 },
  adminHintIcon: { fontSize: 14 },
  adminHintText: { fontSize: 12, color: COLORS.textSecondary, flex: 1 },

  primaryBtn: { backgroundColor: COLORS.roseGold, borderRadius: 14, height: 54, alignItems: 'center', justifyContent: 'center', shadowColor: COLORS.roseGold, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  primaryBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },

  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  dividerText: { fontSize: 12, color: COLORS.textMuted, marginHorizontal: 12 },

  googleBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border, borderRadius: 14, height: 52, backgroundColor: COLORS.white, gap: 10 },
  googleIcon: { fontSize: 18, fontWeight: '800', color: '#4285F4' },
  googleText: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary },

  switchRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  switchText: { fontSize: 13, color: COLORS.textSecondary },
  switchLink: { fontSize: 13, fontWeight: '700', color: COLORS.roseGold },
});

export default LoginScreen;