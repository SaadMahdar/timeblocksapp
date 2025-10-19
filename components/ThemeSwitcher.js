import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTimeBlocks } from '../hooks/TimeBlockContext';

const ThemeSwitcher = () => {
  const { currentTheme, switchTheme, themes } = useTimeBlocks();

  const getNextTheme = () => {
    const themeKeys = Object.keys(themes);
    const currentIndex = themeKeys.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % themeKeys.length;
    return themeKeys[nextIndex];
  };

  return (
    <TouchableOpacity onPress={() => switchTheme(getNextTheme())}>
      <Ionicons 
        name="color-palette" 
        size={24} 
        color={themes[currentTheme].accent} 
      />
    </TouchableOpacity>
  );
};

export default ThemeSwitcher;