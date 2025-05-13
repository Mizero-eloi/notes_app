import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { useNetwork } from '../context/NetworkContext';
import useTheme from '../hooks/useTheme';

export default function OfflineBanner() {
  const theme  = useTheme();
  const { isConnected } = useNetwork();
  const [fadeAnim] = React.useState(new Animated.Value(0));

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: isConnected ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isConnected]);

  if (isConnected) return null;

  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          backgroundColor: theme.colors.offline,
          opacity: fadeAnim,
          transform: [{ 
            translateY: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [-50, 0]
            })
          }]
        }
      ]}
    >
      <Feather name="wifi-off" size={18} color={theme.colors.white} />
      <Text style={styles.text}>You are offline</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  text: {
    color: 'white',
    marginLeft: 8,
    fontWeight: 'bold',
  },
});