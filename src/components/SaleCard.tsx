import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, layout } from '../theme';
import { SaleRecord } from '../types';
import { StatusBadge } from './StatusBadge';
import { useApp } from '../context/AppContext';

interface SaleCardProps {
  sale: SaleRecord;
  onPress?: () => void;
}

export const SaleCard: React.FC<SaleCardProps> = ({ sale, onPress }) => {
  const { isDarkMode } = useApp();
  const themeColors = isDarkMode ? colors.dark : colors;

  const formattedAmount = Number(sale.amount || 0).toLocaleString('en-US');

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
      <View style={styles.topRow}>
        <View style={styles.receiptBox}>
          <Text style={styles.receiptText}>{sale.receiptNumber}</Text>
          <Text style={[styles.dateText, { color: themeColors.textSecondary }]}>
            {sale.date}
          </Text>
        </View>
        <StatusBadge status={sale.status} />
      </View>

      <View style={styles.body}>
        <Text style={[styles.modelName, { color: themeColors.text }]} numberOfLines={1}>
          {sale.modelName}
        </Text>

        <View style={styles.metaRow}>
          <Ionicons name="person-outline" size={13} color={colors.primary} />
          <Text style={[styles.customerName, { color: themeColors.textSecondary }]} numberOfLines={1}>
            {sale.customerName} ({sale.customerPhone})
          </Text>
        </View>

        <View style={styles.metaRow}>
          <Ionicons name="barcode-outline" size={13} color={themeColors.textSecondary} />
          <Text style={[styles.chassisText, { color: themeColors.textSecondary }]} numberOfLines={1}>
            Chassis: {sale.chassisNumber}
          </Text>
        </View>

        <View style={styles.metaRow}>
          <Ionicons name="business-outline" size={13} color={colors.navy} />
          <Text style={[styles.branchText, { color: themeColors.textSecondary }]} numberOfLines={1}>
            {sale.branchName}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.paymentMethodBadge}>
          <Text style={styles.paymentMethodText}>{sale.paymentMethod}</Text>
        </View>
        <Text style={styles.amountText}>TZS {formattedAmount}</Text>
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
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  receiptBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  receiptText: {
    fontSize: 13,
    fontWeight: '800',
    fontFamily: 'monospace',
    color: colors.primary,
  },
  dateText: {
    fontSize: 11,
    fontWeight: '500',
  },
  body: {
    gap: 3,
    paddingVertical: 2,
  },
  modelName: {
    fontSize: 15,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  customerName: {
    fontSize: 12,
    fontWeight: '600',
  },
  chassisText: {
    fontSize: 11,
    fontWeight: '500',
    fontFamily: 'monospace',
  },
  branchText: {
    fontSize: 11,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F040',
  },
  paymentMethodBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  paymentMethodText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.navy,
  },
  amountText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary,
  },
});
