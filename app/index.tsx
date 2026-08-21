import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { FlatList, ListRenderItemInfo, RefreshControl, StyleSheet, View } from 'react-native';

import { Quake } from '../src/api/types';
import { useFeed } from '../src/state/FeedProvider';
import { EmptyState } from '../src/ui/EmptyState';
import { FeedControls } from '../src/ui/FeedControls';
import { QuakeRow } from '../src/ui/QuakeRow';
import { StatusBanner } from '../src/ui/StatusBanner';
import { ROW_HEIGHT, colors } from '../src/ui/theme';

export default function FeedScreen() {
  const router = useRouter();
  const { controller, query, setQuery, visibleQuakes, totalQuakes, now } = useFeed();

  const openQuake = useCallback(
    (id: string) => router.push({ pathname: '/quake/[id]', params: { id } }),
    [router],
  );

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<Quake>) => (
      <QuakeRow quake={item} now={now} onPress={openQuake} />
    ),
    [now, openQuake],
  );

  const keyExtractor = useCallback((item: Quake) => item.id, []);

  const getItemLayout = useCallback(
    (_data: ArrayLike<Quake> | null | undefined, index: number) => ({
      length: ROW_HEIGHT,
      offset: ROW_HEIGHT * index,
      index,
    }),
    [],
  );

  const showEmptyState = controller.status !== 'ready' || visibleQuakes.length === 0;

  return (
    <View style={styles.screen}>
      <FeedControls
        selection={controller.selection}
        query={query}
        onSelectionChange={controller.setSelection}
        onQueryChange={setQuery}
      />
      <StatusBanner
        isOffline={controller.isOffline}
        isRefreshing={controller.isRefreshing}
        storedAt={controller.storedAt}
        now={now}
        count={visibleQuakes.length}
        total={totalQuakes}
      />
      {showEmptyState ? (
        <EmptyState
          kind={
            controller.status === 'loading'
              ? 'loading'
              : controller.status === 'error'
                ? 'error'
                : 'empty'
          }
          message={controller.status === 'error' ? controller.error : null}
          onRetry={controller.refresh}
        />
      ) : (
        <FlatList
          data={visibleQuakes}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          getItemLayout={getItemLayout}
          initialNumToRender={12}
          maxToRenderPerBatch={16}
          windowSize={11}
          removeClippedSubviews
          refreshControl={
            <RefreshControl
              refreshing={controller.isRefreshing}
              onRefresh={controller.refresh}
              tintColor={colors.accent}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
