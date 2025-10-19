import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEMES = {
  gray: {
    name: 'Gray',
    backgroundDark: '#0e0e0eff',
    backgroundLight: '#4A4A4A',
    accent: '#594d9eff',
    card: '#303030ff',
    text: '#E8E8E8',
    textMuted: '#A0A0A0',
    active: '#5851b4ff'
  },
  purple: {
    name: 'Purple',
    backgroundDark: '#1A0B2E',
    backgroundLight: '#3A2B69',
    accent: '#7B42F6',
    card: '#2A1D52',
    text: '#FFFFFF',
    textMuted: '#B8B5CC',
    active: '#FF4D8D'
  },
  blue: {
    name: 'Blue',
    backgroundDark: '#0F1A2E',
    backgroundLight: '#1E3A5F',
    accent: '#3B82F6',
    card: '#1E293B',
    text: '#F1F5F9',
    textMuted: '#94A3B8',
    active: '#60A5FA'
  },
  velvet: {
        name: 'Velvet',
        backgroundDark: '#22192eff',
        backgroundLight: '#3f2e4eff',
        accent: '#51419a',
        card: '#392e4eff',
        text: '#FFFFFF',
        textMuted: '#b3b3b3ff',
        active: '#d471ccff'
    }
};

const TimeBlockContext = createContext();

export function TimeBlockProvider({ children }) {
  const [blocks, setBlocks] = useState([]);
  const [currentTheme, setCurrentTheme] = useState('gray');

  // Load saved theme on app start
  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('@app_theme');
      if (savedTheme && THEMES[savedTheme]) {
        setCurrentTheme(savedTheme);
      }
    } catch (error) {
      console.log('Error loading theme:', error);
    }
  };

  const switchTheme = async (themeName) => {
    if (THEMES[themeName]) {
      setCurrentTheme(themeName);
      try {
        await AsyncStorage.setItem('@app_theme', themeName);
      } catch (error) {
        console.log('Error saving theme:', error);
      }
    }
  };

  return (
    <TimeBlockContext.Provider value={{ 
      blocks, 
      setBlocks,
      colors: THEMES[currentTheme],
      currentTheme,
      switchTheme,
      themes: THEMES
    }}>
      {children}
    </TimeBlockContext.Provider>
  );
}

export function useTimeBlocks() {
  return useContext(TimeBlockContext);
}