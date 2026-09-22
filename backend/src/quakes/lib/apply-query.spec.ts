import { applyQuery } from './apply-query';
import { QuakeRecord, QuakeSort } from '../types/quake.types';

function quake(overrides: Partial<QuakeRecord>): QuakeRecord {
  return {
    id: 'id',
    magnitude: 1,
    magnitudeType: 'mb',
    place: 'Somewhere',
    time: 0,
    depthKm: 10,
    latitude: 0,
    longitude: 0,
    tsunami: false,
    significance: 0,
    felt: null,
    status: 'reviewed',
    url: 'https://earthquake.usgs.gov',
    ...overrides,
  };
}

describe('applyQuery', () => {
  it('sorts by time descending by default', () => {
    const quakes = [quake({ id: 'a', time: 100 }), quake({ id: 'b', time: 300 }), quake({ id: 'c', time: 200 })];
    const result = applyQuery(quakes, { sort: QuakeSort.Time });
    expect(result.map((q) => q.id)).toEqual(['b', 'c', 'a']);
  });

  it('sorts by magnitude descending, placing nulls last', () => {
    const quakes = [
      quake({ id: 'a', magnitude: 2, time: 1 }),
      quake({ id: 'b', magnitude: null, time: 2 }),
      quake({ id: 'c', magnitude: 5, time: 3 }),
    ];
    const result = applyQuery(quakes, { sort: QuakeSort.Magnitude });
    expect(result.map((q) => q.id)).toEqual(['c', 'a', 'b']);
  });

  it('filters out quakes below minMagnitude', () => {
    const quakes = [quake({ id: 'a', magnitude: 1 }), quake({ id: 'b', magnitude: 5 })];
    const result = applyQuery(quakes, { sort: QuakeSort.Time, minMagnitude: 4 });
    expect(result.map((q) => q.id)).toEqual(['b']);
  });

  it('excludes a null magnitude when a minMagnitude filter is set', () => {
    const quakes = [quake({ id: 'a', magnitude: null }), quake({ id: 'b', magnitude: 5 })];
    const result = applyQuery(quakes, { sort: QuakeSort.Time, minMagnitude: 0 });
    expect(result.map((q) => q.id)).toEqual(['b']);
  });

  it('keeps a null magnitude when no filter is set', () => {
    const quakes = [quake({ id: 'a', magnitude: null })];
    const result = applyQuery(quakes, { sort: QuakeSort.Time });
    expect(result.map((q) => q.id)).toEqual(['a']);
  });

  it('does not mutate the input array', () => {
    const quakes = [quake({ id: 'a', time: 1 }), quake({ id: 'b', time: 2 })];
    const copy = [...quakes];
    applyQuery(quakes, { sort: QuakeSort.Time });
    expect(quakes).toEqual(copy);
  });
});
