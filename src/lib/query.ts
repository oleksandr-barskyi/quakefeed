import { Quake } from '../api/types';

export type SortMode = 'time' | 'magnitude';

export interface Query {
  search: string;
  minMagnitude: number;
  sort: SortMode;
}

export const defaultQuery: Query = {
  search: '',
  minMagnitude: 0,
  sort: 'time',
};

const UNKNOWN_MAGNITUDE = -99;

function magnitudeValue(quake: Quake): number {
  return quake.magnitude ?? UNKNOWN_MAGNITUDE;
}

function matches(quake: Quake, needle: string, minMagnitude: number): boolean {
  if (minMagnitude > 0) {
    if (quake.magnitude === null) return false;
    if (quake.magnitude < minMagnitude) return false;
  }
  if (needle.length === 0) return true;
  return quake.place.toLowerCase().includes(needle);
}

export function sortQuakes(quakes: Quake[], sort: SortMode): Quake[] {
  const sorted = quakes.slice();
  if (sort === 'magnitude') {
    sorted.sort((a, b) => magnitudeValue(b) - magnitudeValue(a) || b.time - a.time);
    return sorted;
  }
  sorted.sort((a, b) => b.time - a.time);
  return sorted;
}

export function applyQuery(quakes: Quake[], query: Query): Quake[] {
  const needle = query.search.trim().toLowerCase();
  const filtered = quakes.filter((quake) => matches(quake, needle, query.minMagnitude));
  return sortQuakes(filtered, query.sort);
}

export function countByBucketThreshold(quakes: Quake[], threshold: number): number {
  let total = 0;
  for (const quake of quakes) {
    if (quake.magnitude !== null && quake.magnitude >= threshold) total += 1;
  }
  return total;
}
