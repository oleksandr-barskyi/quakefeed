import { QuakeFeed, QuakeRange, QuakeRecord } from '../types/quake.types';

function asNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function asString(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.length > 0 ? value : fallback;
}

function parseFeature(feature: unknown): QuakeRecord | null {
  if (typeof feature !== 'object' || feature === null) return null;

  const record = feature as Record<string, unknown>;
  const id = typeof record.id === 'string' ? record.id : null;
  if (id === null) return null;

  const properties = (record.properties ?? {}) as Record<string, unknown>;
  const geometry = (record.geometry ?? {}) as Record<string, unknown>;
  const coordinates = Array.isArray(geometry.coordinates) ? geometry.coordinates : [];

  const time = asNumber(properties.time);
  if (time === null) return null;

  const longitude = asNumber(coordinates[0]);
  const latitude = asNumber(coordinates[1]);
  if (longitude === null || latitude === null) return null;

  return {
    id,
    magnitude: asNumber(properties.mag),
    magnitudeType: typeof properties.magType === 'string' ? properties.magType : null,
    place: asString(properties.place, 'Location unavailable'),
    time,
    depthKm: asNumber(coordinates[2]),
    latitude,
    longitude,
    tsunami: asNumber(properties.tsunami) === 1,
    significance: asNumber(properties.sig) ?? 0,
    felt: asNumber(properties.felt),
    status: asString(properties.status, 'unknown'),
    url: asString(properties.url, 'https://earthquake.usgs.gov'),
  };
}

export function parseFeed(range: QuakeRange, payload: unknown): QuakeFeed {
  if (typeof payload !== 'object' || payload === null) {
    throw new Error('USGS feed payload is not an object');
  }

  const body = payload as Record<string, unknown>;
  const features = Array.isArray(body.features) ? body.features : [];
  const metadata = (body.metadata ?? {}) as Record<string, unknown>;

  const quakes: QuakeRecord[] = [];
  for (const feature of features) {
    const quake = parseFeature(feature);
    if (quake !== null) quakes.push(quake);
  }

  return {
    range,
    generatedAt: asNumber(metadata.generated) ?? Date.now(),
    title: asString(metadata.title, 'USGS earthquake feed'),
    quakes,
  };
}
