import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, layout } from '../theme';
import { useApp } from '../context/AppContext';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  color?: string;
  onPress?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color = colors.primary,
  onPress,
}) => {
  const { isDarkMode } = useApp();
  const themeColors = isDarkMode ? colors.dark : colors;

  const content = (
    <View
      style={[
        styles.card,
        {
          backgroundColor: isDarkMode ? colors.dark.card : colors.card,
          borderColor: themeColors.border,
        },
      ]}
    >
      <View style={styles.topRow}>
        <View style={[styles.iconBox, { backgroundColor: `${color}15` }]}>
          <Ionicons name={icon} size={20} color={color} />
        </View>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: themeColors.textSecondary }]} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      <Text style={[styles.value, { color: themeColors.text }]} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>

      <Text style={[styles.title, { color: themeColors.textSecondary }]} numberOfLines={1}>
        {title}
      </Text>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        style={styles.wrapper}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={styles.wrapper}>{content}</View>;
};

const styles = StyleSheet.create({
  wrapper: {
    width: '48%',
    marginBottom: spacing.md,
  },
  card: {
    borderRadius: layout.borderRadius,
    padding: spacing.md,
    borderWidth: 1,
    minHeight: 110,
    justifyContent: 'space-between',
    ...layout.shadow,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '600',
  },
  value: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginVertical: 4,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
  },
});
