import AsyncStorage from '@react-native-async-storage/async-storage';

import { Feed, FeedSelection } from '../api/types';
import { feedKey } from '../api/usgs';

const CACHE_VERSION = 1;
const PREFIX = `quakefeed:v${CACHE_VERSION}:`;

export const STALE_AFTER_MS = 5 * 60 * 1000;

export interface CacheEntry {
  storedAt: number;
  feed: Feed;
}

function isCacheEntry(value: unknown): value is CacheEntry {
  if (typeof value !== 'object' || value === null) return false;
  const entry = value as Record<string, unknown>;
  if (typeof entry.storedAt !== 'number') return false;
  const feed = entry.feed as Record<string, unknown> | undefined;
  return typeof feed === 'object' && feed !== null && Array.isArray(feed.quakes);
}

export function isStale(storedAt: number, now: number): boolean {
  return now - storedAt > STALE_AFTER_MS;
}

export async function readCachedFeed(selection: FeedSelection): Promise<CacheEntry | null> {
  try {
    const raw = await AsyncStorage.getItem(PREFIX + feedKey(selection));
    if (raw === null) return null;
    const parsed: unknown = JSON.parse(raw);
    return isCacheEntry(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export async function writeCachedFeed(feed: Feed, storedAt: number): Promise<void> {
  const entry: CacheEntry = { storedAt, feed };
  try {
    await AsyncStorage.setItem(PREFIX + feedKey(feed.selection), JSON.stringify(entry));
  } catch {
    return;
  }
}

export async function clearCachedFeeds(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const owned = keys.filter((key) => key.startsWith(PREFIX));
    if (owned.length > 0) await AsyncStorage.multiRemove(owned);
  } catch {
    return;
  }
}
