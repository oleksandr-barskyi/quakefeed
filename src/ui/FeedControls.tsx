import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { FeedMagnitude, FeedSelection, FeedWindow } from '../api/types';
import { Query, SortMode } from '../lib/query';
import { Chip } from './Chip';
import { colors, spacing } from './theme';

interface Props {
  selection: FeedSelection;
  query: Query;
  onSelectionChange: (selection: FeedSelection) => void;
  onQueryChange: (query: Query) => void;
}

const MAGNITUDES: { value: FeedMagnitude; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: '1.0', label: 'M1+' },
  { value: '2.5', label: 'M2.5+' },
  { value: '4.5', label: 'M4.5+' },
  { value: 'significant', label: 'Significant' },
];

const WINDOWS: { value: FeedWindow; label: string }[] = [
  { value: 'hour', label: 'Hour' },
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
];

const SORTS: { value: SortMode; label: string }[] = [
  { value: 'time', label: 'Newest' },
  { value: 'magnitude', label: 'Strongest' },
];

export function FeedControls({ selection, query, onSelectionChange, onQueryChange }: Props) {
  return (
    <View style={styles.container}>
      <TextInput
        accessibilityLabel="Filter by place"
        placeholder="Filter by place"
        placeholderTextColor={colors.textMuted}
        value={query.search}
        onChangeText={(search) => onQueryChange({ ...query, search })}
        autoCorrect={false}
        autoCapitalize="none"
        style={styles.search}
      />

      <Text style={styles.legend}>Feed</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.strip}>
        {MAGNITUDES.map((option) => (
          <Chip
            key={option.value}
            label={option.label}
            selected={selection.magnitude === option.value}
            onPress={() => onSelectionChange({ ...selection, magnitude: option.value })}
          />
        ))}
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.strip}>
        {WINDOWS.map((option) => (
          <Chip
            key={option.value}
            label={option.label}
            selected={selection.window === option.value}
            onPress={() => onSelectionChange({ ...selection, window: option.value })}
          />
        ))}
      </ScrollView>

      <Text style={styles.legend}>Sort</Text>
      <View style={styles.strip}>
        {SORTS.map((option) => (
          <Chip
            key={option.value}
            label={option.label}
            selected={query.sort === option.value}
            onPress={() => onQueryChange({ ...query, sort: option.value })}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  search: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 15,
    marginBottom: spacing.md,
  },
  legend: {
    color: colors.textMuted,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  strip: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
});
