import { createContext, useContext, useEffect, useState } from 'react';
import { db, doc, getDoc } from '../config/firebase';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState({
    primaryColor: '#3B82F6',
    secondaryColor: '#1F2937',
    accentColor: '#10B981',
    darkMode: true
  });

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const settingsDoc = await getDoc(doc(db, 'settings', 'global'));
      if (settingsDoc.exists() && settingsDoc.data().theme) {
        setTheme(settingsDoc.data().theme);
      }
    } catch (error) {
      console.error('Failed to load theme:', error);
    }
  };

  // Apply theme to document
  useEffect(() => {
    document.documentElement.style.setProperty('--color-primary', theme.primaryColor);
    document.documentElement.style.setProperty('--color-secondary', theme.secondaryColor);
    document.documentElement.style.setProperty('--color-accent', theme.accentColor);
    
    if (theme.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, loadTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext); 