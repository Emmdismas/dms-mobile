import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { colors, layout, spacing } from '../theme';

interface QuickScannerModalProps {
  visible: boolean;
  onClose: () => void;
  onScan: (scannedValue: string) => void;
  title?: string;
  subtitle?: string;
}

export const QuickScannerModal: React.FC<QuickScannerModalProps> = ({
  visible,
  onClose,
  onScan,
  title = 'Scan Chassis / VIN Barcode',
  subtitle = 'Elekeza kamera kwenye barcode ya chassis au stika ya pikipiki',
}) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);

  // Reset scan lock when modal opens
  React.useEffect(() => {
    if (visible) {
      setHasScanned(false);
    }
  }, [visible]);

  const handleBarcodeScanned = (result: { data: string }) => {
    if (hasScanned || !result.data) return;
    setHasScanned(true);

    // Clean scanned string (trim & uppercase)
    const cleaned = result.data.trim().toUpperCase();
    onScan(cleaned);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Top Controls */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.circleBtn}
            onPress={onClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <Text style={styles.topTitle}>{title}</Text>

          <TouchableOpacity
            style={[styles.circleBtn, torchEnabled && styles.circleBtnActive]}
            onPress={() => setTorchEnabled((prev) => !prev)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={torchEnabled ? 'flash' : 'flash-outline'}
              size={22}
              color={torchEnabled ? '#F59E0B' : '#FFFFFF'}
            />
          </TouchableOpacity>
        </View>

        {/* Camera View */}
        {!permission ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : !permission.granted ? (
          <View style={styles.centerBox}>
            <Ionicons name="camera-outline" size={56} color="#FFFFFF" />
            <Text style={styles.permissionTitle}>Ruhusa ya Kamera Inahitajika</Text>
            <Text style={styles.permissionSubtitle}>
              Ili kuscan barcode za chassis na risiti, app inahitaji ruhusa ya kamera.
            </Text>
            <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
              <Text style={styles.permissionBtnText}>Ruhusu Kamera</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <CameraView
            style={StyleSheet.absoluteFill}
            facing="back"
            enableTorch={torchEnabled}
            barcodeScannerSettings={{
              barcodeTypes: [
                'qr',
                'code128',
                'code39',
                'ean13',
                'ean8',
                'upc_a',
                'upc_e',
                'datamatrix',
                'itf14',
              ],
            }}
            onBarcodeScanned={handleBarcodeScanned}
          >
            {/* Viewfinder overlay */}
            <View style={styles.overlay}>
              <View style={styles.unfocusedContainer} />

              <View style={styles.middleRow}>
                <View style={styles.unfocusedContainer} />

                {/* Reticle / Target box */}
                <View style={styles.scanTarget}>
                  {/* Four Corner brackets */}
                  <View style={[styles.corner, styles.topLeft]} />
                  <View style={[styles.corner, styles.topRight]} />
                  <View style={[styles.corner, styles.bottomLeft]} />
                  <View style={[styles.corner, styles.bottomRight]} />

                  {/* Animated laser line simulation */}
                  <View style={styles.laserLine} />
                </View>

                <View style={styles.unfocusedContainer} />
              </View>

              <View style={[styles.unfocusedContainer, styles.bottomInstructions]}>
                <Text style={styles.instructionText}>{subtitle}</Text>
                <Text style={styles.hintText}>
                  Barcode itasomwa kiotomatiki mara ikitua kwenye fremu
                </Text>
              </View>
            </View>
          </CameraView>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  topBar: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    zIndex: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
  },
  topTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  circleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleBtnActive: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
    gap: spacing.md,
  },
  permissionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  permissionSubtitle: {
    color: '#94A3B8',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
  permissionBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: layout.borderRadiusSm,
    marginTop: spacing.sm,
  },
  permissionBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  overlay: {
    flex: 1,
  },
  unfocusedContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  middleRow: {
    flexDirection: 'row',
    height: 220,
  },
  scanTarget: {
    width: 280,
    height: 220,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: '#00D084',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 4,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 4,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 4,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 4,
  },
  laserLine: {
    width: '90%',
    height: 2,
    backgroundColor: '#00D084',
    shadowColor: '#00D084',
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
  bottomInstructions: {
    alignItems: 'center',
    paddingTop: spacing.xxl,
    paddingHorizontal: spacing.xl,
    gap: spacing.xs,
  },
  instructionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  hintText: {
    color: '#94A3B8',
    fontSize: 12,
    textAlign: 'center',
  },
});
