import { QuakeRecord } from '../types/quake.types';

export interface QuakeChange {
  kind: 'new' | 'updated';
  quake: QuakeRecord;
}

function materiallyChanged(previous: QuakeRecord, next: QuakeRecord): boolean {
  return (
    previous.magnitude !== next.magnitude ||
    previous.place !== next.place ||
    previous.status !== next.status ||
    previous.tsunami !== next.tsunami ||
    previous.significance !== next.significance
  );
}

export function diffQuakes(known: Map<string, QuakeRecord>, current: QuakeRecord[]): QuakeChange[] {
  const changes: QuakeChange[] = [];
  for (const quake of current) {
    const previous = known.get(quake.id);
    if (!previous) {
      changes.push({ kind: 'new', quake });
    } else if (materiallyChanged(previous, quake)) {
      changes.push({ kind: 'updated', quake });
    }
  }
  return changes;
}
