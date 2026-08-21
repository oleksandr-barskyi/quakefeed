import { StyleSheet, Text, View } from 'react-native';

import { formatTimeAgo } from '../lib/format';
import { colors, spacing } from './theme';

interface Props {
  isOffline: boolean;
  isRefreshing: boolean;
  storedAt: number | null;
  now: number;
  count: number;
  total: number;
}

export function StatusBanner({ isOffline, isRefreshing, storedAt, now, count, total }: Props) {
  const counts = count === total ? `${total} events` : `${count} of ${total} events`;

  if (isOffline) {
    return (
      <View style={[styles.banner, styles.offline]}>
        <Text style={styles.offlineText}>
          Offline. Showing cached data
          {storedAt === null ? '' : ` from ${formatTimeAgo(storedAt, now)}`}.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.banner}>
      <Text style={styles.text}>
        {counts}
        {isRefreshing ? ' · refreshing' : ''}
        {!isRefreshing && storedAt !== null ? ` · updated ${formatTimeAgo(storedAt, now)}` : ''}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
  },
  offline: {
    backgroundColor: colors.warning,
  },
  text: {
    color: colors.textMuted,
    fontSize: 12,
  },
  offlineText: {
    color: colors.background,
    fontSize: 12,
    fontWeight: '600',
  },
});
