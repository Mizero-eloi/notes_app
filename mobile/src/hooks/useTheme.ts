// src/hooks/useTheme.js
import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

export default function useTheme() {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context; // Returns the full theme object
}