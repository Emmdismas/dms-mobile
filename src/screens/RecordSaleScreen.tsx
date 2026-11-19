import React, { useState, useMemo } from 'react';
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
import { PaymentMethod, VehicleUnit } from '../types';
import { QuickScannerModal } from '../components/QuickScannerModal';

interface RecordSaleScreenProps {
  navigation: any;
  route: any;
}

export const RecordSaleScreen: React.FC<RecordSaleScreenProps> = ({ navigation, route }) => {
  const {
    isDarkMode,
    t,
    filteredUnits,
    appendSale,
    refreshData,
    recordSaleOffline,
  } = useApp();
  const themeColors = isDarkMode ? colors.dark : colors;

  const initialUnitId = route.params?.initialUnitId;

  // Filter in-stock units
  const inStockUnits = useMemo(
    () => filteredUnits.filter((u) => u.status === 'IN STOCK'),
    [filteredUnits],
  );

  const [selectedUnit, setSelectedUnit] = useState<VehicleUnit | null>(() => {
    if (initialUnitId) {
      return inStockUnits.find((u) => u.id === initialUnitId) || inStockUnits[0] || null;
    }
    return inStockUnits[0] || null;
  });

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerNida, setCustomerNida] = useState('');
  const [customerLocation, setCustomerLocation] = useState('');

  const [saleAmount, setSaleAmount] = useState(() =>
    selectedUnit ? String(selectedUnit.price) : '3450000',
  );
  const [amountPaid, setAmountPaid] = useState(() =>
    selectedUnit ? String(selectedUnit.price) : '3450000',
  );

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [paymentRef, setPaymentRef] = useState('');
  const [notes, setNotes] = useState('');

  const [showScanner, setShowScanner] = useState(false);
  const [showNidaScanner, setShowNidaScanner] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSelectUnit = (unit: VehicleUnit) => {
    setSelectedUnit(unit);
    setSaleAmount(String(unit.price));
    setAmountPaid(String(unit.price));
  };

  const handleScanChassis = (scannedCode: string) => {
    const code = scannedCode.trim().toUpperCase();
    const matched = inStockUnits.find(
      (u) =>
        u.chassisNumber.toUpperCase() === code ||
        u.chassisNumber.toUpperCase().includes(code) ||
        code.includes(u.chassisNumber.toUpperCase()) ||
        u.engineNumber.toUpperCase() === code,
    );

    if (matched) {
      handleSelectUnit(matched);
      Alert.alert(
        'Pikipiki Imetambuliwa!',
        `${matched.modelName}\nChassis: ${matched.chassisNumber}\nBei: TZS ${Number(matched.price).toLocaleString('en-US')}`,
      );
    } else {
      Alert.alert(
        'Haijapatikana',
        `Hakuna pikipiki iliyo stoo (IN STOCK) yenye namba ya chassis: ${code}.\n\nHakikisha pikipiki ipo stoo ya tawi hili.`,
      );
    }
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!selectedUnit) errs.unit = 'Chagua pikipiki inayouzwa';
    if (!customerName.trim()) errs.name = 'Jaza jina kamili la mteja';
    if (!customerPhone.trim() || customerPhone.trim().length < 9) {
      errs.phone = 'Weka namba sahihi ya simu ya mteja';
    }
    if (!saleAmount || Number(saleAmount) <= 0) {
      errs.amount = 'Weka kiasi sahihi cha mauzo';
    }
    if (!amountPaid || Number(amountPaid) <= 0) {
      errs.paid = 'Weka kiasi kilicholipwa';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate() || !selectedUnit) return;

    setIsSubmitting(true);
    const salePayload = {
      unit_id: selectedUnit.id,
      branch_id: selectedUnit.branchId,
      customer_name: customerName.trim(),
      customer_phone: customerPhone.trim(),
      customer_nida: customerNida.trim() || undefined,
      customer_location: customerLocation.trim() || undefined,
      amount: Number(saleAmount),
      amount_paid: Number(amountPaid),
      payment_method: paymentMethod,
      payment_ref: paymentRef.trim() || undefined,
      notes: notes.trim() || undefined,
    };

    try {
      const res = await operationsApi.recordSale(salePayload);

      appendSale(res.sale, res.unit, res.customer);
      void refreshData();

      Alert.alert(
        'Mauzo Yamekamilika!',
        `Risiti: ${res.sale.receiptNumber}\nPikipiki: ${selectedUnit.modelName} (Chassis: ${selectedUnit.chassisNumber})\nMteja: ${res.sale.customerName}`,
        [
          {
            text: 'Sawa',
            onPress: () => navigation.goBack(),
          },
        ],
      );
    } catch {
      // Offline fallback: save locally and enqueue
      try {
        const offlineResult = await recordSaleOffline(salePayload);
        Alert.alert(
          'Mauzo Yamekamilika (Offline Mode)!',
          `Risiti ya Muda: ${offlineResult.sale.receiptNumber}\nPikipiki: ${selectedUnit.modelName} (Chassis: ${selectedUnit.chassisNumber})\nMteja: ${customerName}\n\nSimu haijaunganishwa na mtandao lakini mauzo yamehifadhiwa salama kwenye simu na yatasawazishwa kiotomatiki mtandao ukirudi.`,
          [
            {
              text: 'Sawa',
              onPress: () => navigation.goBack(),
            },
          ],
        );
      } catch (offlineErr: any) {
        Alert.alert(t.error, offlineErr.message || 'Hitilafu ya kurekodi mauzo offline');
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
            {t.newSaleTitle}
          </Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Select In-Stock Vehicle */}
          <View style={styles.formGroup}>
            <View style={styles.labelRowBetween}>
              <Text style={[styles.label, { color: themeColors.textSecondary }]}>
                {t.selectUnit} ({inStockUnits.length}) *
              </Text>
              <TouchableOpacity
                style={styles.scanChassisBtn}
                onPress={() => setShowScanner(true)}
                activeOpacity={0.7}
              >
                <Ionicons name="camera-outline" size={15} color={colors.primary} />
                <Text style={styles.scanChassisBtnText}>Scan Chassis</Text>
              </TouchableOpacity>
            </View>

            {selectedUnit && (
              <View
                style={[
                  styles.selectedUnitBanner,
                  {
                    backgroundColor: isDarkMode ? colors.dark.card : colors.card,
                    borderColor: colors.primary,
                  },
                ]}
              >
                <View style={styles.selectedUnitInfo}>
                  <Text style={[styles.selectedUnitModel, { color: themeColors.text }]}>
                    {selectedUnit.modelName} ({selectedUnit.vehicleType})
                  </Text>
                  <Text style={styles.selectedUnitChassis}>
                    Chassis: {selectedUnit.chassisNumber}
                  </Text>
                  <Text style={[styles.selectedUnitBranch, { color: themeColors.textSecondary }]}>
                    {selectedUnit.branchName}
                  </Text>
                </View>
                <View style={styles.selectedUnitRight}>
                  <View style={styles.verifiedBadge}>
                    <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
                    <Text style={styles.verifiedBadgeText}>Tayari</Text>
                  </View>
                  <Text style={styles.selectedUnitPrice}>
                    TZS {Number(selectedUnit.price).toLocaleString('en-US')}
                  </Text>
                </View>
              </View>
            )}

            {inStockUnits.length === 0 ? (
              <View style={styles.emptyUnitsWarning}>
                <Ionicons name="alert-circle" size={18} color={colors.warning} />
                <Text style={styles.warningText}>
                  Hakuna pikipiki iliyopo stoo (IN STOCK) kwa sasa. Pokea mzigo kwanza.
                </Text>
              </View>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.unitsScroll}>
                {inStockUnits.map((u) => {
                  const isSelected = selectedUnit?.id === u.id;
                  return (
                    <TouchableOpacity
                      key={u.id}
                      style={[
                        styles.unitChip,
                        {
                          backgroundColor: isSelected
                            ? colors.primaryLight
                            : isDarkMode
                            ? colors.dark.card
                            : colors.card,
                          borderColor: isSelected ? colors.primary : themeColors.border,
                        },
                      ]}
                      onPress={() => handleSelectUnit(u)}
                    >
                      <View style={styles.chipHeader}>
                        <Text
                          style={[
                            styles.unitChipTitle,
                            { color: isSelected ? colors.primaryText : themeColors.text },
                          ]}
                        >
                          {u.modelName}
                        </Text>
                        <Text style={styles.typePill}>{u.vehicleType}</Text>
                      </View>
                      <Text style={[styles.chassisPill, { color: themeColors.textSecondary }]}>
                        {u.chassisNumber}
                      </Text>
                      <Text style={styles.pricePill}>
                        TZS {Number(u.price).toLocaleString('en-US')}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
            {errors.unit ? <Text style={styles.fieldError}>{errors.unit}</Text> : null}
          </View>

          {/* Customer Full Name */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: themeColors.textSecondary }]}>
              {t.customerName} *
            </Text>
            <View
              style={[
                styles.inputBox,
                {
                  backgroundColor: isDarkMode ? colors.dark.card : colors.card,
                  borderColor: errors.name ? colors.danger : themeColors.border,
                },
              ]}
            >
              <Ionicons name="person-outline" size={18} color={colors.primary} />
              <TextInput
                style={[styles.input, { color: themeColors.text }]}
                placeholder="Mfano: Juma Khamis Bakari"
                placeholderTextColor={themeColors.textMuted}
                value={customerName}
                onChangeText={setCustomerName}
              />
            </View>
            {errors.name ? <Text style={styles.fieldError}>{errors.name}</Text> : null}
          </View>

          {/* Customer Phone & NIDA */}
          <View style={styles.twoColRow}>
            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={[styles.label, { color: themeColors.textSecondary }]}>
                {t.customerPhone} *
              </Text>
              <View
                style={[
                  styles.inputBox,
                  {
                    backgroundColor: isDarkMode ? colors.dark.card : colors.card,
                    borderColor: errors.phone ? colors.danger : themeColors.border,
                  },
                ]}
              >
                <Ionicons name="call-outline" size={16} color={colors.primary} />
                <TextInput
                  style={[styles.input, { color: themeColors.text }]}
                  placeholder="0713..."
                  placeholderTextColor={themeColors.textMuted}
                  keyboardType="phone-pad"
                  value={customerPhone}
                  onChangeText={setCustomerPhone}
                />
              </View>
              {errors.phone ? <Text style={styles.fieldError}>{errors.phone}</Text> : null}
            </View>

            <View style={[styles.formGroup, { flex: 1 }]}>
              <View style={styles.labelRowBetween}>
                <Text style={[styles.label, { color: themeColors.textSecondary }]}>
                  {t.nidaNumber}
                </Text>
                <TouchableOpacity
                  style={styles.scanNidaBtn}
                  onPress={() => setShowNidaScanner(true)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="scan-outline" size={13} color={colors.primary} />
                  <Text style={styles.scanNidaBtnText}>Scan</Text>
                </TouchableOpacity>
              </View>
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
                  placeholder="1990..."
                  placeholderTextColor={themeColors.textMuted}
                  keyboardType="numeric"
                  value={customerNida}
                  onChangeText={setCustomerNida}
                />
              </View>
            </View>
          </View>

          {/* Customer Location */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: themeColors.textSecondary }]}>
              {t.customerLocation}
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
              <Ionicons name="location-outline" size={18} color={themeColors.textSecondary} />
              <TextInput
                style={[styles.input, { color: themeColors.text }]}
                placeholder="Mfano: Kariakoo / Mwembeladu"
                placeholderTextColor={themeColors.textMuted}
                value={customerLocation}
                onChangeText={setCustomerLocation}
              />
            </View>
          </View>

          {/* Financials: Sale Amount & Paid */}
          <View style={styles.twoColRow}>
            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={[styles.label, { color: themeColors.textSecondary }]}>
                {t.saleAmount} *
              </Text>
              <View
                style={[
                  styles.inputBox,
                  {
                    backgroundColor: isDarkMode ? colors.dark.card : colors.card,
                    borderColor: errors.amount ? colors.danger : themeColors.border,
                  },
                ]}
              >
                <TextInput
                  style={[styles.input, { color: themeColors.text, fontWeight: '700' }]}
                  keyboardType="numeric"
                  value={saleAmount}
                  onChangeText={setSaleAmount}
                />
              </View>
              {errors.amount ? <Text style={styles.fieldError}>{errors.amount}</Text> : null}
            </View>

            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={[styles.label, { color: themeColors.textSecondary }]}>
                {t.amountPaid} *
              </Text>
              <View
                style={[
                  styles.inputBox,
                  {
                    backgroundColor: isDarkMode ? colors.dark.card : colors.card,
                    borderColor: errors.paid ? colors.danger : themeColors.border,
                  },
                ]}
              >
                <TextInput
                  style={[styles.input, { color: colors.primary, fontWeight: '700' }]}
                  keyboardType="numeric"
                  value={amountPaid}
                  onChangeText={setAmountPaid}
                />
              </View>
              {errors.paid ? <Text style={styles.fieldError}>{errors.paid}</Text> : null}
            </View>
          </View>

          {/* Payment Method */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: themeColors.textSecondary }]}>
              {t.paymentMethod}
            </Text>
            <View style={styles.paymentMethodsRow}>
              {(['CASH', 'MOBILE_MONEY', 'BANK_TRANSFER', 'INSTALLMENT'] as PaymentMethod[]).map(
                (m) => {
                  const isSelected = paymentMethod === m;
                  return (
                    <TouchableOpacity
                      key={m}
                      style={[
                        styles.paymentMethodBtn,
                        {
                          backgroundColor: isSelected
                            ? colors.navy
                            : isDarkMode
                            ? colors.dark.card
                            : colors.card,
                          borderColor: isSelected ? colors.navy : themeColors.border,
                        },
                      ]}
                      onPress={() => setPaymentMethod(m)}
                    >
                      <Text
                        style={[
                          styles.paymentMethodText,
                          { color: isSelected ? '#FFFFFF' : themeColors.text },
                        ]}
                      >
                        {m === 'CASH'
                          ? 'Cash'
                          : m === 'MOBILE_MONEY'
                          ? 'M-Pesa/Tigo'
                          : m === 'BANK_TRANSFER'
                          ? 'Bank'
                          : 'Awamu'}
                      </Text>
                    </TouchableOpacity>
                  );
                },
              )}
            </View>
          </View>

          {/* Payment Ref */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: themeColors.textSecondary }]}>
              {t.paymentReference}
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
                placeholder="Mfano: QZ8871203"
                placeholderTextColor={themeColors.textMuted}
                value={paymentRef}
                onChangeText={setPaymentRef}
              />
            </View>
          </View>

          {/* Notes */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: themeColors.textSecondary }]}>
              {t.notes}
            </Text>
            <View
              style={[
                styles.inputBox,
                {
                  backgroundColor: isDarkMode ? colors.dark.card : colors.card,
                  borderColor: themeColors.border,
                  minHeight: 60,
                },
              ]}
            >
              <TextInput
                style={[styles.input, { color: themeColors.text }]}
                placeholder="Maelezo ya ziada kuhusu mauzo haya..."
                placeholderTextColor={themeColors.textMuted}
                multiline
                value={notes}
                onChangeText={setNotes}
              />
            </View>
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && { opacity: 0.8 }]}
            onPress={handleSubmit}
            disabled={isSubmitting || inStockUnits.length === 0}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
                <Text style={styles.submitButtonText}>{t.completeSale}</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>

        <QuickScannerModal
          visible={showScanner}
          onClose={() => setShowScanner(false)}
          onScan={handleScanChassis}
          title="Scan Chassis ya Pikipiki"
          subtitle="Elekeza kamera kwenye barcode ya chassis ya pikipiki inayouzwa"
        />

        <QuickScannerModal
          visible={showNidaScanner}
          onClose={() => setShowNidaScanner(false)}
          onScan={(scanned) => setCustomerNida(scanned)}
          title="Scan Kitambulisho cha NIDA"
          subtitle="Elekeza kamera kwenye barcode ya kitambulisho cha Taifa (NIDA)"
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
  labelRowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  scanChassisBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  scanChassisBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  scanNidaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  scanNidaBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.navy,
  },
  selectedUnitBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: layout.borderRadiusSm,
    borderWidth: 1.5,
    marginBottom: spacing.sm,
    ...layout.shadow,
  },
  selectedUnitInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  selectedUnitModel: {
    fontSize: 14,
    fontWeight: '700',
  },
  selectedUnitChassis: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'monospace',
    color: colors.primary,
    marginTop: 2,
  },
  selectedUnitBranch: {
    fontSize: 11,
    marginTop: 2,
  },
  selectedUnitRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.successLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  verifiedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.success,
  },
  selectedUnitPrice: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primary,
  },
  emptyUnitsWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.warningLight,
    padding: spacing.md,
    borderRadius: layout.borderRadiusSm,
  },
  warningText: {
    fontSize: 12,
    color: colors.warning,
    flex: 1,
    fontWeight: '600',
  },
  unitsScroll: {
    flexDirection: 'row',
  },
  unitChip: {
    padding: 12,
    borderRadius: layout.borderRadiusSm,
    borderWidth: 1.5,
    marginRight: 8,
    minWidth: 160,
  },
  chipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  unitChipTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  typePill: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.navy,
  },
  chassisPill: {
    fontSize: 11,
    fontFamily: 'monospace',
    marginVertical: 4,
  },
  pricePill: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
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
  fieldError: {
    color: colors.danger,
    fontSize: 11,
    marginTop: 4,
    fontWeight: '500',
  },
  twoColRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  paymentMethodsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  paymentMethodBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: layout.minTouchTarget,
  },
  paymentMethodText: {
    fontSize: 11,
    fontWeight: '700',
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
