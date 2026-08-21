import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, spacing } from './theme';

interface Props {
  kind: 'loading' | 'error' | 'empty';
  message?: string | null;
  onRetry?: () => void;
}

const TITLES: Record<Props['kind'], string> = {
  loading: 'Loading the feed',
  error: 'Could not reach USGS',
  empty: 'Nothing matches',
};

const HINTS: Record<Props['kind'], string> = {
  loading: 'First load pulls the whole window in one request.',
  error: 'Check the connection and try again. Cached data is used when available.',
  empty: 'Widen the magnitude filter or clear the place filter.',
};

export function EmptyState({ kind, message, onRetry }: Props) {
  return (
    <View style={styles.container}>
      {kind === 'loading' ? <ActivityIndicator color={colors.accent} /> : null}
      <Text style={styles.title}>{TITLES[kind]}</Text>
      <Text style={styles.hint}>{message ?? HINTS[kind]}</Text>
      {kind === 'error' && onRetry !== undefined ? (
        <Pressable accessibilityRole="button" onPress={onRetry} style={styles.button}>
          <Text style={styles.buttonLabel}>Try again</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  title: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  hint: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  button: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 10,
    backgroundColor: colors.accent,
  },
  buttonLabel: {
    color: colors.background,
    fontWeight: '700',
  },
});
