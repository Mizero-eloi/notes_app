
import { NetworkProvider } from '@/src/context/NetworkContext';
import { NotesProvider } from '@/src/context/NotesContext';
import { ThemeProvider } from '@/src/context/ThemeContext';
import AppNavigator from '@/src/navigation/AppNavigator';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';


LogBox.ignoreLogs([
    'Require cycle:',
    'AsyncStorage has been extracted from react-native core',
  ]);

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <ThemeProvider>
        <NetworkProvider>
          <NotesProvider>
            <AppNavigator />
          </NotesProvider>
        </NetworkProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}