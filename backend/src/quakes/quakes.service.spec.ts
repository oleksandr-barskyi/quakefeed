import { Test } from '@nestjs/testing';
import { QuakesCacheService } from './quakes-cache.service';
import { QuakesService } from './quakes.service';
import { QuakeRange, QuakeSort } from './types/quake.types';
import { UsgsClientService } from './usgs-client.service';

function usgsPayload(ids: string[]): unknown {
  return {
    metadata: { generated: 1700000001000, title: 'USGS earthquake feed' },
    features: ids.map((id) => ({
      id,
      properties: { mag: 3, magType: 'mb', place: 'Somewhere', time: 1700000000000, sig: 100, status: 'reviewed' },
      geometry: { coordinates: [1, 2, 10] },
    })),
  };
}

describe('QuakesService', () => {
  let service: QuakesService;
  let usgsClient: { fetchRange: jest.Mock };

  beforeEach(async () => {
    usgsClient = { fetchRange: jest.fn().mockResolvedValue(usgsPayload(['a'])) };

    const moduleRef = await Test.createTestingModule({
      providers: [
        QuakesService,
        QuakesCacheService,
        { provide: UsgsClientService, useValue: usgsClient },
      ],
    }).compile();

    service = moduleRef.get(QuakesService);
  });

  it('fetches from USGS on a cache miss', async () => {
    const feed = await service.getFeed(QuakeRange.Day, 1000);
    expect(usgsClient.fetchRange).toHaveBeenCalledTimes(1);
    expect(feed.quakes).toHaveLength(1);
  });

  it('serves a fresh cache entry without calling USGS again', async () => {
    await service.getFeed(QuakeRange.Day, 1000);
    await service.getFeed(QuakeRange.Day, 1000 + 60_000);
    expect(usgsClient.fetchRange).toHaveBeenCalledTimes(1);
  });

  it('refetches once the cache entry goes stale', async () => {
    await service.getFeed(QuakeRange.Day, 1000);
    await service.getFeed(QuakeRange.Day, 1000 + 6 * 60_000);
    expect(usgsClient.fetchRange).toHaveBeenCalledTimes(2);
  });

  it('applies the query filter and sort on top of the cached feed', async () => {
    usgsClient.fetchRange.mockResolvedValue(usgsPayload(['a', 'b']));
    const quakes = await service.getQuakes({ range: QuakeRange.Day, sort: QuakeSort.Time });
    expect(quakes.map((q) => q.id)).toEqual(['a', 'b']);
  });

  it('finds a quake by id once its feed has been cached', async () => {
    await service.getFeed(QuakeRange.Day, 1000);
    const found = await service.getQuakeById('a');
    expect(found?.id).toBe('a');
  });

  it('returns null for an id that was never cached', async () => {
    const found = await service.getQuakeById('does-not-exist');
    expect(found).toBeNull();
  });
});
