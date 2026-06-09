import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();
export const useTheme = () => useContext(ThemeContext);

const lightTheme = {
  bg: '#FFFFFF',
  card: '#F7E8E4',
  text: '#1A1A1A',
  subtext: '#8A7B78',
  border: '#F2D4D0',
  primary: '#C9967A',
  accent: '#E8C4B8',
  inputBg: '#FDF0EE',
  blush: '#FDECEA',
};

const darkTheme = {
  bg: '#1C0A1A',
  card: '#2D1225',
  text: '#F5E6E0',
  subtext: '#B08080',
  border: '#4A2040',
  primary: '#C9956C',
  accent: '#E8B4A0',
  inputBg: '#2D1225',
  blush: '#3D1530',
};

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false); // default light

  // ✅ App open hone pe saved preference load karo
  useEffect(() => {
    AsyncStorage.getItem('theme_preference').then(val => {
      if (val !== null) setIsDark(val === 'dark');
    });
  }, []);

  // ✅ Toggle + save
  const toggleTheme = async () => {
    const newVal = !isDark;
    setIsDark(newVal);
    await AsyncStorage.setItem('theme_preference', newVal ? 'dark' : 'light');
  };

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
}