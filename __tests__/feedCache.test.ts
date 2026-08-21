import AsyncStorage from '@react-native-async-storage/async-storage';

import { Feed, FeedSelection } from '../src/api/types';
import {
  STALE_AFTER_MS,
  clearCachedFeeds,
  isStale,
  readCachedFeed,
  writeCachedFeed,
} from '../src/cache/feedCache';

const selection: FeedSelection = { magnitude: 'all', window: 'day' };

const feed: Feed = {
  selection,
  generatedAt: 1_700_000_000_000,
  title: 'USGS All Earthquakes, Past Day',
  quakes: [
    {
      id: 'ci1',
      magnitude: 2.2,
      magnitudeType: 'ml',
      place: 'Somewhere',
      time: 1_700_000_000_000,
      depthKm: 5,
      latitude: 1,
      longitude: 2,
      tsunami: false,
      significance: 12,
      felt: null,
      status: 'automatic',
      url: 'https://example.test',
    },
  ],
};

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('isStale', () => {
  it('is fresh inside the window', () => {
    expect(isStale(1000, 1000 + STALE_AFTER_MS - 1)).toBe(false);
  });

  it('is stale past the window', () => {
    expect(isStale(1000, 1000 + STALE_AFTER_MS + 1)).toBe(true);
  });
});

describe('feed cache', () => {
  it('returns null when nothing was written', async () => {
    await expect(readCachedFeed(selection)).resolves.toBeNull();
  });

  it('round trips a feed', async () => {
    await writeCachedFeed(feed, 1_700_000_500_000);
    const entry = await readCachedFeed(selection);

    expect(entry?.storedAt).toBe(1_700_000_500_000);
    expect(entry?.feed.quakes).toHaveLength(1);
    expect(entry?.feed.quakes[0].id).toBe('ci1');
  });

  it('keeps feeds for different selections apart', async () => {
    await writeCachedFeed(feed, 1);
    const other = await readCachedFeed({ magnitude: '4.5', window: 'month' });
    expect(other).toBeNull();
  });

  it('discards a corrupted entry instead of throwing', async () => {
    await writeCachedFeed(feed, 1);
    const keys = await AsyncStorage.getAllKeys();
    await AsyncStorage.setItem(keys[0], '{ not json');

    await expect(readCachedFeed(selection)).resolves.toBeNull();
  });

  it('clears only its own keys', async () => {
    await writeCachedFeed(feed, 1);
    await AsyncStorage.setItem('unrelated', 'keep me');

    await clearCachedFeeds();

    await expect(readCachedFeed(selection)).resolves.toBeNull();
    await expect(AsyncStorage.getItem('unrelated')).resolves.toBe('keep me');
  });
});
