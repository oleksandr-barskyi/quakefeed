import { Injectable } from '@nestjs/common';
import { GetQuakesQueryDto } from './dto/get-quakes-query.dto';
import { applyQuery } from './lib/apply-query';
import { parseFeed } from './lib/parse-feed';
import { QuakesCacheService } from './quakes-cache.service';
import { QuakeFeed, QuakeRange, QuakeRecord } from './types/quake.types';
import { UsgsClientService } from './usgs-client.service';

@Injectable()
export class QuakesService {
  constructor(
    private readonly usgsClient: UsgsClientService,
    private readonly cache: QuakesCacheService,
  ) {}

  async getFeed(range: QuakeRange, now: number = Date.now()): Promise<QuakeFeed> {
    const cached = this.cache.get(range);
    if (cached && !this.cache.isStale(cached, now)) {
      return cached.feed;
    }

    const raw = await this.usgsClient.fetchRange(range);
    const feed = parseFeed(range, raw);
    this.cache.set(range, feed, now);
    return feed;
  }

  async getQuakes(query: GetQuakesQueryDto): Promise<QuakeRecord[]> {
    const feed = await this.getFeed(query.range);
    return applyQuery(feed.quakes, { minMagnitude: query.minMagnitude, sort: query.sort });
  }

  async getQuakeById(id: string): Promise<QuakeRecord | null> {
    for (const entry of this.cache.allEntries()) {
      const found = entry.feed.quakes.find((quake) => quake.id === id);
      if (found) return found;
    }
    return null;
  }
}
