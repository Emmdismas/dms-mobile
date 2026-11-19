import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';

const PIN_KEY = '@dms_quick_pin';
const BIOMETRIC_ENABLED_KEY = '@dms_biometric_enabled';
const PIN_ENABLED_KEY = '@dms_pin_enabled';

interface SecurityContextType {
  isPinEnabled: boolean;
  isBiometricEnabled: boolean;
  hasHardwareBiometric: boolean;
  isAppLocked: boolean;
  unlockApp: () => void;
  lockApp: () => void;
  verifyPin: (pin: string) => Promise<boolean>;
  setNewPin: (pin: string) => Promise<void>;
  disablePin: () => Promise<void>;
  toggleBiometric: (enabled: boolean) => Promise<void>;
  promptBiometricUnlock: () => Promise<boolean>;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export const SecurityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isPinEnabled, setIsPinEnabled] = useState(false);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const [hasHardwareBiometric, setHasHardwareBiometric] = useState(false);
  const [isAppLocked, setIsAppLocked] = useState(false);

  useEffect(() => {
    void initializeSecurity();
  }, []);

  const initializeSecurity = async () => {
    try {
      const [savedPin, savedBiometricPref, savedPinEnabled] = await Promise.all([
        AsyncStorage.getItem(PIN_KEY),
        AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY),
        AsyncStorage.getItem(PIN_ENABLED_KEY),
      ]);

      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      setHasHardwareBiometric(hasHardware && isEnrolled);

      const pinActive = savedPinEnabled === 'true' && !!savedPin;
      setIsPinEnabled(pinActive);
      setIsBiometricEnabled(savedBiometricPref === 'true');

      // If PIN is enabled, lock app initially on boot
      if (pinActive) {
        setIsAppLocked(true);
      }
    } catch {
      // ignore init error
    }
  };

  const unlockApp = () => {
    setIsAppLocked(false);
  };

  const lockApp = () => {
    if (isPinEnabled) {
      setIsAppLocked(true);
    }
  };

  const verifyPin = async (inputPin: string): Promise<boolean> => {
    const savedPin = await AsyncStorage.getItem(PIN_KEY);
    return savedPin === inputPin;
  };

  const setNewPin = async (newPin: string): Promise<void> => {
    await AsyncStorage.setItem(PIN_KEY, newPin);
    await AsyncStorage.setItem(PIN_ENABLED_KEY, 'true');
    setIsPinEnabled(true);
  };

  const disablePin = async () => {
    await AsyncStorage.removeItem(PIN_KEY);
    await AsyncStorage.setItem(PIN_ENABLED_KEY, 'false');
    await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, 'false');
    setIsPinEnabled(false);
    setIsBiometricEnabled(false);
    setIsAppLocked(false);
  };

  const toggleBiometric = async (enabled: boolean) => {
    setIsBiometricEnabled(enabled);
    await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, enabled ? 'true' : 'false');
  };

  const promptBiometricUnlock = async (): Promise<boolean> => {
    try {
      const res = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Weka alama ya kidole kufungua DMS',
        cancelLabel: 'Tumia PIN',
        fallbackLabel: 'Weka PIN',
      });

      if (res.success) {
        setIsAppLocked(false);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  return (
    <SecurityContext.Provider
      value={{
        isPinEnabled,
        isBiometricEnabled,
        hasHardwareBiometric,
        isAppLocked,
        unlockApp,
        lockApp,
        verifyPin,
        setNewPin,
        disablePin,
        toggleBiometric,
        promptBiometricUnlock,
      }}
    >
      {children}
    </SecurityContext.Provider>
  );
};

export const useSecurity = (): SecurityContextType => {
  const ctx = useContext(SecurityContext);
  if (!ctx) {
    throw new Error('useSecurity must be used within SecurityProvider');
  }
  return ctx;
};
