import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Modal,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, layout } from '../theme';
import { useApp } from '../context/AppContext';
import { Header } from '../components/Header';
import { StatusBadge } from '../components/StatusBadge';
import { StockTransfer, VehicleUnit } from '../types';
import { operationsApi } from '../api/operations';

interface TransfersScreenProps {
  navigation: any;
}

export const TransfersScreen: React.FC<TransfersScreenProps> = () => {
  const {
    isDarkMode,
    t,
    transfers,
    branches,
    filteredUnits,
    isRefreshing,
    refreshData,
    activeBranch,
    appendTransfer,
  } = useApp();

  const themeColors = isDarkMode ? colors.dark : colors;

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [fromBranchId, setFromBranchId] = useState<string>(() =>
    activeBranch ? String(activeBranch.id) : branches[0] ? String(branches[0].id) : '',
  );
  const [toBranchId, setToBranchId] = useState<string>(() =>
    branches.length > 1 ? String(branches[1].id) : '',
  );
  const [selectedUnitIds, setSelectedUnitIds] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Available in-stock units for source branch
  const availableUnits = filteredUnits.filter(
    (u) => String(u.branchId) === String(fromBranchId) && u.status === 'IN STOCK',
  );

  const toggleUnitSelection = (unitId: string) => {
    setSelectedUnitIds((prev) =>
      prev.includes(unitId) ? prev.filter((id) => id !== unitId) : [...prev, unitId],
    );
  };

  const handleCreateTransfer = async () => {
    if (!fromBranchId || !toBranchId) {
      Alert.alert(t.error, 'Tafadhali chagua tawi la asili na tawi la mwisho');
      return;
    }
    if (fromBranchId === toBranchId) {
      Alert.alert(t.error, 'Tawi la asili na tawi la mwisho haliwezi kuwa sawa');
      return;
    }
    if (selectedUnitIds.length === 0) {
      Alert.alert(t.error, 'Chagua angalau pikipiki moja ya kuhamisha');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await operationsApi.createTransfer({
        from_branch_id: fromBranchId,
        to_branch_id: toBranchId,
        unit_ids: selectedUnitIds,
        notes: notes.trim() || undefined,
      });

      appendTransfer(res.transfer);
      setShowCreateModal(false);
      setSelectedUnitIds([]);
      setNotes('');
      Alert.alert(
        'Uhamisho Umeanza!',
        `Msimbo wa Uhamisho: ${res.transfer.transferNumber}\nPikipiki ${selectedUnitIds.length} zimeandikwa safarini (IN_TRANSIT).`,
      );
    } catch (err: any) {
      Alert.alert(t.error, err.message || 'Hitilafu imetokea wakati wa kuanzisha uhamisho.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderTransferCard = ({ item }: { item: StockTransfer }) => (
    <View
      style={[
        styles.transferCard,
        {
          backgroundColor: isDarkMode ? colors.dark.card : colors.card,
          borderColor: themeColors.border,
        },
      ]}
    >
      <View style={styles.cardHeader}>
        <View style={styles.transferNumBox}>
          <Ionicons name="swap-horizontal" size={16} color={colors.primary} />
          <Text style={styles.transferNum}>{item.transferNumber}</Text>
        </View>
        <StatusBadge status={item.status} />
      </View>

      <View style={styles.branchesFlow}>
        <View style={styles.branchPoint}>
          <Text style={[styles.branchPointLabel, { color: themeColors.textSecondary }]}>
            {t.fromBranch}
          </Text>
          <Text style={[styles.branchPointName, { color: themeColors.text }]} numberOfLines={1}>
            {item.fromBranchName}
          </Text>
        </View>

        <Ionicons name="arrow-forward" size={18} color={colors.primary} />

        <View style={styles.branchPoint}>
          <Text style={[styles.branchPointLabel, { color: themeColors.textSecondary }]}>
            {t.toBranch}
          </Text>
          <Text style={[styles.branchPointName, { color: themeColors.text }]} numberOfLines={1}>
            {item.toBranchName}
          </Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <Text style={[styles.chassisCount, { color: themeColors.textSecondary }]}>
          {item.chassisList?.length || item.unitIds?.length || 1} Pikipiki • {item.modelName || 'Multi-model'}
        </Text>
        <Text style={[styles.dateText, { color: themeColors.textMuted }]}>{item.date}</Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? colors.dark.background : colors.background }]}>
      <Header
        title={t.tabTransfers}
        showBranchSelector={false}
        rightAction={
          <TouchableOpacity
            style={styles.headerAddBtn}
            onPress={() => setShowCreateModal(true)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="add" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        }
      />

      <FlatList
        data={transfers}
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
        renderItem={renderTransferCard}
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
            <Ionicons name="swap-horizontal-outline" size={44} color={themeColors.textMuted} />
            <Text style={[styles.emptyTitle, { color: themeColors.text }]}>
              {t.noDataFound}
            </Text>
            <Text style={[styles.emptySubtitle, { color: themeColors.textSecondary }]}>
              Hakuna uhamisho wa mzigo uliorekodiwa bado.
            </Text>
            <TouchableOpacity
              style={styles.emptyActionBtn}
              onPress={() => setShowCreateModal(true)}
            >
              <Text style={styles.emptyActionBtnText}>+ {t.initiateTransfer}</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Create Transfer Modal */}
      <Modal visible={showCreateModal} animationType="slide" onRequestClose={() => setShowCreateModal(false)}>
        <View style={[styles.modalRoot, { backgroundColor: isDarkMode ? colors.dark.background : colors.background }]}>
          <View
            style={[
              styles.modalHeader,
              {
                backgroundColor: isDarkMode ? colors.dark.card : colors.card,
                borderBottomColor: themeColors.border,
              },
            ]}
          >
            <TouchableOpacity onPress={() => setShowCreateModal(false)} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={themeColors.text} />
            </TouchableOpacity>
            <Text style={[styles.modalHeaderTitle, { color: themeColors.text }]}>
              {t.newTransferTitle}
            </Text>
            <View style={{ width: 36 }} />
          </View>

          <ScrollView contentContainerStyle={styles.modalScroll}>
            {/* From Branch */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: themeColors.textSecondary }]}>
                {t.fromBranch}
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.branchesRow}>
                {branches.map((b) => {
                  const isSelected = String(b.id) === String(fromBranchId);
                  return (
                    <TouchableOpacity
                      key={b.id}
                      style={[
                        styles.branchChip,
                        {
                          backgroundColor: isSelected
                            ? colors.primary
                            : isDarkMode
                            ? colors.dark.card
                            : colors.card,
                          borderColor: isSelected ? colors.primary : themeColors.border,
                        },
                      ]}
                      onPress={() => {
                        setFromBranchId(String(b.id));
                        setSelectedUnitIds([]);
                      }}
                    >
                      <Text style={[styles.chipText, { color: isSelected ? '#FFFFFF' : themeColors.text }]}>
                        {b.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* To Branch */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: themeColors.textSecondary }]}>
                {t.toBranch}
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.branchesRow}>
                {branches
                  .filter((b) => String(b.id) !== String(fromBranchId))
                  .map((b) => {
                    const isSelected = String(b.id) === String(toBranchId);
                    return (
                      <TouchableOpacity
                        key={b.id}
                        style={[
                          styles.branchChip,
                          {
                            backgroundColor: isSelected
                              ? colors.navy
                              : isDarkMode
                              ? colors.dark.card
                              : colors.card,
                            borderColor: isSelected ? colors.navy : themeColors.border,
                          },
                        ]}
                        onPress={() => setToBranchId(String(b.id))}
                      >
                        <Text style={[styles.chipText, { color: isSelected ? '#FFFFFF' : themeColors.text }]}>
                          {b.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
              </ScrollView>
            </View>

            {/* Select In-Stock Units */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: themeColors.textSecondary }]}>
                Chagua Pikipiki Zilizopo ({availableUnits.length}) *
              </Text>
              {availableUnits.length === 0 ? (
                <Text style={styles.noUnitsNote}>
                  Hakuna pikipiki iliyopo kwenye tawi hili ya kuhamisha.
                </Text>
              ) : (
                <View style={styles.unitSelectionList}>
                  {availableUnits.map((u) => {
                    const isSelected = selectedUnitIds.includes(String(u.id));
                    return (
                      <TouchableOpacity
                        key={u.id}
                        style={[
                          styles.selectableUnit,
                          {
                            backgroundColor: isSelected
                              ? colors.primaryLight
                              : isDarkMode
                              ? colors.dark.card
                              : colors.card,
                            borderColor: isSelected ? colors.primary : themeColors.border,
                          },
                        ]}
                        onPress={() => toggleUnitSelection(String(u.id))}
                      >
                        <Ionicons
                          name={isSelected ? 'checkbox' : 'square-outline'}
                          size={20}
                          color={isSelected ? colors.primary : themeColors.textMuted}
                        />
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.selModelName, { color: themeColors.text }]}>
                            {u.modelName}
                          </Text>
                          <Text style={[styles.selChassis, { color: themeColors.textSecondary }]}>
                            {u.chassisNumber}
                          </Text>
                        </View>
                        <Text style={styles.selPrice}>
                          TZS {(u.price / 1_000_000).toFixed(2)}M
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>

            {/* Notes */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: themeColors.textSecondary }]}>
                {t.notes}
              </Text>
              <TextInput
                style={[
                  styles.notesInput,
                  {
                    color: themeColors.text,
                    backgroundColor: isDarkMode ? colors.dark.card : colors.card,
                    borderColor: themeColors.border,
                  },
                ]}
                placeholder="Maelezo ya msafirishaji au gari lililobeba mzigo..."
                placeholderTextColor={themeColors.textMuted}
                value={notes}
                onChangeText={setNotes}
                multiline
              />
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, isSubmitting && { opacity: 0.8 }]}
              onPress={handleCreateTransfer}
              disabled={isSubmitting || selectedUnitIds.length === 0}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.submitBtnText}>
                  {t.initiateTransfer} ({selectedUnitIds.length})
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
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
  listContent: {
    padding: spacing.lg,
    paddingBottom: 60,
  },
  transferCard: {
    borderRadius: layout.borderRadius,
    padding: spacing.md,
    borderWidth: 1,
    marginBottom: spacing.md,
    ...layout.shadow,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  transferNumBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  transferNum: {
    fontSize: 13,
    fontWeight: '800',
    fontFamily: 'monospace',
    color: colors.primary,
  },
  branchesFlow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC10',
    paddingVertical: 8,
  },
  branchPoint: {
    flex: 1,
  },
  branchPointLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  branchPointName: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F040',
  },
  chassisCount: {
    fontSize: 12,
    fontWeight: '600',
  },
  dateText: {
    fontSize: 11,
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
  modalRoot: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  modalScroll: {
    padding: spacing.lg,
    paddingBottom: 60,
  },
  formGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  branchesRow: {
    flexDirection: 'row',
  },
  branchChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  noUnitsNote: {
    fontSize: 12,
    fontStyle: 'italic',
    color: colors.textSecondary,
  },
  unitSelectionList: {
    gap: 8,
  },
  selectableUnit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: layout.borderRadiusSm,
    borderWidth: 1.5,
  },
  selModelName: {
    fontSize: 13,
    fontWeight: '700',
  },
  selChassis: {
    fontSize: 11,
    fontFamily: 'monospace',
  },
  selPrice: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  notesInput: {
    borderWidth: 1,
    borderRadius: layout.borderRadiusSm,
    padding: spacing.md,
    minHeight: 70,
    fontSize: 13,
  },
  submitBtn: {
    backgroundColor: colors.primary,
    minHeight: layout.minTouchTarget,
    borderRadius: layout.borderRadiusSm,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    ...layout.shadow,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
