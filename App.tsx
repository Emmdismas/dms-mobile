import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { AppProvider, useApp } from './src/context/AppContext';
import { SecurityProvider } from './src/context/SecurityContext';
import { RootNavigator } from './src/navigation/RootNavigator';

function ThemedApp() {
  const { isDarkMode } = useApp();

  return (
    <>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <RootNavigator />
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <SecurityProvider>
          <AppProvider>
            <ThemedApp />
          </AppProvider>
        </SecurityProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
