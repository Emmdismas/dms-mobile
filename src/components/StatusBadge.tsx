import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography } from '../theme';
import { UnitStatus } from '../types';

interface StatusBadgeProps {
  status: UnitStatus | string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const normalized = (status || '').toUpperCase();

  let bg = colors.cardSecondary;
  let text = colors.textSecondary;
  let label = status;

  switch (normalized) {
    case 'IN STOCK':
    case 'ACTIVE':
    case 'COMPLETED':
    case 'PAID':
    case 'RELEASED':
      bg = colors.successLight;
      text = colors.success;
      break;

    case 'RESERVED':
    case 'IN_TRANSIT':
    case 'PARTIAL':
    case 'PENDING':
    case 'PENDING_PICKUP':
      bg = colors.warningLight;
      text = colors.warning;
      break;

    case 'SOLD':
      bg = colors.navyLight;
      text = colors.navy;
      break;

    case 'TRANSFERRED':
      bg = colors.infoLight;
      text = colors.info;
      break;

    case 'DAMAGED':
    case 'RETURNED':
    case 'CANCELLED':
    case 'INACTIVE':
      bg = colors.dangerLight;
      text = colors.danger;
      break;
  }

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.badgeText, { color: text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  badgeText: {
    ...typography.micro,
    fontSize: 10,
    fontWeight: '700',
  },
});
