import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, layout } from '../theme';
import { VehicleUnit } from '../types';
import { StatusBadge } from './StatusBadge';
import { useApp } from '../context/AppContext';

interface UnitCardProps {
  unit: VehicleUnit;
  onPress?: () => void;
  onSellPress?: () => void;
  onReleasePress?: () => void;
}

export const UnitCard: React.FC<UnitCardProps> = ({
  unit,
  onPress,
  onSellPress,
  onReleasePress,
}) => {
  const { isDarkMode, t } = useApp();
  const themeColors = isDarkMode ? colors.dark : colors;

  const formattedPrice = Number(unit.price || 0).toLocaleString('en-US');

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: isDarkMode ? colors.dark.card : colors.card,
          borderColor: themeColors.border,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.headerRow}>
        <View style={styles.titleInfo}>
          <Text style={[styles.modelName, { color: themeColors.text }]} numberOfLines={1}>
            {unit.modelName}
          </Text>
          <View style={styles.tagsRow}>
            <View style={styles.typeBadge}>
              <Text style={styles.typeText}>{unit.vehicleType}</Text>
            </View>
            <Text style={[styles.colorText, { color: themeColors.textSecondary }]}>
              {unit.color || 'Standard'}
            </Text>
          </View>
        </View>

        <StatusBadge status={unit.status} />
      </View>

      <View style={styles.metaBox}>
        <View style={styles.metaRow}>
          <Ionicons name="barcode-outline" size={14} color={colors.primary} />
          <Text style={[styles.monoLabel, { color: themeColors.textSecondary }]}>Chassis:</Text>
          <Text style={[styles.monoValue, { color: themeColors.text }]} numberOfLines={1}>
            {unit.chassisNumber}
          </Text>
        </View>

        <View style={styles.metaRow}>
          <Ionicons name="hardware-chip-outline" size={14} color={themeColors.textSecondary} />
          <Text style={[styles.monoLabel, { color: themeColors.textSecondary }]}>Engine:</Text>
          <Text style={[styles.monoValue, { color: themeColors.text }]} numberOfLines={1}>
            {unit.engineNumber}
          </Text>
        </View>

        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={14} color={colors.navy} />
          <Text style={[styles.branchText, { color: themeColors.textSecondary }]} numberOfLines={1}>
            {unit.branchName}
          </Text>
        </View>
      </View>

      <View style={styles.footerRow}>
        <View>
          <Text style={[styles.priceLabel, { color: themeColors.textSecondary }]}>
            {t.price}
          </Text>
          <Text style={styles.priceValue}>TZS {formattedPrice}</Text>
        </View>

        <View style={styles.actions}>
          {unit.status === 'IN STOCK' && onSellPress && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onSellPress}
              activeOpacity={0.8}
            >
              <Ionicons name="cart" size={15} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>{t.recordSale}</Text>
            </TouchableOpacity>
          )}

          {unit.status === 'RESERVED' && unit.deliveryStatus === 'PENDING_PICKUP' && onReleasePress && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.navy }]}
              onPress={onReleasePress}
              activeOpacity={0.8}
            >
              <Ionicons name="checkmark-done" size={15} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>{t.confirmRelease}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: layout.borderRadius,
    padding: spacing.md,
    borderWidth: 1,
    marginBottom: spacing.md,
    ...layout.shadow,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  titleInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  modelName: {
    fontSize: 16,
    fontWeight: '700',
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  typeBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  typeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.navy,
  },
  colorText: {
    fontSize: 11,
    fontWeight: '500',
  },
  metaBox: {
    backgroundColor: '#F8FAFC10',
    paddingVertical: 6,
    gap: 3,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  monoLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  monoValue: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'monospace',
    flex: 1,
  },
  branchText: {
    fontSize: 12,
    fontWeight: '500',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F040',
  },
  priceLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  priceValue: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.primary,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    minHeight: 36,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
