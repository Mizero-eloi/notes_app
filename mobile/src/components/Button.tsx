import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import useTheme from '../hooks/useTheme';

export default function Button({ 
  title, 
  onPress, 
  type = 'primary', 
  loading = false,
  disabled = false,
  icon,
  style
}) {
  const theme  = useTheme();
  
  const getBackgroundColor = () => {
    if (disabled) return theme.colors.divider;
    
    switch (type) {
      case 'primary':
        return theme.colors.primary;
      case 'secondary':
        return theme.colors.secondary;
      case 'outline':
        return 'transparent';
      case 'danger':
        return theme.colors.error;
      default:
        return theme.colors.primary;
    }
  };
  
  const getTextColor = () => {
    if (disabled) return theme.colors.textSecondary;
    
    switch (type) {
      case 'primary':
        return theme.colors.onPrimary;
      case 'secondary':
        return theme.colors.onSecondary;
      case 'outline':
        return theme.colors.primary;
      case 'danger':
        return theme.colors.onError;
      default:
        return theme.colors.onPrimary;
    }
  };
  
  const getBorderColor = () => {
    if (type === 'outline') {
      return disabled ? theme.colors.divider : theme.colors.primary;
    }
    return 'transparent';
  };
  
  return (
    <TouchableOpacity
      style={[
        styles.button,
        { 
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: type === 'outline' ? 1 : 0,
        },
        style
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text style={[styles.text, { color: getTextColor() }]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    minWidth: 120,
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  iconContainer: {
    marginRight: 8,
  },
});