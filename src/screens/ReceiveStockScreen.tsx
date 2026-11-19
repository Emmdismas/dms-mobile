import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, layout } from '../theme';
import { useApp } from '../context/AppContext';
import { operationsApi } from '../api/operations';
import { VehicleType } from '../types';
import { QuickScannerModal } from '../components/QuickScannerModal';

interface ReceiveStockScreenProps {
  navigation: any;
}

const POPULAR_MODELS = [
  { id: 'mod-1', name: 'HLX 125', type: '2W' as VehicleType, defaultCost: 2850000, defaultPrice: 3450000 },
  { id: 'mod-2', name: 'HLX 150', type: '2W' as VehicleType, defaultCost: 3100000, defaultPrice: 3800000 },
  { id: 'mod-3', name: 'King Deluxe (Tricycle)', type: '3W' as VehicleType, defaultCost: 8900000, defaultPrice: 10400000 },
  { id: 'mod-4', name: 'King Kargo (Cargo Box)', type: '3W' as VehicleType, defaultCost: 9600000, defaultPrice: 11200000 },
  { id: 'mod-5', name: 'Apache RTR 160 4V', type: '2W' as VehicleType, defaultCost: 4800000, defaultPrice: 5900000 },
];

export const ReceiveStockScreen: React.FC<ReceiveStockScreenProps> = ({ navigation }) => {
  const {
    isDarkMode,
    t,
    branches,
    activeBranch,
    appendUnits,
    refreshData,
    receiveStockOffline,
  } = useApp();
  const themeColors = isDarkMode ? colors.dark : colors;

  const defaultBranch = activeBranch || branches[0];
  const [selectedBranchId, setSelectedBranchId] = useState<string>(
    defaultBranch ? String(defaultBranch.id) : '',
  );

  const [selectedModel, setSelectedModel] = useState(POPULAR_MODELS[0]);
  const [chassisNumber, setChassisNumber] = useState('');
  const [engineNumber, setEngineNumber] = useState('');
  const [color, setColor] = useState('Black');
  const [costPrice, setCostPrice] = useState(String(POPULAR_MODELS[0].defaultCost));
  const [retailPrice, setRetailPrice] = useState(String(POPULAR_MODELS[0].defaultPrice));
  const [supplier, setSupplier] = useState('TVS / Wholesale Supply');
  const [vehicleType, setVehicleType] = useState<VehicleType>('2W');
  const [showScanner, setShowScanner] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSelectModel = (model: typeof POPULAR_MODELS[0]) => {
    setSelectedModel(model);
    setVehicleType(model.type);
    setCostPrice(String(model.defaultCost));
    setRetailPrice(String(model.defaultPrice));
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!selectedBranchId) errs.branch = 'Chagua tawi linalopokea';
    if (!chassisNumber.trim() || chassisNumber.trim().length < 6) {
      errs.chassis = 'Weka namba sahihi ya chassis (angalau herufi 6)';
    }
    if (!engineNumber.trim() || engineNumber.trim().length < 4) {
      errs.engine = 'Weka namba sahihi ya engine (angalau herufi 4)';
    }
    if (!costPrice || Number(costPrice) <= 0) {
      errs.costPrice = 'Weka bei ya kununua sahihi';
    }
    if (!retailPrice || Number(retailPrice) <= 0) {
      errs.retailPrice = 'Weka bei ya kuuza sahihi';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    const unitData = [
      {
        branch_id: selectedBranchId,
        chassis_number: chassisNumber.trim().toUpperCase(),
        engine_number: engineNumber.trim().toUpperCase(),
        model_id: selectedModel.id,
        model_name: selectedModel.name,
        vehicle_type: vehicleType,
        color: color.trim() || 'Black',
        cost_price: Number(costPrice),
        price: Number(retailPrice),
      },
    ];

    try {
      const res = await operationsApi.receiveStock(unitData, supplier.trim());

      appendUnits(res.units);
      void refreshData();

      Alert.alert(
        'Imefanikiwa',
        `Pikipiki ${selectedModel.name} (Chassis: ${chassisNumber.toUpperCase()}) imeingizwa stoo kikamilifu!`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ],
      );
    } catch {
      // Offline fallback: save locally and queue for background sync
      try {
        await receiveStockOffline({ units: unitData, supplier: supplier.trim() });
        Alert.alert(
          'Imehifadhiwa (Offline Mode)',
          `Simu haijaunganishwa na mtandao. Pikipiki (Chassis: ${chassisNumber.toUpperCase()}) imehifadhiwa salama kwenye stoo ya simu na itaingizwa kwenye seva kiotomatiki mtandao ukirudi.`,
          [
            {
              text: 'Sawa',
              onPress: () => navigation.goBack(),
            },
          ],
        );
      } catch (offlineErr: any) {
        Alert.alert(t.error, offlineErr.message || 'Hitilafu ya kuhifadhi offline');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.container, { backgroundColor: isDarkMode ? colors.dark.background : colors.background }]}>
        {/* Header */}
        <View
          style={[
            styles.header,
            {
              backgroundColor: isDarkMode ? colors.dark.card : colors.card,
              borderBottomColor: themeColors.border,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={24} color={themeColors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: themeColors.text }]}>
            {t.receiveNewStockTitle}
          </Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Branch Picker */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: themeColors.textSecondary }]}>
              {t.branch} *
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.branchScroll}>
              {branches.map((b) => {
                const isSelected = String(b.id) === String(selectedBranchId);
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
                    onPress={() => setSelectedBranchId(String(b.id))}
                  >
                    <Text style={[styles.chipText, { color: isSelected ? '#FFFFFF' : themeColors.text }]}>
                      {b.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            {errors.branch ? <Text style={styles.fieldError}>{errors.branch}</Text> : null}
          </View>

          {/* Model Selection */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: themeColors.textSecondary }]}>
              {t.modelName} *
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.branchScroll}>
              {POPULAR_MODELS.map((m) => {
                const isSelected = selectedModel.id === m.id;
                return (
                  <TouchableOpacity
                    key={m.id}
                    style={[
                      styles.modelCard,
                      {
                        backgroundColor: isSelected
                          ? colors.primaryLight
                          : isDarkMode
                          ? colors.dark.card
                          : colors.card,
                        borderColor: isSelected ? colors.primary : themeColors.border,
                      },
                    ]}
                    onPress={() => handleSelectModel(m)}
                  >
                    <Text
                      style={[
                        styles.modelCardTitle,
                        { color: isSelected ? colors.primaryText : themeColors.text },
                      ]}
                    >
                      {m.name}
                    </Text>
                    <Text
                      style={[
                        styles.modelCardType,
                        { color: isSelected ? colors.primary : themeColors.textSecondary },
                      ]}
                    >
                      {m.type} • TZS {(m.defaultPrice / 1_000_000).toFixed(2)}M
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Chassis Number */}
          <View style={styles.formGroup}>
            <View style={styles.labelRow}>
              <Text style={[styles.label, { color: themeColors.textSecondary }]}>
                {t.chassisNumber} *
              </Text>
              <Text style={styles.monoHint}>Mfano: MD625AR34P8812301</Text>
            </View>
            <View
              style={[
                styles.inputBox,
                {
                  backgroundColor: isDarkMode ? colors.dark.card : colors.card,
                  borderColor: errors.chassis ? colors.danger : themeColors.border,
                },
              ]}
            >
              <Ionicons name="barcode-outline" size={18} color={colors.primary} />
              <TextInput
                style={[styles.input, styles.monoInput, { color: themeColors.text }]}
                placeholder="MD625..."
                placeholderTextColor={themeColors.textMuted}
                value={chassisNumber}
                onChangeText={(val) => setChassisNumber(val.toUpperCase())}
                autoCapitalize="characters"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.scanBtn}
                onPress={() => setShowScanner(true)}
                activeOpacity={0.7}
              >
                <Ionicons name="camera-outline" size={16} color={colors.primary} />
                <Text style={styles.scanBtnText}>Scan</Text>
              </TouchableOpacity>
            </View>
            {errors.chassis ? <Text style={styles.fieldError}>{errors.chassis}</Text> : null}
          </View>

          {/* Engine Number */}
          <View style={styles.formGroup}>
            <View style={styles.labelRow}>
              <Text style={[styles.label, { color: themeColors.textSecondary }]}>
                {t.engineNumber} *
              </Text>
              <Text style={styles.monoHint}>Mfano: ENG-AF992011</Text>
            </View>
            <View
              style={[
                styles.inputBox,
                {
                  backgroundColor: isDarkMode ? colors.dark.card : colors.card,
                  borderColor: errors.engine ? colors.danger : themeColors.border,
                },
              ]}
            >
              <Ionicons name="hardware-chip-outline" size={18} color={colors.navy} />
              <TextInput
                style={[styles.input, styles.monoInput, { color: themeColors.text }]}
                placeholder="ENG-..."
                placeholderTextColor={themeColors.textMuted}
                value={engineNumber}
                onChangeText={(val) => setEngineNumber(val.toUpperCase())}
                autoCapitalize="characters"
                autoCorrect={false}
              />
            </View>
            {errors.engine ? <Text style={styles.fieldError}>{errors.engine}</Text> : null}
          </View>

          {/* Color & Type row */}
          <View style={styles.twoColRow}>
            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={[styles.label, { color: themeColors.textSecondary }]}>
                {t.color}
              </Text>
              <View
                style={[
                  styles.inputBox,
                  {
                    backgroundColor: isDarkMode ? colors.dark.card : colors.card,
                    borderColor: themeColors.border,
                  },
                ]}
              >
                <TextInput
                  style={[styles.input, { color: themeColors.text }]}
                  placeholder="Black / Red / Blue"
                  placeholderTextColor={themeColors.textMuted}
                  value={color}
                  onChangeText={setColor}
                />
              </View>
            </View>

            <View style={[styles.formGroup, { width: 110 }]}>
              <Text style={[styles.label, { color: themeColors.textSecondary }]}>
                {t.type}
              </Text>
              <View style={styles.typeSelectorRow}>
                <TouchableOpacity
                  style={[
                    styles.typeBtn,
                    vehicleType === '2W' && styles.typeBtnActive,
                  ]}
                  onPress={() => setVehicleType('2W')}
                >
                  <Text
                    style={[
                      styles.typeBtnText,
                      vehicleType === '2W' && styles.typeBtnTextActive,
                    ]}
                  >
                    2W
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.typeBtn,
                    vehicleType === '3W' && styles.typeBtnActive,
                  ]}
                  onPress={() => setVehicleType('3W')}
                >
                  <Text
                    style={[
                      styles.typeBtnText,
                      vehicleType === '3W' && styles.typeBtnTextActive,
                    ]}
                  >
                    3W
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Pricing Row */}
          <View style={styles.twoColRow}>
            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={[styles.label, { color: themeColors.textSecondary }]}>
                {t.costPrice} *
              </Text>
              <View
                style={[
                  styles.inputBox,
                  {
                    backgroundColor: isDarkMode ? colors.dark.card : colors.card,
                    borderColor: errors.costPrice ? colors.danger : themeColors.border,
                  },
                ]}
              >
                <TextInput
                  style={[styles.input, { color: themeColors.text }]}
                  keyboardType="numeric"
                  value={costPrice}
                  onChangeText={setCostPrice}
                />
              </View>
              {errors.costPrice ? <Text style={styles.fieldError}>{errors.costPrice}</Text> : null}
            </View>

            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={[styles.label, { color: themeColors.textSecondary }]}>
                {t.retailPrice} *
              </Text>
              <View
                style={[
                  styles.inputBox,
                  {
                    backgroundColor: isDarkMode ? colors.dark.card : colors.card,
                    borderColor: errors.retailPrice ? colors.danger : themeColors.border,
                  },
                ]}
              >
                <TextInput
                  style={[styles.input, { color: themeColors.text }]}
                  keyboardType="numeric"
                  value={retailPrice}
                  onChangeText={setRetailPrice}
                />
              </View>
              {errors.retailPrice ? (
                <Text style={styles.fieldError}>{errors.retailPrice}</Text>
              ) : null}
            </View>
          </View>

          {/* Supplier */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: themeColors.textSecondary }]}>
              {t.supplier}
            </Text>
            <View
              style={[
                styles.inputBox,
                {
                  backgroundColor: isDarkMode ? colors.dark.card : colors.card,
                  borderColor: themeColors.border,
                },
              ]}
            >
              <TextInput
                style={[styles.input, { color: themeColors.text }]}
                value={supplier}
                onChangeText={setSupplier}
              />
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && { opacity: 0.8 }]}
            onPress={handleSave}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Ionicons name="cloud-upload" size={18} color="#FFFFFF" />
                <Text style={styles.submitButtonText}>{t.saveStock}</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>

        <QuickScannerModal
          visible={showScanner}
          onClose={() => setShowScanner(false)}
          onScan={(scanned) => setChassisNumber(scanned)}
          title="Scan Chassis Barcode"
          subtitle="Elekeza kamera kwenye stika ya barcode ya chassis ya pikipiki"
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 60,
  },
  formGroup: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  monoHint: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: layout.borderRadiusSm,
    paddingHorizontal: spacing.md,
    minHeight: layout.minTouchTarget,
    ...layout.shadow,
  },
  input: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 10,
  },
  monoInput: {
    fontFamily: 'monospace',
    fontWeight: '700',
  },
  scanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  scanBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  fieldError: {
    color: colors.danger,
    fontSize: 11,
    marginTop: 4,
    fontWeight: '500',
  },
  branchScroll: {
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
  modelCard: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: layout.borderRadiusSm,
    borderWidth: 1.5,
    marginRight: 8,
    minWidth: 130,
  },
  modelCardTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  modelCardType: {
    fontSize: 10,
    marginTop: 2,
    fontWeight: '500',
  },
  twoColRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  typeSelectorRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: layout.borderRadiusSm,
    overflow: 'hidden',
    height: layout.minTouchTarget,
  },
  typeBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  typeBtnActive: {
    backgroundColor: colors.navy,
  },
  typeBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  typeBtnTextActive: {
    color: '#FFFFFF',
  },
  submitButton: {
    backgroundColor: colors.primary,
    minHeight: layout.minTouchTarget,
    borderRadius: layout.borderRadiusSm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: spacing.lg,
    ...layout.shadow,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
