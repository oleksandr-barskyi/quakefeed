import { QuakeRecord, QuakeSort } from '../types/quake.types';

export interface ApplyQueryOptions {
  minMagnitude?: number;
  sort: QuakeSort;
}

function passesMagnitude(quake: QuakeRecord, minMagnitude?: number): boolean {
  if (minMagnitude === undefined) return true;
  return quake.magnitude !== null && quake.magnitude >= minMagnitude;
}

function compareByTime(a: QuakeRecord, b: QuakeRecord): number {
  return b.time - a.time;
}

function compareByMagnitude(a: QuakeRecord, b: QuakeRecord): number {
  if (a.magnitude === null && b.magnitude === null) return compareByTime(a, b);
  if (a.magnitude === null) return 1;
  if (b.magnitude === null) return -1;
  return b.magnitude - a.magnitude;
}

export function applyQuery(quakes: QuakeRecord[], options: ApplyQueryOptions): QuakeRecord[] {
  const filtered = quakes.filter((quake) => passesMagnitude(quake, options.minMagnitude));
  const comparator = options.sort === QuakeSort.Magnitude ? compareByMagnitude : compareByTime;
  return [...filtered].sort(comparator);
}
