import { Injectable } from '@nestjs/common';
import { QuakeFeed, QuakeRange } from './types/quake.types';

export const CACHE_TTL_MS = 5 * 60 * 1000;

export interface CacheEntry {
  storedAt: number;
  feed: QuakeFeed;
}

@Injectable()
export class QuakesCacheService {
  private readonly entries = new Map<QuakeRange, CacheEntry>();

  get(range: QuakeRange): CacheEntry | undefined {
    return this.entries.get(range);
  }

  set(range: QuakeRange, feed: QuakeFeed, storedAt: number): void {
    this.entries.set(range, { storedAt, feed });
  }

  isStale(entry: CacheEntry, now: number): boolean {
    return now - entry.storedAt > CACHE_TTL_MS;
  }

  allEntries(): CacheEntry[] {
    return Array.from(this.entries.values());
  }
}
