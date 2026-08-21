import { useLocalSearchParams } from 'expo-router';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useFeed } from '../../src/state/FeedProvider';
import {
  formatCoordinates,
  formatDepth,
  formatFelt,
  formatTimeAgo,
  magnitudeBucket,
} from '../../src/lib/format';
import { EmptyState } from '../../src/ui/EmptyState';
import { MagnitudeBadge } from '../../src/ui/MagnitudeBadge';
import { colors, spacing } from '../../src/ui/theme';

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detail}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

export default function QuakeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { findQuake, controller, now } = useFeed();

  const quake = typeof id === 'string' ? findQuake(id) : undefined;

  if (quake === undefined) {
    return (
      <EmptyState
        kind={controller.status === 'loading' ? 'loading' : 'empty'}
        message={
          controller.status === 'loading'
            ? 'Loading the feed that contains this event.'
            : 'This event is not in the current feed. Widen the window and try again.'
        }
      />
    );
  }

  const felt = formatFelt(quake.felt);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <MagnitudeBadge magnitude={quake.magnitude} size="large" />
        <View style={styles.headerBody}>
          <Text style={styles.place}>{quake.place}</Text>
          <Text style={styles.bucket}>
            {magnitudeBucket(quake.magnitude)} · {formatTimeAgo(quake.time, now)}
          </Text>
        </View>
      </View>

      {quake.tsunami ? (
        <View style={styles.alert}>
          <Text style={styles.alertText}>Tsunami alert was issued for this event</Text>
        </View>
      ) : null}

      <Detail label="Time" value={new Date(quake.time).toUTCString()} />
      <Detail label="Depth" value={formatDepth(quake.depthKm)} />
      <Detail label="Coordinates" value={formatCoordinates(quake.latitude, quake.longitude)} />
      <Detail label="Magnitude type" value={quake.magnitudeType ?? 'unknown'} />
      <Detail label="Review status" value={quake.status} />
      <Detail label="Significance" value={String(quake.significance)} />
      {felt === null ? null : <Detail label="Felt reports" value={felt} />}

      <Pressable
        accessibilityRole="link"
        onPress={() => Linking.openURL(quake.url)}
        style={styles.button}
      >
        <Text style={styles.buttonLabel}>Open on USGS</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  headerBody: {
    flex: 1,
  },
  place: {
    color: colors.text,
    fontSize: 19,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  bucket: {
    color: colors.textMuted,
    fontSize: 14,
    textTransform: 'capitalize',
  },
  alert: {
    backgroundColor: colors.danger,
    borderRadius: 10,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  alertText: {
    color: colors.text,
    fontWeight: '700',
  },
  detail: {
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  detailLabel: {
    color: colors.textMuted,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  detailValue: {
    color: colors.text,
    fontSize: 15,
  },
  button: {
    marginTop: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 10,
    backgroundColor: colors.accent,
    alignItems: 'center',
  },
  buttonLabel: {
    color: colors.background,
    fontWeight: '700',
  },
});
