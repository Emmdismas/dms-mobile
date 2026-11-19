import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, layout } from '../theme';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { Header } from '../components/Header';
import { StatCard } from '../components/StatCard';
import { SaleCard } from '../components/SaleCard';
import { BranchSelectorModal } from '../components/BranchSelectorModal';
import { UnitCard } from '../components/UnitCard';

interface DashboardScreenProps {
  navigation: any;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const { currentUser } = useAuth();
  const {
    isDarkMode,
    t,
    filteredUnits,
    filteredSales,
    branches,
    isRefreshing,
    refreshData,
    activeBranch,
  } = useApp();

  const [showBranchModal, setShowBranchModal] = useState(false);

  const themeColors = isDarkMode ? colors.dark : colors;

  // Compute metrics
  const inStockCount = filteredUnits.filter((u) => u.status === 'IN STOCK').length;
  const mtdSalesCount = filteredSales.length;
  const mtdRevenue = filteredSales.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const formattedRevenue =
    mtdRevenue >= 1_000_000
      ? `${(mtdRevenue / 1_000_000).toFixed(1)}M`
      : mtdRevenue.toLocaleString('en-US');

  const recentSales = filteredSales.slice(0, 5);
  const recentInStock = filteredUnits.filter((u) => u.status === 'IN STOCK').slice(0, 3);

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? colors.dark.background : colors.background }]}>
      <Header
        title={activeBranch ? activeBranch.name : currentUser?.dealerName}
        subtitle={currentUser ? `${currentUser.name} (${currentUser.role})` : undefined}
        showBranchSelector={true}
        onOpenBranchSelector={() => setShowBranchModal(true)}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshData}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Metric Cards - Strictly 2 per row as required by protocol */}
        <View style={styles.metricsGrid}>
          <StatCard
            title={t.inStockUnits}
            value={inStockCount}
            subtitle={t.tabInventory}
            icon="bicycle"
            color={colors.primary}
            onPress={() => navigation.navigate('InventoryTab')}
          />
          <StatCard
            title={t.mtdSalesCount}
            value={mtdSalesCount}
            subtitle={t.tabSales}
            icon="cart"
            color={colors.navy}
            onPress={() => navigation.navigate('SalesTab')}
          />
          <StatCard
            title={t.mtdRevenue}
            value={`TZS ${formattedRevenue}`}
            subtitle="MTD"
            icon="cash"
            color="#059669"
            onPress={() => navigation.navigate('SalesTab')}
          />
          <StatCard
            title={t.activeBranches}
            value={branches.length}
            subtitle="Branches"
            icon="business"
            color="#D97706"
            onPress={() => setShowBranchModal(true)}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
            {t.quickActions}
          </Text>
        </View>

        <View style={styles.quickActionsRow}>
          <TouchableOpacity
            style={[
              styles.actionPill,
              {
                backgroundColor: colors.primary,
              },
            ]}
            onPress={() => navigation.navigate('ReceiveStockModal')}
            activeOpacity={0.8}
          >
            <Ionicons name="add-circle" size={18} color="#FFFFFF" />
            <Text style={styles.actionPillText}>{t.receiveStock}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionPill,
              {
                backgroundColor: colors.navy,
              },
            ]}
            onPress={() => navigation.navigate('RecordSaleModal')}
            activeOpacity={0.8}
          >
            <Ionicons name="cart" size={18} color="#FFFFFF" />
            <Text style={styles.actionPillText}>{t.recordSale}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionPill,
              {
                backgroundColor: '#0F172A',
              },
            ]}
            onPress={() => navigation.navigate('TransfersTab')}
            activeOpacity={0.8}
          >
            <Ionicons name="swap-horizontal" size={18} color="#FFFFFF" />
            <Text style={styles.actionPillText}>{t.transferStock}</Text>
          </TouchableOpacity>
        </View>

        {/* Quick in-stock preview */}
        {recentInStock.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeaderBetween}>
              <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
                {t.tabInventory} ({inStockCount})
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('InventoryTab')}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.seeAllText}>Angalia Yote →</Text>
              </TouchableOpacity>
            </View>

            {recentInStock.map((unit) => (
              <UnitCard
                key={unit.id}
                unit={unit}
                onSellPress={() => navigation.navigate('RecordSaleModal', { initialUnitId: unit.id })}
              />
            ))}
          </View>
        )}

        {/* Recent Activity / Sales */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderBetween}>
            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
              {t.recentActivity}
            </Text>
            {recentSales.length > 0 && (
              <TouchableOpacity
                onPress={() => navigation.navigate('SalesTab')}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.seeAllText}>Angalia Yote →</Text>
              </TouchableOpacity>
            )}
          </View>

          {recentSales.length === 0 ? (
            <View
              style={[
                styles.emptyBox,
                {
                  backgroundColor: isDarkMode ? colors.dark.card : colors.card,
                  borderColor: themeColors.border,
                },
              ]}
            >
              <Ionicons name="receipt-outline" size={36} color={themeColors.textMuted} />
              <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>
                {t.noActivityYet}
              </Text>
              <TouchableOpacity
                style={styles.emptyActionBtn}
                onPress={() => navigation.navigate('ReceiveStockModal')}
              >
                <Text style={styles.emptyActionBtnText}>+ {t.receiveStock}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            recentSales.map((sale) => <SaleCard key={sale.id} sale={sale} />)
          )}
        </View>
      </ScrollView>

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
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 40,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  section: {
    marginTop: spacing.lg,
  },
  sectionHeader: {
    marginBottom: spacing.sm,
  },
  sectionHeaderBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  actionPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: layout.borderRadiusSm,
    minHeight: layout.minTouchTarget,
    ...layout.shadow,
  },
  actionPillText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyBox: {
    borderRadius: layout.borderRadius,
    padding: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    gap: spacing.sm,
  },
  emptyText: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  emptyActionBtn: {
    marginTop: spacing.sm,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  emptyActionBtnText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
});
