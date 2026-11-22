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
  ImageBackground,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, layout } from '../theme';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { apiClient } from '../api/client';

export const LoginScreen: React.FC = () => {
  const { login } = useAuth();
  const { isDarkMode, toggleTheme, t, language, toggleLanguage } = useApp();

  const [username, setUsername] = useState('owner@nassor.co.tz');
  const [password, setPassword] = useState('Nassor@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Server settings modal / dropdown
  const [showServerConfig, setShowServerConfig] = useState(false);
  const [customServerUrl, setCustomServerUrl] = useState('');

  const handleLogin = async () => {
    if (!username.trim() || !password) {
      setErrorMsg(
        language === 'sw'
          ? 'Tafadhali jaza barua pepe / simu na nenosiri'
          : 'Please enter your email/phone and password',
      );
      return;
    }

    setErrorMsg(null);
    setIsLoading(true);

    try {
      await login(username.trim(), password);
    } catch (err: any) {
      setErrorMsg(err.message || t.loginError);
    } finally {
      setIsLoading(false);
    }
  };

  const openServerConfig = async () => {
    const currentUrl = await apiClient.getBaseUrl();
    setCustomServerUrl(currentUrl);
    setShowServerConfig(!showServerConfig);
  };

  const saveServerConfig = async () => {
    if (!customServerUrl.trim()) return;
    await apiClient.setBaseUrl(customServerUrl.trim());
    setShowServerConfig(false);
    Alert.alert(
      language === 'sw' ? 'Imefanikiwa' : 'Success',
      language === 'sw'
        ? `Anuani ya API imeboreshwa: ${customServerUrl.trim()}`
        : `API Base URL updated: ${customServerUrl.trim()}`,
    );
  };

  return (
    <ImageBackground
      source={require('../../assets/dms-hero-bg.jpg')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
      />
      {/* Daylight / Dark Glassmorphism Overlay */}
      <View
        style={[
          styles.overlay,
          isDarkMode ? styles.overlayDark : styles.overlayLight,
        ]}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Top Bar Navigation */}
            <View style={styles.topBar}>
              <View style={styles.badgePill}>
                <View style={styles.statusDot} />
                <Text style={styles.badgePillText}>
                  {language === 'sw' ? 'Enterprise Portal' : 'Enterprise Portal'}
                </Text>
              </View>

              <View style={styles.topBarRight}>
                {/* Language Toggle */}
                <TouchableOpacity
                  style={styles.topIconBtn}
                  onPress={toggleLanguage}
                  activeOpacity={0.7}
                >
                  <Text style={styles.langFlagText}>
                    {language === 'en' ? '🇬🇧 EN' : '🇹🇿 SW'}
                  </Text>
                </TouchableOpacity>

                {/* Dark / Light Toggle */}
                <TouchableOpacity
                  style={styles.topIconBtn}
                  onPress={toggleTheme}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={isDarkMode ? 'sunny' : 'moon'}
                    size={16}
                    color="#0F172A"
                  />
                </TouchableOpacity>

                {/* Server Host Button */}
                <TouchableOpacity
                  style={styles.topIconBtn}
                  onPress={openServerConfig}
                  activeOpacity={0.7}
                >
                  <Ionicons name="server-outline" size={16} color="#0F172A" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Server Config Dropdown */}
            {showServerConfig && (
              <View
                style={[
                  styles.glassCard,
                  styles.serverConfigCard,
                  isDarkMode && styles.glassCardDark,
                ]}
              >
                <View style={styles.configHeader}>
                  <Ionicons name="hardware-chip-outline" size={18} color="#059669" />
                  <Text style={[styles.configTitle, isDarkMode && styles.textDark]}>
                    {language === 'sw' ? 'Sanidi Anuani ya API' : 'API Endpoint Configuration'}
                  </Text>
                </View>
                <Text style={[styles.configHint, isDarkMode && styles.textMutedDark]}>
                  {language === 'sw'
                    ? 'Weka IP ya mtandao wako wa ndani (mfano: http://192.168.1.100:8005/api/v1)'
                    : 'Enter host IP for LAN device testing (e.g. http://192.168.1.100:8005/api/v1)'}
                </Text>
                <TextInput
                  style={[styles.configInput, isDarkMode && styles.configInputDark]}
                  value={customServerUrl}
                  onChangeText={setCustomServerUrl}
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholder="http://10.0.2.2:8005/api/v1"
                  placeholderTextColor="#94A3B8"
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

            {/* Main Brand Section */}
            <View style={styles.brandHero}>
              <View style={styles.logoBadge}>
                <Ionicons name="speedometer" size={32} color="#059669" />
              </View>
              <Text style={[styles.brandTitle, isDarkMode && styles.textDark]}>
                Dealer Management System
              </Text>
              <Text style={styles.brandSubtitle}>
                2W & 3W ERP • MULTI-DEALER PLATFORM
              </Text>
              <Text style={[styles.brandDescription, isDarkMode && styles.textMutedDark]}>
                {language === 'sw'
                  ? 'Mfumo mkuu wa kidijitali wa usimamizi wa stoo, mauzo na namba za chassis kwa wauzaji wa pikipiki na bajaji.'
                  : 'Centralized enterprise operating portal for motorcycle & tricycle dealerships, VIN/chassis inventory, and sales.'}
              </Text>
            </View>

            {/* Login Glassmorphism Card */}
            <View
              style={[
                styles.glassCard,
                styles.loginCard,
                isDarkMode && styles.glassCardDark,
              ]}
            >
              <View style={styles.cardHeader}>
                <View>
                  <Text style={[styles.cardTitle, isDarkMode && styles.textDark]}>
                    {t.welcomeBack}
                  </Text>
                  <Text style={[styles.cardSubtitle, isDarkMode && styles.textMutedDark]}>
                    {language === 'sw'
                      ? 'Weka taarifa zako kuingia kwenye akaunti yako'
                      : 'Sign in to access your dealership workspace'}
                  </Text>
                </View>
              </View>

              {/* Error Message */}
              {errorMsg ? (
                <View style={styles.errorBanner}>
                  <Ionicons name="alert-circle" size={18} color="#DC2626" />
                  <Text style={styles.errorText}>{errorMsg}</Text>
                </View>
              ) : null}

              {/* Username / Email */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, isDarkMode && styles.textDark]}>
                  {t.emailOrPhone}
                </Text>
                <View
                  style={[
                    styles.inputWrapper,
                    isDarkMode && styles.inputWrapperDark,
                  ]}
                >
                  <Ionicons name="mail-outline" size={18} color="#059669" />
                  <TextInput
                    style={[styles.input, isDarkMode && styles.textDark]}
                    placeholder="owner@nassor.co.tz"
                    placeholderTextColor="#94A3B8"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    editable={!isLoading}
                  />
                </View>
              </View>

              {/* Password */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, isDarkMode && styles.textDark]}>
                  {t.password}
                </Text>
                <View
                  style={[
                    styles.inputWrapper,
                    isDarkMode && styles.inputWrapperDark,
                  ]}
                >
                  <Ionicons name="lock-closed-outline" size={18} color="#059669" />
                  <TextInput
                    style={[styles.input, isDarkMode && styles.textDark]}
                    placeholder="••••••••"
                    placeholderTextColor="#94A3B8"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    editable={!isLoading}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={18}
                      color="#64748B"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.primaryButton, isLoading && { opacity: 0.85 }]}
                onPress={handleLogin}
                disabled={isLoading}
                activeOpacity={0.85}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <Text style={styles.primaryButtonText}>{t.login}</Text>
                    <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                  </>
                )}
              </TouchableOpacity>

              {/* SSL Security Indicator */}
              <View style={styles.sslRow}>
                <Ionicons name="shield-checkmark" size={14} color="#059669" />
                <Text style={styles.sslText}>
                  {language === 'sw'
                    ? 'Muunganisho salama wenye usimbaji (SSL Encrypted)'
                    : 'End-to-end encrypted • Enterprise multi-branch'}
                </Text>
              </View>
            </View>

            {/* Generalized Fleet Highlights (2W & 3W) */}
            <View style={styles.fleetFeatureRow}>
              {/* 2W Card */}
              <View
                style={[
                  styles.fleetFeatureCard,
                  isDarkMode && styles.fleetFeatureCardDark,
                ]}
              >
                <View style={styles.featurePill}>
                  <Text style={styles.featurePillText}>2W • MOTORCYCLE</Text>
                </View>
                <Text style={[styles.featureTitle, isDarkMode && styles.textDark]}>
                  {language === 'sw' ? 'Pikipiki za Kibiashara' : 'Commercial 2-Wheelers'}
                </Text>
                <Text style={styles.featureDesc}>
                  {language === 'sw'
                    ? 'Usajili wa namba za chassis 17, PDI, stoo na mauzo ya mikataba.'
                    : '17-digit Chassis / VIN registration, PDI checks, cash & hire-purchase.'}
                </Text>
              </View>

              {/* 3W Card */}
              <View
                style={[
                  styles.fleetFeatureCard,
                  isDarkMode && styles.fleetFeatureCardDark,
                ]}
              >
                <View style={[styles.featurePill, styles.featurePillBlue]}>
                  <Text style={[styles.featurePillText, styles.featurePillTextBlue]}>
                    3W • TRICYCLE / BAJAJI
                  </Text>
                </View>
                <Text style={[styles.featureTitle, isDarkMode && styles.textDark]}>
                  {language === 'sw' ? 'Bajaji & Tricycles' : 'Passenger & Cargo 3W'}
                </Text>
                <Text style={styles.featureDesc}>
                  {language === 'sw'
                    ? 'Ufuatiliaji wa abiria na mizigo, matawi nchini na uhamisho.'
                    : 'Passenger & cargo models, inter-branch stock sync and receipts.'}
                </Text>
              </View>
            </View>

            {/* Bottom Credits / Version */}
            <View style={styles.footerNote}>
              <Text style={[styles.versionText, isDarkMode && styles.textMutedDark]}>
                DMS Enterprise v2.6 • REST API 8005 • Offline Capable
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
  },
  overlayLight: {
    backgroundColor: 'rgba(248, 250, 252, 0.88)',
  },
  overlayDark: {
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 56 : 46,
    paddingBottom: spacing.xxl,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.9)',
    gap: 6,
    ...layout.shadow,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#059669',
  },
  badgePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: 0.3,
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  topIconBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 32,
    ...layout.shadow,
  },
  langFlagText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  brandHero: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  logoBadge: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: '#ECFDF5',
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    ...layout.shadow,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  brandSubtitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#059669',
    marginTop: 3,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  brandDescription: {
    fontSize: 12,
    lineHeight: 18,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 320,
  },
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    padding: spacing.xl,
    ...layout.shadowLg,
  },
  glassCardDark: {
    backgroundColor: 'rgba(30, 41, 59, 0.88)',
    borderColor: 'rgba(51, 65, 85, 0.9)',
  },
  loginCard: {
    marginBottom: spacing.xl,
  },
  cardHeader: {
    marginBottom: spacing.lg,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: spacing.md,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    minHeight: 46,
    gap: 10,
  },
  inputWrapperDark: {
    backgroundColor: '#0F172A',
    borderColor: '#334155',
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    paddingVertical: 8,
  },
  primaryButton: {
    backgroundColor: '#059669',
    borderRadius: 12,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
    ...layout.shadow,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  sslRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: spacing.md,
  },
  sslText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  serverConfigCard: {
    marginBottom: spacing.lg,
    padding: spacing.md,
  },
  configHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  configTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  configHint: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 8,
  },
  configInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontSize: 12,
    color: '#0F172A',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginBottom: 8,
  },
  configInputDark: {
    backgroundColor: '#0F172A',
    borderColor: '#334155',
    color: '#F8FAFC',
  },
  configActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  cancelConfigBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  cancelConfigText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  saveConfigBtn: {
    backgroundColor: '#059669',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  saveConfigText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  fleetFeatureRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: spacing.xl,
  },
  fleetFeatureCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    ...layout.shadow,
  },
  fleetFeatureCardDark: {
    backgroundColor: 'rgba(30, 41, 59, 0.85)',
    borderColor: 'rgba(51, 65, 85, 0.8)',
  },
  featurePill: {
    alignSelf: 'flex-start',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
  },
  featurePillBlue: {
    backgroundColor: '#EFF6FF',
  },
  featurePillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#059669',
  },
  featurePillTextBlue: {
    color: '#2563EB',
  },
  featureTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 10,
    lineHeight: 14,
    color: '#64748B',
  },
  footerNote: {
    alignItems: 'center',
    marginTop: 4,
  },
  versionText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  textDark: {
    color: '#F8FAFC',
  },
  textMutedDark: {
    color: '#94A3B8',
  },
});
