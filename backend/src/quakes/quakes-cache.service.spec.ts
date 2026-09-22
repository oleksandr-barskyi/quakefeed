import { QuakesCacheService, CACHE_TTL_MS } from './quakes-cache.service';
import { QuakeFeed, QuakeRange } from './types/quake.types';

function emptyFeed(range: QuakeRange): QuakeFeed {
  return { range, generatedAt: 0, title: 'USGS earthquake feed', quakes: [] };
}

describe('QuakesCacheService', () => {
  it('returns undefined for a range that was never cached', () => {
    const cache = new QuakesCacheService();
    expect(cache.get(QuakeRange.Day)).toBeUndefined();
  });

  it('returns what was stored for that range', () => {
    const cache = new QuakesCacheService();
    const feed = emptyFeed(QuakeRange.Day);
    cache.set(QuakeRange.Day, feed, 1000);
    expect(cache.get(QuakeRange.Day)).toEqual({ storedAt: 1000, feed });
  });

  it('keeps ranges independent of each other', () => {
    const cache = new QuakesCacheService();
    cache.set(QuakeRange.Day, emptyFeed(QuakeRange.Day), 1000);
    expect(cache.get(QuakeRange.Week)).toBeUndefined();
  });

  it('is not stale right after being stored', () => {
    const cache = new QuakesCacheService();
    const entry = { storedAt: 1000, feed: emptyFeed(QuakeRange.Day) };
    expect(cache.isStale(entry, 1000)).toBe(false);
  });

  it('is not stale just under the TTL', () => {
    const cache = new QuakesCacheService();
    const entry = { storedAt: 1000, feed: emptyFeed(QuakeRange.Day) };
    expect(cache.isStale(entry, 1000 + CACHE_TTL_MS)).toBe(false);
  });

  it('is stale just past the TTL', () => {
    const cache = new QuakesCacheService();
    const entry = { storedAt: 1000, feed: emptyFeed(QuakeRange.Day) };
    expect(cache.isStale(entry, 1000 + CACHE_TTL_MS + 1)).toBe(true);
  });

  it('overwrites a previous entry for the same range', () => {
    const cache = new QuakesCacheService();
    cache.set(QuakeRange.Day, emptyFeed(QuakeRange.Day), 1000);
    const second = emptyFeed(QuakeRange.Day);
    cache.set(QuakeRange.Day, second, 2000);
    expect(cache.get(QuakeRange.Day)).toEqual({ storedAt: 2000, feed: second });
  });

  it('lists all currently cached entries', () => {
    const cache = new QuakesCacheService();
    cache.set(QuakeRange.Day, emptyFeed(QuakeRange.Day), 1000);
    cache.set(QuakeRange.Week, emptyFeed(QuakeRange.Week), 2000);
    expect(cache.allEntries()).toHaveLength(2);
  });
});
