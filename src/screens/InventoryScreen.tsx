import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, layout } from '../theme';
import { useApp } from '../context/AppContext';
import { Header } from '../components/Header';
import { UnitCard } from '../components/UnitCard';
import { BranchSelectorModal } from '../components/BranchSelectorModal';
import { VehicleUnit, UnitStatus } from '../types';
import { operationsApi } from '../api/operations';
import { QuickScannerModal } from '../components/QuickScannerModal';

interface InventoryScreenProps {
  navigation: any;
}

export const InventoryScreen: React.FC<InventoryScreenProps> = ({ navigation }) => {
  const {
    isDarkMode,
    t,
    filteredUnits,
    isRefreshing,
    refreshData,
    activeBranch,
    appendUnits,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  const themeColors = isDarkMode ? colors.dark : colors;

  const filterChips: { key: string; label: string }[] = [
    { key: 'ALL', label: t.allStatuses },
    { key: 'IN STOCK', label: 'In Stock' },
    { key: 'RESERVED', label: 'Reserved' },
    { key: 'SOLD', label: 'Sold' },
    { key: 'TRANSFERRED', label: 'Transferred' },
  ];

  const filteredData = useMemo(() => {
    let result = filteredUnits;

    if (statusFilter !== 'ALL') {
      result = result.filter((u) => u.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (u) =>
          u.chassisNumber.toLowerCase().includes(q) ||
          u.engineNumber.toLowerCase().includes(q) ||
          u.modelName.toLowerCase().includes(q) ||
          (u.soldToCustomerName && u.soldToCustomerName.toLowerCase().includes(q)),
      );
    }

    return result;
  }, [filteredUnits, statusFilter, searchQuery]);

  const handleReleaseUnit = (unit: VehicleUnit) => {
    Alert.alert(
      t.releaseUnit,
      `Unathibitisha kukabidhi pikipiki chassis: ${unit.chassisNumber} kwa mteja?`,
      [
        { text: t.cancel, style: 'cancel' },
        {
          text: t.confirm,
          style: 'default',
          onPress: async () => {
            try {
              const res = await operationsApi.releaseUnit(unit.id);
              appendUnits([res.unit]);
              void refreshData();
              Alert.alert('Imefanikiwa', 'Pikipiki imekabidhiwa rasmi kwa mteja.');
            } catch (err: any) {
              Alert.alert(t.error, err.message);
            }
          },
        },
      ],
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? colors.dark.background : colors.background }]}>
      <Header
        title={t.tabInventory}
        subtitle={activeBranch ? activeBranch.name : undefined}
        showBranchSelector={true}
        onOpenBranchSelector={() => setShowBranchModal(true)}
        rightAction={
          <TouchableOpacity
            style={styles.headerAddBtn}
            onPress={() => navigation.navigate('ReceiveStockModal')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="add" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        }
      />

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
            placeholder={t.searchChassisOrModel}
            placeholderTextColor={themeColors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={themeColors.textMuted} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => setShowScanner(true)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="barcode-outline" size={20} color={colors.primary} />
            </TouchableOpacity>
          )}
        </View>

        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={filterChips}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.chipsContainer}
          renderItem={({ item }) => {
            const isSelected = statusFilter === item.key;
            return (
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: isSelected
                      ? colors.primary
                      : isDarkMode
                      ? colors.dark.card
                      : colors.card,
                    borderColor: isSelected ? colors.primary : themeColors.border,
                  },
                ]}
                onPress={() => setStatusFilter(item.key)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: isSelected ? '#FFFFFF' : themeColors.textSecondary },
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
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
        renderItem={({ item }) => (
          <UnitCard
            unit={item}
            onSellPress={() => navigation.navigate('RecordSaleModal', { initialUnitId: item.id })}
            onReleasePress={() => handleReleaseUnit(item)}
          />
        )}
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
            <Ionicons name="bicycle-outline" size={44} color={themeColors.textMuted} />
            <Text style={[styles.emptyTitle, { color: themeColors.text }]}>
              {t.noDataFound}
            </Text>
            <Text style={[styles.emptySubtitle, { color: themeColors.textSecondary }]}>
              {searchQuery ? 'Jaribu neno jingine la utafutaji.' : 'Hakuna pikipiki iliyopatikana kwenye hali hii.'}
            </Text>
            <TouchableOpacity
              style={styles.receiveNewBtn}
              onPress={() => navigation.navigate('ReceiveStockModal')}
            >
              <Text style={styles.receiveNewBtnText}>+ {t.receiveStock}</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <BranchSelectorModal
        visible={showBranchModal}
        onClose={() => setShowBranchModal(false)}
      />

      <QuickScannerModal
        visible={showScanner}
        onClose={() => setShowScanner(false)}
        onScan={(scanned) => setSearchQuery(scanned)}
        title="Tafuta Pikipiki kwa Barcode"
        subtitle="Elekeza kamera kwenye barcode ya chassis ili kuipata stoo"
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
  chipsContainer: {
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    minHeight: 32,
    justifyContent: 'center',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
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
  receiveNewBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: layout.borderRadiusSm,
    marginTop: spacing.md,
  },
  receiveNewBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
