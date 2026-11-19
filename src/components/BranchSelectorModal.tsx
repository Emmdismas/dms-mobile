import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, layout } from '../theme';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { Branch } from '../types';

interface BranchSelectorModalProps {
  visible: boolean;
  onClose: () => void;
}

export const BranchSelectorModal: React.FC<BranchSelectorModalProps> = ({
  visible,
  onClose,
}) => {
  const { selectedBranchId, setSelectedBranchId } = useAuth();
  const { branches, isDarkMode, t } = useApp();
  const themeColors = isDarkMode ? colors.dark : colors;

  const handleSelect = (id: string | null) => {
    setSelectedBranchId(id);
    onClose();
  };

  const renderItem = ({ item }: { item: Branch | null }) => {
    const isSelected = item === null ? selectedBranchId === null : String(item.id) === String(selectedBranchId);

    return (
      <TouchableOpacity
        style={[
          styles.itemRow,
          {
            backgroundColor: isSelected
              ? colors.primaryLight
              : isDarkMode
              ? colors.dark.card
              : colors.card,
            borderColor: isSelected ? colors.primary : themeColors.border,
          },
        ]}
        onPress={() => handleSelect(item ? String(item.id) : null)}
        activeOpacity={0.7}
      >
        <View style={styles.itemInfo}>
          <View style={[styles.iconWrapper, { backgroundColor: isSelected ? colors.primary : '#F1F5F9' }]}>
            <Ionicons
              name={item ? 'business' : 'layers'}
              size={18}
              color={isSelected ? '#FFFFFF' : colors.navy}
            />
          </View>
          <View style={styles.textContainer}>
            <Text
              style={[
                styles.branchName,
                { color: isSelected ? colors.primaryText : themeColors.text },
              ]}
              numberOfLines={1}
            >
              {item ? item.name : t.allBranches}
            </Text>
            {item?.location ? (
              <Text style={[styles.branchLocation, { color: themeColors.textSecondary }]} numberOfLines={1}>
                {item.location} ({item.region})
              </Text>
            ) : null}
          </View>
        </View>

        {isSelected && (
          <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
        )}
      </TouchableOpacity>
    );
  };

  const items: (Branch | null)[] = [null, ...branches];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.modalContent,
            {
              backgroundColor: isDarkMode ? colors.dark.card : colors.card,
              borderColor: themeColors.border,
            },
          ]}
        >
          <View style={styles.modalHeader}>
            <View style={styles.headerTitleRow}>
              <Ionicons name="business" size={20} color={colors.primary} />
              <Text style={[styles.modalTitle, { color: themeColors.text }]}>
                {t.selectBranch}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={20} color={themeColors.textSecondary} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={items}
            keyExtractor={(item) => (item ? String(item.id) : 'all')}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    borderRadius: layout.borderRadiusLg,
    borderWidth: 1,
    maxHeight: '80%',
    padding: spacing.md,
    ...layout.shadowLg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F040',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: layout.borderRadiusSm,
    borderWidth: 1.5,
    minHeight: 56,
  },
  itemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  branchName: {
    fontSize: 14,
    fontWeight: '700',
  },
  branchLocation: {
    fontSize: 12,
    marginTop: 2,
  },
});
