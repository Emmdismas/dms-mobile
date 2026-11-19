import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, layout } from '../theme';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { apiClient } from '../api/client';

export const LoginScreen: React.FC = () => {
  const { login } = useAuth();
  const { isDarkMode, t, language, toggleLanguage } = useApp();

  const [username, setUsername] = useState('owner@nassor.co.tz');
  const [password, setPassword] = useState('Nassor@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Server settings modal
  const [showServerConfig, setShowServerConfig] = useState(false);
  const [customServerUrl, setCustomServerUrl] = useState('');

  const themeColors = isDarkMode ? colors.dark : colors;

  const handleLogin = async () => {
    if (!username.trim() || !password) {
      setErrorMsg(language === 'sw' ? 'Tafadhali jaza barua pepe na nenosiri' : 'Please enter email and password');
      return;
    }

    setErrorMsg(null);
    setIsLoading(true);

    try {
      await login(username, password);
    } catch (err: any) {
      setErrorMsg(err.message || t.loginError);
    } finally {
      setIsLoading(false);
    }
  };

  const openServerConfig = async () => {
    const currentUrl = await apiClient.getBaseUrl();
    setCustomServerUrl(currentUrl);
    setShowServerConfig(true);
  };

  const saveServerConfig = async () => {
    if (!customServerUrl.trim()) return;
    await apiClient.setBaseUrl(customServerUrl.trim());
    setShowServerConfig(false);
    Alert.alert(
      language === 'sw' ? 'Imefanikiwa' : 'Success',
      language === 'sw' ? 'Anuani ya seva imesasishwa.' : 'Server URL updated successfully.',
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { backgroundColor: isDarkMode ? colors.dark.background : colors.background },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.topBar}>
          <TouchableOpacity
            style={[styles.langButton, { backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9' }]}
            onPress={toggleLanguage}
            activeOpacity={0.7}
          >
            <Ionicons name="globe-outline" size={16} color={colors.primary} />
            <Text style={styles.langText}>{language === 'sw' ? 'English' : 'Kiswahili'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.serverButton, { backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9' }]}
            onPress={openServerConfig}
            activeOpacity={0.7}
          >
            <Ionicons name="server-outline" size={16} color={colors.navy} />
            <Text style={styles.serverText}>API Host</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.logoSection}>
          <View style={styles.logoCircle}>
            <Ionicons name="speedometer" size={40} color="#FFFFFF" />
          </View>
          <Text style={[styles.brandTitle, { color: themeColors.text }]}>DMS MOBILE</Text>
          <Text style={[styles.brandSubtitle, { color: themeColors.textSecondary }]}>
            {t.tagline}
          </Text>
        </View>

        <View
          style={[
            styles.card,
            {
              backgroundColor: isDarkMode ? colors.dark.card : colors.card,
              borderColor: themeColors.border,
            },
          ]}
        >
          <Text style={[styles.cardTitle, { color: themeColors.text }]}>
            {t.welcomeBack}
          </Text>

          {errorMsg ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={18} color={colors.danger} />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          {/* Username Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: themeColors.textSecondary }]}>
              {t.emailOrPhone}
            </Text>
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC',
                  borderColor: themeColors.border,
                },
              ]}
            >
              <Ionicons name="mail-outline" size={18} color={colors.primary} />
              <TextInput
                style={[styles.input, { color: themeColors.text }]}
                placeholder="owner@nassor.co.tz"
                placeholderTextColor={themeColors.textMuted}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!isLoading}
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: themeColors.textSecondary }]}>
              {t.password}
            </Text>
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC',
                  borderColor: themeColors.border,
                },
              ]}
            >
              <Ionicons name="lock-closed-outline" size={18} color={colors.primary} />
              <TextInput
                style={[styles.input, { color: themeColors.text }]}
                placeholder="••••••••"
                placeholderTextColor={themeColors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                editable={!isLoading}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color={themeColors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, isLoading && { opacity: 0.8 }]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Text style={styles.submitButtonText}>{t.login}</Text>
                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Server Config Modal */}
        {showServerConfig && (
          <View
            style={[
              styles.serverConfigBox,
              {
                backgroundColor: isDarkMode ? colors.dark.card : colors.card,
                borderColor: colors.primary,
              },
            ]}
          >
            <Text style={[styles.configTitle, { color: themeColors.text }]}>
              {language === 'sw' ? 'Sanidi Anuani ya Seva (API URL)' : 'Configure API Base URL'}
            </Text>
            <Text style={[styles.configHint, { color: themeColors.textSecondary }]}>
              {language === 'sw'
                ? 'Kwenye simu halisi, weka IP ya kompyuta yako (mfano http://192.168.1.50:8001/api/v1)'
                : 'On physical devices, use your local LAN IP (e.g. http://192.168.1.50:8001/api/v1)'}
            </Text>
            <TextInput
              style={[
                styles.configInput,
                {
                  color: themeColors.text,
                  backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC',
                  borderColor: themeColors.border,
                },
              ]}
              value={customServerUrl}
              onChangeText={setCustomServerUrl}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <View style={styles.configActions}>
              <TouchableOpacity
                style={styles.cancelConfigBtn}
                onPress={() => setShowServerConfig(false)}
              >
                <Text style={styles.cancelConfigText}>{t.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveConfigBtn} onPress={saveServerConfig}>
                <Text style={styles.saveConfigText}>{t.save}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.footerNote}>
          <Text style={[styles.versionText, { color: themeColors.textMuted }]}>
            DMS Mobile v1.0.0 • Connected to Laravel REST API
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: spacing.xl,
    justifyContent: 'center',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  langButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  langText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  serverButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  serverText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.navy,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  logoCircle: {
    width: 76,
    height: 76,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    ...layout.shadowLg,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 1,
  },
  brandSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 4,
    textAlign: 'center',
  },
  card: {
    borderRadius: layout.borderRadiusLg,
    padding: spacing.xl,
    borderWidth: 1,
    ...layout.shadow,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacing.lg,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.dangerLight,
    padding: spacing.md,
    borderRadius: layout.borderRadiusSm,
    marginBottom: spacing.md,
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: layout.borderRadiusSm,
    paddingHorizontal: spacing.md,
    minHeight: layout.minTouchTarget,
  },
  input: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 10,
  },
  submitButton: {
    backgroundColor: colors.primary,
    minHeight: layout.minTouchTarget,
    borderRadius: layout.borderRadiusSm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: spacing.md,
    ...layout.shadow,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  serverConfigBox: {
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: layout.borderRadius,
    borderWidth: 1,
  },
  configTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  configHint: {
    fontSize: 11,
    marginVertical: 4,
  },
  configInput: {
    borderWidth: 1,
    borderRadius: layout.borderRadiusSm,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12,
    fontFamily: 'monospace',
    marginVertical: 6,
  },
  configActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 4,
  },
  cancelConfigBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  cancelConfigText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  saveConfigBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  saveConfigText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  footerNote: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 11,
    fontWeight: '500',
  },
});
