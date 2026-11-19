import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../theme';
import { useApp } from '../context/AppContext';

export const OfflineSyncBanner: React.FC = () => {
  const { isOffline, pendingQueueCount, isSyncing, syncNow, language } = useApp();

  // If online and nothing is queued, banner is hidden
  if (!isOffline && pendingQueueCount === 0 && !isSyncing) {
    return null;
  }

  const handleSyncPress = async () => {
    if (isSyncing) return;
    try {
      await syncNow();
    } catch {
      // offline error handled inside
    }
  };

  return (
    <View
      style={[
        styles.banner,
        {
          backgroundColor: isSyncing
            ? colors.navy
            : pendingQueueCount > 0
            ? '#D97706'
            : '#B45309',
        },
      ]}
    >
      <View style={styles.contentLeft}>
        {isSyncing ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Ionicons
            name={isOffline ? 'cloud-offline-outline' : 'cloud-upload-outline'}
            size={18}
            color="#FFFFFF"
          />
        )}
        <View>
          <Text style={styles.titleText}>
            {isSyncing
              ? language === 'sw'
                ? 'Inalandanisha na seva...'
                : 'Syncing with server...'
              : isOffline
              ? language === 'sw'
                ? 'Hali ya Bila Mtandao (Offline)'
                : 'Offline Mode Active'
              : language === 'sw'
              ? 'Miamala ya Offline Tayari'
              : 'Pending Offline Queue'}
          </Text>
          <Text style={styles.subtitleText}>
            {pendingQueueCount > 0
              ? language === 'sw'
                ? `Miamala ${pendingQueueCount} inasubiri kutumwa mtandao ukirudi`
                : `${pendingQueueCount} transaction(s) pending sync`
              : language === 'sw'
              ? 'Taarifa zote zimehifadhiwa salama kwenye simu'
              : 'Changes saved locally on device'}
          </Text>
        </View>
      </View>

      {pendingQueueCount > 0 && !isSyncing && (
        <TouchableOpacity
          style={styles.syncBtn}
          onPress={handleSyncPress}
          activeOpacity={0.8}
        >
          <Ionicons name="refresh" size={14} color="#FFFFFF" />
          <Text style={styles.syncBtnText}>
            {language === 'sw' ? 'Landanisha' : 'Sync'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: 8,
  },
  contentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  titleText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  subtitleText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 10,
    fontWeight: '500',
  },
  syncBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  syncBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
});
