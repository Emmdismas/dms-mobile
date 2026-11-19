import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, layout } from '../theme';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { useSecurity } from '../context/SecurityContext';
import { Header } from '../components/Header';
import { apiClient } from '../api/client';

export const SettingsScreen: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { isDarkMode, toggleTheme, language, toggleLanguage, t } = useApp();
  const {
    isPinEnabled,
    isBiometricEnabled,
    hasHardwareBiometric,
    lockApp,
    setNewPin,
    disablePin,
    toggleBiometric,
  } = useSecurity();

  const themeColors = isDarkMode ? colors.dark : colors;

  const [apiUrl, setApiUrl] = useState('');
  const [editingApiUrl, setEditingApiUrl] = useState(false);

  // PIN Setup Modal
  const [showPinModal, setShowPinModal] = useState(false);
  const [newPin, setNewPinInput] = useState('');
  const [confirmPin, setConfirmPinInput] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);

  const handleSavePin = async () => {
    if (newPin.length !== 4) {
      setPinError('PIN lazima iwe na namba 4 kamili');
      return;
    }
    if (newPin !== confirmPin) {
      setPinError('PIN hazilingani. Hakiki tena');
      return;
    }

    await setNewPin(newPin);
    setShowPinModal(false);
    setNewPinInput('');
    setConfirmPinInput('');
    setPinError(null);
    Alert.alert('Imefanikiwa', 'PIN mpya ya namba 4 imehifadhiwa kikamilifu!');
  };

  useEffect(() => {
    void (async () => {
      const url = await apiClient.getBaseUrl();
      setApiUrl(url);
    })();
  }, []);

  const handleSaveApiUrl = async () => {
    if (!apiUrl.trim()) return;
    await apiClient.setBaseUrl(apiUrl.trim());
    setEditingApiUrl(false);
    Alert.alert('Imefanikiwa', 'Anuani ya seva imesasishwa.');
  };

  const handleLogout = () => {
    Alert.alert(
      t.logout,
      'Je, una uhakika unataka kutoka kwenye mfumo wa DMS?',
      [
        { text: t.cancel, style: 'cancel' },
        {
          text: t.logout,
          style: 'destructive',
          onPress: () => logout(),
        },
      ],
    );
  };

  const initials = (currentUser?.name || 'User')
    .split(' ')
    .slice(0, 2)
    .map((s) => s[0])
    .join('')
    .toUpperCase();

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? colors.dark.background : colors.background }]}>
      <Header title={t.tabSettings} showBranchSelector={false} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* User Profile Card */}
        <View
          style={[
            styles.profileCard,
            {
              backgroundColor: isDarkMode ? colors.dark.card : colors.card,
              borderColor: themeColors.border,
            },
          ]}
        >
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>

          <View style={styles.profileInfo}>
            <Text style={[styles.userName, { color: themeColors.text }]} numberOfLines={1}>
              {currentUser?.name}
            </Text>
            <Text style={[styles.userContact, { color: themeColors.textSecondary }]} numberOfLines={1}>
              {currentUser?.email || currentUser?.phone}
            </Text>
            <View style={styles.roleBadgeRow}>
              <View style={styles.roleBadge}>
                <Text style={styles.roleBadgeText}>
                  {currentUser?.role?.toUpperCase()}
                </Text>
              </View>
              <Text style={[styles.dealerCodeText, { color: colors.primary }]}>
                {currentUser?.dealerCode}
              </Text>
            </View>
          </View>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.textSecondary }]}>
            {language === 'sw' ? 'Mapendeleo ya Mfumo' : 'Preferences'}
          </Text>

          <View
            style={[
              styles.settingsGroup,
              {
                backgroundColor: isDarkMode ? colors.dark.card : colors.card,
                borderColor: themeColors.border,
              },
            ]}
          >
            {/* Dark Mode */}
            <View style={styles.settingRow}>
              <View style={styles.settingLabelGroup}>
                <Ionicons name="moon-outline" size={20} color={colors.navy} />
                <Text style={[styles.settingLabel, { color: themeColors.text }]}>
                  {t.darkMode}
                </Text>
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={toggleTheme}
                trackColor={{ false: '#CBD5E1', true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={[styles.divider, { backgroundColor: themeColors.border }]} />

            {/* Language */}
            <TouchableOpacity
              style={styles.settingRow}
              onPress={toggleLanguage}
              activeOpacity={0.7}
            >
              <View style={styles.settingLabelGroup}>
                <Ionicons name="globe-outline" size={20} color={colors.primary} />
                <Text style={[styles.settingLabel, { color: themeColors.text }]}>
                  {t.language}
                </Text>
              </View>
              <View style={styles.valueRow}>
                <Text style={styles.valueText}>
                  {language === 'sw' ? 'Kiswahili' : 'English'}
                </Text>
                <Ionicons name="chevron-forward" size={16} color={themeColors.textSecondary} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Security & Quick PIN Lock Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.textSecondary }]}>
            {language === 'sw' ? 'Ulinzi & Kufungua Haraka' : 'Security & Quick Unlock'}
          </Text>

          <View
            style={[
              styles.settingsGroup,
              {
                backgroundColor: isDarkMode ? colors.dark.card : colors.card,
                borderColor: themeColors.border,
              },
            ]}
          >
            {/* Quick PIN */}
            <View style={styles.settingRow}>
              <View style={styles.settingLabelGroup}>
                <Ionicons name="keypad-outline" size={20} color={colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.settingLabel, { color: themeColors.text }]}>
                    {language === 'sw' ? 'PIN ya Namba 4 (Quick PIN)' : '4-Digit Quick PIN'}
                  </Text>
                  <Text style={[styles.urlText, { color: themeColors.textSecondary }]}>
                    {isPinEnabled ? 'Imewezeshwa' : 'Haijawezeshwa'}
                  </Text>
                </View>
              </View>
              <Switch
                value={isPinEnabled}
                onValueChange={(val) => {
                  if (val) {
                    setShowPinModal(true);
                  } else {
                    void disablePin();
                  }
                }}
                trackColor={{ false: '#CBD5E1', true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            {isPinEnabled && (
              <>
                <View style={[styles.divider, { backgroundColor: themeColors.border }]} />
                <TouchableOpacity
                  style={styles.settingRow}
                  onPress={() => setShowPinModal(true)}
                  activeOpacity={0.7}
                >
                  <View style={styles.settingLabelGroup}>
                    <Ionicons name="lock-closed-outline" size={20} color={colors.navy} />
                    <Text style={[styles.settingLabel, { color: themeColors.text }]}>
                      {language === 'sw' ? 'Badili PIN' : 'Change PIN'}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={themeColors.textSecondary} />
                </TouchableOpacity>

                {/* Fingerprint / Biometric */}
                {hasHardwareBiometric && (
                  <>
                    <View style={[styles.divider, { backgroundColor: themeColors.border }]} />
                    <View style={styles.settingRow}>
                      <View style={styles.settingLabelGroup}>
                        <Ionicons name="finger-print" size={20} color="#059669" />
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.settingLabel, { color: themeColors.text }]}>
                            {language === 'sw' ? 'Alama ya Kidole (Biometric)' : 'Fingerprint / Biometric'}
                          </Text>
                          <Text style={[styles.urlText, { color: themeColors.textSecondary }]}>
                            Fungua app papo hapo kwa kidole
                          </Text>
                        </View>
                      </View>
                      <Switch
                        value={isBiometricEnabled}
                        onValueChange={(val) => void toggleBiometric(val)}
                        trackColor={{ false: '#CBD5E1', true: '#059669' }}
                        thumbColor="#FFFFFF"
                      />
                    </View>
                  </>
                )}

                <View style={[styles.divider, { backgroundColor: themeColors.border }]} />
                <TouchableOpacity
                  style={styles.settingRow}
                  onPress={lockApp}
                  activeOpacity={0.7}
                >
                  <View style={styles.settingLabelGroup}>
                    <Ionicons name="shield-outline" size={20} color={colors.navy} />
                    <Text style={[styles.settingLabel, { color: colors.navy }]}>
                      {language === 'sw' ? 'Funga App Sasa (Test Lock)' : 'Lock App Now'}
                    </Text>
                  </View>
                  <Ionicons name="arrow-forward" size={16} color={colors.navy} />
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* Server Config Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.textSecondary }]}>
            {language === 'sw' ? 'Muunganisho wa Seva (API Endpoint)' : 'Server Connection'}
          </Text>

          <View
            style={[
              styles.settingsGroup,
              {
                backgroundColor: isDarkMode ? colors.dark.card : colors.card,
                borderColor: themeColors.border,
              },
            ]}
          >
            <View style={styles.settingRow}>
              <View style={styles.settingLabelGroup}>
                <Ionicons name="server-outline" size={20} color={colors.navy} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.settingLabel, { color: themeColors.text }]}>
                    REST API Base URL
                  </Text>
                  {!editingApiUrl && (
                    <Text style={[styles.urlText, { color: themeColors.textSecondary }]} numberOfLines={1}>
                      {apiUrl}
                    </Text>
                  )}
                </View>
              </View>

              <TouchableOpacity
                onPress={() => setEditingApiUrl(!editingApiUrl)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={editingApiUrl ? 'close' : 'pencil'}
                  size={18}
                  color={colors.primary}
                />
              </TouchableOpacity>
            </View>

            {editingApiUrl && (
              <View style={styles.editUrlBox}>
                <TextInput
                  style={[
                    styles.urlInput,
                    {
                      color: themeColors.text,
                      backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC',
                      borderColor: themeColors.border,
                    },
                  ]}
                  value={apiUrl}
                  onChangeText={setApiUrl}
                  autoCapitalize="none"
                />
                <TouchableOpacity style={styles.saveUrlBtn} onPress={handleSaveApiUrl}>
                  <Text style={styles.saveUrlBtnText}>{t.save}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.danger} />
          <Text style={styles.logoutButtonText}>{t.logout}</Text>
        </TouchableOpacity>

        <Text style={[styles.versionText, { color: themeColors.textMuted }]}>
          {t.appName} • {t.version}
        </Text>
      </ScrollView>

      {/* Set/Change PIN Modal */}
      <Modal visible={showPinModal} transparent animationType="fade" onRequestClose={() => setShowPinModal(false)}>
        <View style={styles.pinModalOverlay}>
          <View
            style={[
              styles.pinModalBox,
              {
                backgroundColor: isDarkMode ? colors.dark.card : colors.card,
                borderColor: themeColors.border,
              },
            ]}
          >
            <View style={styles.pinModalHeader}>
              <Ionicons name="keypad" size={24} color={colors.primary} />
              <Text style={[styles.pinModalTitle, { color: themeColors.text }]}>
                Weka PIN Mpya ya Namba 4
              </Text>
            </View>

            {pinError ? <Text style={styles.pinModalError}>{pinError}</Text> : null}

            <Text style={[styles.pinFieldLabel, { color: themeColors.textSecondary }]}>
              Weka Namba 4 za PIN:
            </Text>
            <TextInput
              style={[
                styles.pinInput,
                {
                  color: themeColors.text,
                  backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC',
                  borderColor: themeColors.border,
                },
              ]}
              placeholder="••••"
              placeholderTextColor={themeColors.textMuted}
              value={newPin}
              onChangeText={(val) => setNewPinInput(val.replace(/[^0-9]/g, '').slice(0, 4))}
              keyboardType="number-pad"
              maxLength={4}
              secureTextEntry
            />

            <Text style={[styles.pinFieldLabel, { color: themeColors.textSecondary, marginTop: 10 }]}>
              Thibitisha Namba 4 za PIN:
            </Text>
            <TextInput
              style={[
                styles.pinInput,
                {
                  color: themeColors.text,
                  backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC',
                  borderColor: themeColors.border,
                },
              ]}
              placeholder="••••"
              placeholderTextColor={themeColors.textMuted}
              value={confirmPin}
              onChangeText={(val) => setConfirmPinInput(val.replace(/[^0-9]/g, '').slice(0, 4))}
              keyboardType="number-pad"
              maxLength={4}
              secureTextEntry
            />

            <View style={styles.pinModalActions}>
              <TouchableOpacity
                style={styles.cancelPinBtn}
                onPress={() => {
                  setShowPinModal(false);
                  setNewPinInput('');
                  setConfirmPinInput('');
                  setPinError(null);
                }}
              >
                <Text style={styles.cancelPinBtnText}>{t.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.savePinBtn} onPress={handleSavePin}>
                <Text style={styles.savePinBtnText}>{t.save}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 60,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: layout.borderRadius,
    borderWidth: 1,
    marginBottom: spacing.lg,
    ...layout.shadow,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
  },
  userContact: {
    fontSize: 12,
    marginTop: 2,
  },
  roleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  roleBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.navy,
  },
  dealerCodeText: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
    marginLeft: 4,
  },
  settingsGroup: {
    borderRadius: layout.borderRadius,
    borderWidth: 1,
    overflow: 'hidden',
    ...layout.shadow,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    minHeight: layout.minTouchTarget,
  },
  settingLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  valueText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  divider: {
    height: 1,
    marginLeft: 44,
  },
  urlText: {
    fontSize: 11,
    marginTop: 2,
    fontFamily: 'monospace',
  },
  editUrlBox: {
    padding: spacing.md,
    paddingTop: 0,
    gap: 8,
  },
  urlInput: {
    borderWidth: 1,
    borderRadius: layout.borderRadiusSm,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 12,
    fontFamily: 'monospace',
  },
  saveUrlBtn: {
    backgroundColor: colors.primary,
    alignSelf: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
  },
  saveUrlBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.dangerLight,
    padding: spacing.md,
    borderRadius: layout.borderRadius,
    minHeight: layout.minTouchTarget,
    marginTop: spacing.md,
  },
  logoutButtonText: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: '700',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 11,
    marginTop: spacing.xl,
  },
  pinModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  pinModalBox: {
    borderRadius: layout.borderRadiusLg,
    borderWidth: 1,
    padding: spacing.xl,
    ...layout.shadowLg,
  },
  pinModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: spacing.md,
  },
  pinModalTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  pinModalError: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  pinFieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  pinInput: {
    borderWidth: 1,
    borderRadius: layout.borderRadiusSm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 8,
    marginBottom: 4,
  },
  pinModalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: spacing.lg,
  },
  cancelPinBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  cancelPinBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  savePinBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  savePinBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
