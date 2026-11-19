import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Vibration,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, layout } from '../theme';
import { useSecurity } from '../context/SecurityContext';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

export const PinLockScreen: React.FC = () => {
  const { unlockApp, verifyPin, isBiometricEnabled, hasHardwareBiometric, promptBiometricUnlock } =
    useSecurity();
  const { currentUser, logout } = useAuth();
  const { isDarkMode } = useApp();

  const themeColors = isDarkMode ? colors.dark : colors;

  const [pin, setPin] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Auto-prompt biometric on screen open if enabled
  useEffect(() => {
    if (isBiometricEnabled && hasHardwareBiometric) {
      void promptBiometricUnlock();
    }
  }, [isBiometricEnabled, hasHardwareBiometric, promptBiometricUnlock]);

  const handleKeyPress = async (num: string) => {
    if (pin.length >= 4) return;
    const nextPin = pin + num;
    setPin(nextPin);
    setErrorMsg(null);

    if (nextPin.length === 4) {
      const isValid = await verifyPin(nextPin);
      if (isValid) {
        unlockApp();
      } else {
        Vibration.vibrate(100);
        setErrorMsg('PIN si sahihi. Jaribu tena.');
        setPin('');
      }
    }
  };

  const handleDelete = () => {
    if (pin.length > 0) {
      setPin(pin.slice(0, -1));
      setErrorMsg(null);
    }
  };

  const keypadRows = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['BIO', '0', 'DEL'],
  ];

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? colors.dark.background : colors.background },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.logoBadge}>
          <Ionicons name="shield-checkmark" size={32} color="#FFFFFF" />
        </View>
        <Text style={[styles.title, { color: themeColors.text }]}>
          DMS Quick Lock
        </Text>
        <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
          Habari {currentUser?.name}, weka PIN yako ya namba 4
        </Text>
      </View>

      {/* PIN Dots */}
      <View style={styles.dotsContainer}>
        {[0, 1, 2, 3].map((index) => {
          const isFilled = pin.length > index;
          return (
            <View
              key={index}
              style={[
                styles.dot,
                {
                  backgroundColor: isFilled
                    ? colors.primary
                    : isDarkMode
                    ? '#334155'
                    : '#CBD5E1',
                  borderColor: isFilled ? colors.primary : themeColors.border,
                },
              ]}
            />
          );
        })}
      </View>

      {errorMsg ? (
        <Text style={styles.errorText}>{errorMsg}</Text>
      ) : (
        <View style={{ height: 20 }} />
      )}

      {/* Keypad */}
      <View style={styles.keypad}>
        {keypadRows.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.keypadRow}>
            {row.map((item, colIndex) => {
              if (item === 'BIO') {
                if (!isBiometricEnabled || !hasHardwareBiometric) {
                  return <View key={colIndex} style={styles.keyBtnEmpty} />;
                }
                return (
                  <TouchableOpacity
                    key={colIndex}
                    style={[styles.keyBtn, styles.specialKeyBtn]}
                    onPress={() => void promptBiometricUnlock()}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="finger-print" size={28} color={colors.primary} />
                  </TouchableOpacity>
                );
              }

              if (item === 'DEL') {
                return (
                  <TouchableOpacity
                    key={colIndex}
                    style={[styles.keyBtn, styles.specialKeyBtn]}
                    onPress={handleDelete}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="backspace-outline"
                      size={24}
                      color={themeColors.textSecondary}
                    />
                  </TouchableOpacity>
                );
              }

              return (
                <TouchableOpacity
                  key={colIndex}
                  style={[
                    styles.keyBtn,
                    {
                      backgroundColor: isDarkMode ? colors.dark.card : colors.card,
                      borderColor: themeColors.border,
                    },
                  ]}
                  onPress={() => void handleKeyPress(item)}
                  activeOpacity={0.6}
                >
                  <Text style={[styles.keyText, { color: themeColors.text }]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>

      {/* Switch to Full Password / Logout */}
      <TouchableOpacity
        style={styles.forgotBtn}
        onPress={() => logout()}
        activeOpacity={0.7}
      >
        <Text style={styles.forgotBtnText}>Umesahau PIN? Toka na uingie kwa nenosiri</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: 80,
    paddingBottom: 40,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
  },
  logoBadge: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    ...layout.shadowLg,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 6,
    textAlign: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginVertical: spacing.xl,
  },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: '600',
    height: 20,
  },
  keypad: {
    width: '100%',
    maxWidth: 320,
    gap: 16,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  keyBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    ...layout.shadow,
  },
  specialKeyBtn: {
    borderWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
    backgroundColor: 'transparent',
  },
  keyBtnEmpty: {
    width: 72,
    height: 72,
  },
  keyText: {
    fontSize: 26,
    fontWeight: '700',
  },
  forgotBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  forgotBtnText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});
