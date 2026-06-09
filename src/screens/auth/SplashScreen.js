import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  StatusBar,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

const SplashScreen = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const barWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade + scale in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();

    // Progress bar animation
    Animated.timing(barWidth, {
      toValue: width * 0.45,
      duration: 2500,
      useNativeDriver: false,
    }).start();

    // Navigate after 3 seconds
    const timer = setTimeout(() => {
      navigation.replace('Login');
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Logo Icon */}
      <Animated.View
        style={[
          styles.logoWrapper,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        ]}
      >
        <View style={styles.logoBox}>
          {/* Shopping bag SVG-style using View */}
          <View style={styles.bagHandle} />
          <View style={styles.bagBody}>
            <View style={styles.bagInner} />
          </View>
        </View>
      </Animated.View>

      {/* App Name */}
      <Animated.View style={{ opacity: fadeAnim }}>
        <Text style={styles.appName}>ShopSmart</Text>
        <Text style={styles.tagline}>Elegance at your fingertips</Text>
      </Animated.View>

      {/* Progress Bar */}
      <View style={styles.barContainer}>
        <Animated.View style={[styles.bar, { width: barWidth }]} />
      </View>

      {/* Version */}
      <Text style={styles.version}>v1.0.0</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Logo
  logoWrapper: {
    marginBottom: 32,
  },
  logoBox: {
    width: 110,
    height: 110,
    borderRadius: 28,
    backgroundColor: '#C9967A',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#C9967A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
  bagHandle: {
    width: 30,
    height: 14,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    borderBottomWidth: 0,
    marginBottom: -2,
    zIndex: 1,
  },
  bagBody: {
    width: 48,
    height: 38,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bagInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },

  // Text
  appName: {
    fontFamily: 'serif',
    fontSize: 38,
    fontWeight: '700',
    color: '#A87060',
    textAlign: 'center',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 15,
    color: '#BFB0AE',
    textAlign: 'center',
    fontWeight: '400',
    letterSpacing: 0.3,
  },

  // Progress bar
  barContainer: {
    marginTop: 48,
    width: width * 0.45,
    height: 2.5,
    backgroundColor: '#F2D4D0',
    borderRadius: 10,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    backgroundColor: '#C9967A',
    borderRadius: 10,
  },

  // Version
  version: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    fontSize: 11,
    color: '#BFB0AE',
  },
});

export default SplashScreen;