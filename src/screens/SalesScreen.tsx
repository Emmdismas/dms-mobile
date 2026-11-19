import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, layout } from '../theme';
import { useApp } from '../context/AppContext';
import { Header } from '../components/Header';
import { SaleCard } from '../components/SaleCard';
import { BranchSelectorModal } from '../components/BranchSelectorModal';

interface SalesScreenProps {
  navigation: any;
}

export const SalesScreen: React.FC<SalesScreenProps> = ({ navigation }) => {
  const {
    isDarkMode,
    t,
    filteredSales,
    isRefreshing,
    refreshData,
    activeBranch,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [showBranchModal, setShowBranchModal] = useState(false);

  const themeColors = isDarkMode ? colors.dark : colors;

  const totalRevenue = useMemo(
    () => filteredSales.reduce((acc, s) => acc + (Number(s.amount) || 0), 0),
    [filteredSales],
  );

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return filteredSales;
    const q = searchQuery.trim().toLowerCase();
    return filteredSales.filter(
      (s) =>
        s.receiptNumber.toLowerCase().includes(q) ||
        s.customerName.toLowerCase().includes(q) ||
        s.customerPhone.toLowerCase().includes(q) ||
        s.chassisNumber.toLowerCase().includes(q) ||
        s.modelName.toLowerCase().includes(q),
    );
  }, [filteredSales, searchQuery]);

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? colors.dark.background : colors.background }]}>
      <Header
        title={t.tabSales}
        subtitle={activeBranch ? activeBranch.name : undefined}
        showBranchSelector={true}
        onOpenBranchSelector={() => setShowBranchModal(true)}
        rightAction={
          <TouchableOpacity
            style={styles.headerAddBtn}
            onPress={() => navigation.navigate('RecordSaleModal')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="add" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        }
      />

      {/* Summary Banner */}
      <View
        style={[
          styles.summaryBanner,
          {
            backgroundColor: isDarkMode ? colors.dark.card : colors.card,
            borderColor: themeColors.border,
          },
        ]}
      >
        <View>
          <Text style={[styles.summaryLabel, { color: themeColors.textSecondary }]}>
            {t.mtdRevenue} ({filteredSales.length} {t.tabSales})
          </Text>
          <Text style={styles.summaryValue}>
            TZS {totalRevenue.toLocaleString('en-US')}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.newSalePill}
          onPress={() => navigation.navigate('RecordSaleModal')}
          activeOpacity={0.8}
        >
          <Ionicons name="cart" size={14} color="#FFFFFF" />
          <Text style={styles.newSalePillText}>{t.recordSale}</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchSection}>
        <View
          style={[
            styles.searchBar,
            {
              backgroundColor: isDarkMode ? colors.dark.card : colors.card,
              borderColor: themeColors.border,
            },
          ]}
        >
          <Ionicons name="search" size={18} color={themeColors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: themeColors.text }]}
            placeholder="Tafuta namba ya risiti, mteja, chassis..."
            placeholderTextColor={themeColors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={themeColors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshData}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        renderItem={({ item }) => <SaleCard sale={item} />}
        ListEmptyComponent={
          <View
            style={[
              styles.emptyState,
              {
                backgroundColor: isDarkMode ? colors.dark.card : colors.card,
                borderColor: themeColors.border,
              },
            ]}
          >
            <Ionicons name="receipt-outline" size={44} color={themeColors.textMuted} />
            <Text style={[styles.emptyTitle, { color: themeColors.text }]}>
              {t.noDataFound}
            </Text>
            <Text style={[styles.emptySubtitle, { color: themeColors.textSecondary }]}>
              {searchQuery
                ? 'Hakuna mauzo yanayolingana na neno uliloweka.'
                : 'Bado hakuna rekodi za mauzo zilizofanyika.'}
            </Text>
            <TouchableOpacity
              style={styles.emptyActionBtn}
              onPress={() => navigation.navigate('RecordSaleModal')}
            >
              <Text style={styles.emptyActionBtnText}>+ {t.recordSale}</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <BranchSelectorModal
        visible={showBranchModal}
        onClose={() => setShowBranchModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerAddBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: layout.borderRadiusSm,
    borderWidth: 1,
    ...layout.shadow,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
    marginTop: 2,
  },
  newSalePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.navy,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  newSalePillText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  searchSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: layout.borderRadiusSm,
    paddingHorizontal: spacing.md,
    minHeight: layout.minTouchTarget,
    ...layout.shadow,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 8,
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: 60,
  },
  emptyState: {
    padding: spacing.xxl,
    borderRadius: layout.borderRadius,
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
  },
  emptyActionBtn: {
    marginTop: spacing.sm,
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: layout.borderRadiusSm,
  },
  emptyActionBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
