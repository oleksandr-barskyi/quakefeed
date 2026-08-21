import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Quake } from '../api/types';
import { formatDepth, formatTimeAgo } from '../lib/format';
import { MagnitudeBadge } from './MagnitudeBadge';
import { ROW_HEIGHT, colors, spacing } from './theme';

interface Props {
  quake: Quake;
  now: number;
  onPress: (id: string) => void;
}

function QuakeRowComponent({ quake, now, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={quake.place}
      onPress={() => onPress(quake.id)}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <MagnitudeBadge magnitude={quake.magnitude} />
      <View style={styles.body}>
        <Text numberOfLines={1} style={styles.place}>
          {quake.place}
        </Text>
        <Text numberOfLines={1} style={styles.meta}>
          {formatTimeAgo(quake.time, now)} · {formatDepth(quake.depthKm)}
          {quake.tsunami ? ' · tsunami alert' : ''}
        </Text>
      </View>
    </Pressable>
  );
}

function areEqual(previous: Props, next: Props): boolean {
  return (
    previous.quake.id === next.quake.id &&
    previous.now === next.now &&
    previous.onPress === next.onPress
  );
}

export const QuakeRow = memo(QuakeRowComponent, areEqual);

const styles = StyleSheet.create({
  row: {
    height: ROW_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowPressed: {
    backgroundColor: colors.surfaceRaised,
  },
  body: {
    flex: 1,
  },
  place: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  meta: {
    color: colors.textMuted,
    fontSize: 13,
  },
});
