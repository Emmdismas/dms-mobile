import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, layout } from '../theme';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { OfflineSyncBanner } from './OfflineSyncBanner';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBranchSelector?: boolean;
  onOpenBranchSelector?: () => void;
  rightAction?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBranchSelector = true,
  onOpenBranchSelector,
  rightAction,
}) => {
  const { currentUser } = useAuth();
  const { isDarkMode, activeBranch, t, toggleLanguage, language } = useApp();

  const themeColors = isDarkMode ? colors.dark : colors;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDarkMode ? colors.dark.card : colors.card,
          borderBottomColor: themeColors.border,
        },
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.brandContainer}>
          <View style={styles.logoBadge}>
            <Ionicons name="speedometer-outline" size={20} color="#FFFFFF" />
          </View>
          <View style={styles.titleWrapper}>
            <Text style={[styles.brandText, { color: themeColors.text }]} numberOfLines={1}>
              {title || currentUser?.dealerName || 'DMS Motors'}
            </Text>
            {subtitle ? (
              <Text style={[styles.subtitleText, { color: themeColors.textSecondary }]}>
                {subtitle}
              </Text>
            ) : null}
          </View>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.langPill, { backgroundColor: isDarkMode ? '#334155' : '#F1F5F9' }]}
            onPress={toggleLanguage}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.langText}>{language.toUpperCase()}</Text>
          </TouchableOpacity>

          {rightAction}
        </View>
      </View>

      {showBranchSelector && onOpenBranchSelector && (
        <TouchableOpacity
          style={[
            styles.branchPicker,
            {
              backgroundColor: isDarkMode ? '#1E293B' : '#F8FAFC',
              borderColor: themeColors.border,
            },
          ]}
          onPress={onOpenBranchSelector}
          activeOpacity={0.7}
        >
          <View style={styles.branchPickerContent}>
            <Ionicons name="business" size={16} color={colors.primary} />
            <Text
              style={[styles.branchPickerText, { color: themeColors.text }]}
              numberOfLines={1}
            >
              {activeBranch ? activeBranch.name : t.allBranches}
            </Text>
          </View>
          <Ionicons name="chevron-down" size={16} color={themeColors.textSecondary} />
        </TouchableOpacity>
      )}

      <View style={styles.bannerWrapper}>
        <OfflineSyncBanner />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.md,
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    ...layout.shadow,
  },
  titleWrapper: {
    flex: 1,
  },
  brandText: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  subtitleText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  langPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    minHeight: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  langText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  branchPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: layout.borderRadiusSm,
    borderWidth: 1,
    marginTop: spacing.sm,
    minHeight: 38,
  },
  branchPickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  branchPickerText: {
    fontSize: 13,
    fontWeight: '600',
  },
  bannerWrapper: {
    marginHorizontal: -spacing.lg,
    marginBottom: -spacing.md,
    marginTop: spacing.sm,
  },
});
