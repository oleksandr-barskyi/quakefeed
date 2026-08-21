import { Quake } from '../src/api/types';
import { applyQuery, countByBucketThreshold, defaultQuery, sortQuakes } from '../src/lib/query';

function quake(overrides: Partial<Quake>): Quake {
  return {
    id: 'id',
    magnitude: 3,
    magnitudeType: 'ml',
    place: 'Somewhere',
    time: 1_700_000_000_000,
    depthKm: 10,
    latitude: 0,
    longitude: 0,
    tsunami: false,
    significance: 100,
    felt: null,
    status: 'reviewed',
    url: 'https://example.test',
    ...overrides,
  };
}

const alaska = quake({ id: 'a', place: '40km S of Alaska', magnitude: 2.1, time: 300 });
const chile = quake({ id: 'b', place: 'Offshore Chile', magnitude: 5.6, time: 200 });
const nowhere = quake({ id: 'c', place: 'Unknown region', magnitude: null, time: 100 });

const all = [alaska, chile, nowhere];

describe('applyQuery', () => {
  it('returns everything sorted by time with the default query', () => {
    expect(applyQuery(all, defaultQuery).map((item) => item.id)).toEqual(['a', 'b', 'c']);
  });

  it('filters by place, ignoring case and padding', () => {
    const result = applyQuery(all, { ...defaultQuery, search: '  chile ' });
    expect(result.map((item) => item.id)).toEqual(['b']);
  });

  it('filters by minimum magnitude', () => {
    const result = applyQuery(all, { ...defaultQuery, minMagnitude: 3 });
    expect(result.map((item) => item.id)).toEqual(['b']);
  });

  it('excludes events without a magnitude once a threshold is set', () => {
    const result = applyQuery([nowhere], { ...defaultQuery, minMagnitude: 0.1 });
    expect(result).toEqual([]);
  });

  it('keeps events without a magnitude when no threshold is set', () => {
    const result = applyQuery([nowhere], defaultQuery);
    expect(result).toHaveLength(1);
  });

  it('does not mutate the input array', () => {
    const input = [...all];
    applyQuery(input, { ...defaultQuery, sort: 'magnitude' });
    expect(input.map((item) => item.id)).toEqual(['a', 'b', 'c']);
  });
});

describe('sortQuakes', () => {
  it('sorts strongest first and pushes unknown magnitudes to the end', () => {
    expect(sortQuakes(all, 'magnitude').map((item) => item.id)).toEqual(['b', 'a', 'c']);
  });

  it('breaks magnitude ties by recency', () => {
    const older = quake({ id: 'older', magnitude: 4, time: 100 });
    const newer = quake({ id: 'newer', magnitude: 4, time: 900 });
    expect(sortQuakes([older, newer], 'magnitude').map((item) => item.id)).toEqual([
      'newer',
      'older',
    ]);
  });

  it('sorts newest first by time', () => {
    expect(sortQuakes(all, 'time').map((item) => item.id)).toEqual(['a', 'b', 'c']);
  });
});

describe('countByBucketThreshold', () => {
  it('counts only events at or above the threshold', () => {
    expect(countByBucketThreshold(all, 2)).toBe(2);
    expect(countByBucketThreshold(all, 5)).toBe(1);
    expect(countByBucketThreshold(all, 9)).toBe(0);
  });
});
