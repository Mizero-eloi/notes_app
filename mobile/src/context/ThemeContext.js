// src/context/ThemeContext.js
import React, { createContext } from 'react';

// Create and export the context directly
export const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const theme = {
    colors: {
      primary: '#6200ee',
      primaryVariant: '#3700b3',
      secondary: '#03dac6',
      secondaryVariant: '#018786',
      background: '#ffffff',
      surface: '#ffffff',
      error: '#b00020',
      onPrimary: '#ffffff',
      onSecondary: '#000000',
      onBackground: '#000000',
      onSurface: '#000000',
      onError: '#ffffff',
      text: '#333333',
      textSecondary: '#757575',
      divider: '#e0e0e0',
      white: '#ffffff',
      lightGray: '#f5f5f5',
      pending: '#FF9800',
      synced: '#4CAF50',
      offline: '#F44336',
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
    },
    borderRadius: {
      sm: 4,
      md: 8,
      lg: 16,
      xl: 24,
    },
    shadows: {
      sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.18,
        shadowRadius: 1.0,
        elevation: 1,
      },
      md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
        elevation: 3,
      },
      lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
      },
    },
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};