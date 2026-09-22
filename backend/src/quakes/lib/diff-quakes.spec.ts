import { diffQuakes } from './diff-quakes';
import { QuakeRecord } from '../types/quake.types';

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

describe('diffQuakes', () => {
  it('reports every quake as new against an empty known set', () => {
    const known = new Map<string, QuakeRecord>();
    const changes = diffQuakes(known, [quake({ id: 'a' }), quake({ id: 'b' })]);
    expect(changes).toHaveLength(2);
    expect(changes.every((change) => change.kind === 'new')).toBe(true);
  });

  it('reports nothing when nothing changed', () => {
    const a = quake({ id: 'a' });
    const known = new Map([['a', a]]);
    const changes = diffQuakes(known, [quake({ id: 'a' })]);
    expect(changes).toHaveLength(0);
  });

  it('reports an update when magnitude changes', () => {
    const known = new Map([['a', quake({ id: 'a', magnitude: 3 })]]);
    const changes = diffQuakes(known, [quake({ id: 'a', magnitude: 3.4 })]);
    expect(changes).toHaveLength(1);
    expect(changes[0].kind).toBe('updated');
  });

  it('reports an update when status changes', () => {
    const known = new Map([['a', quake({ id: 'a', status: 'automatic' })]]);
    const changes = diffQuakes(known, [quake({ id: 'a', status: 'reviewed' })]);
    expect(changes).toHaveLength(1);
    expect(changes[0].kind).toBe('updated');
  });

  it('ignores a field that is not tracked as material, such as felt', () => {
    const known = new Map([['a', quake({ id: 'a', felt: 3 })]]);
    const changes = diffQuakes(known, [quake({ id: 'a', felt: 40 })]);
    expect(changes).toHaveLength(0);
  });

  it('does not report a quake that disappeared from the current feed', () => {
    const known = new Map([['a', quake({ id: 'a' })]]);
    const changes = diffQuakes(known, []);
    expect(changes).toHaveLength(0);
  });

  it('batches several changes into one array in a single call', () => {
    const known = new Map([['a', quake({ id: 'a', magnitude: 1 })]]);
    const changes = diffQuakes(known, [quake({ id: 'a', magnitude: 9 }), quake({ id: 'b' })]);
    expect(changes).toHaveLength(2);
    expect(changes.map((c) => c.kind).sort()).toEqual(['new', 'updated']);
  });
});
