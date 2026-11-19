import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { useSecurity } from '../context/SecurityContext';

// Screens
import { LoginScreen } from '../screens/LoginScreen';
import { PinLockScreen } from '../screens/PinLockScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { InventoryScreen } from '../screens/InventoryScreen';
import { SalesScreen } from '../screens/SalesScreen';
import { TransfersScreen } from '../screens/TransfersScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { ReceiveStockScreen } from '../screens/ReceiveStockScreen';
import { RecordSaleScreen } from '../screens/RecordSaleScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
  const { isDarkMode, t } = useApp();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: isDarkMode ? '#94A3B8' : '#64748B',
        tabBarStyle: {
          backgroundColor: isDarkMode ? colors.dark.card : colors.card,
          borderTopColor: isDarkMode ? colors.dark.border : colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
        },
      }}
    >
      <Tab.Screen
        name="DashboardTab"
        component={DashboardScreen}
        options={{
          tabBarLabel: t.tabDashboard,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="InventoryTab"
        component={InventoryScreen}
        options={{
          tabBarLabel: t.tabInventory,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bicycle-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="SalesTab"
        component={SalesScreen}
        options={{
          tabBarLabel: t.tabSales,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cart-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="TransfersTab"
        component={TransfersScreen}
        options={{
          tabBarLabel: t.tabTransfers,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="swap-horizontal-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsScreen}
        options={{
          tabBarLabel: t.tabSettings,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const { currentUser, isLoading } = useAuth();
  const { isDarkMode } = useApp();
  const { isAppLocked } = useSecurity();

  if (isLoading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: isDarkMode ? colors.dark.background : colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Quick 4-Digit PIN Lock Screen
  if (currentUser && isAppLocked) {
    return <PinLockScreen />;
  }

  const navTheme = isDarkMode ? DarkTheme : DefaultTheme;

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!currentUser ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Group screenOptions={{ presentation: 'modal' }}>
              <Stack.Screen name="ReceiveStockModal" component={ReceiveStockScreen} />
              <Stack.Screen name="RecordSaleModal" component={RecordSaleScreen} />
            </Stack.Group>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
