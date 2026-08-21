import { Feed, FeedSelection, Quake } from './types';

const BASE_URL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary';

export function feedUrl(selection: FeedSelection): string {
  return `${BASE_URL}/${selection.magnitude}_${selection.window}.geojson`;
}

export function feedKey(selection: FeedSelection): string {
  return `${selection.magnitude}_${selection.window}`;
}

function readNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function readString(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.length > 0 ? value : fallback;
}

function parseQuake(raw: unknown): Quake | null {
  if (typeof raw !== 'object' || raw === null) return null;

  const feature = raw as Record<string, unknown>;
  const id = typeof feature.id === 'string' ? feature.id : null;
  if (id === null) return null;

  const properties = (feature.properties ?? {}) as Record<string, unknown>;
  const geometry = (feature.geometry ?? {}) as Record<string, unknown>;
  const coordinates = Array.isArray(geometry.coordinates) ? geometry.coordinates : [];

  const time = readNumber(properties.time);
  if (time === null) return null;

  const longitude = readNumber(coordinates[0]);
  const latitude = readNumber(coordinates[1]);
  if (longitude === null || latitude === null) return null;

  return {
    id,
    magnitude: readNumber(properties.mag),
    magnitudeType: typeof properties.magType === 'string' ? properties.magType : null,
    place: readString(properties.place, 'Location unavailable'),
    time,
    depthKm: readNumber(coordinates[2]),
    latitude,
    longitude,
    tsunami: readNumber(properties.tsunami) === 1,
    significance: readNumber(properties.sig) ?? 0,
    felt: readNumber(properties.felt),
    status: readString(properties.status, 'unknown'),
    url: readString(properties.url, 'https://earthquake.usgs.gov'),
  };
}

export function parseFeed(selection: FeedSelection, payload: unknown): Feed {
  if (typeof payload !== 'object' || payload === null) {
    throw new Error('Feed payload is not an object');
  }

  const body = payload as Record<string, unknown>;
  const features = Array.isArray(body.features) ? body.features : [];
  const metadata = (body.metadata ?? {}) as Record<string, unknown>;

  const quakes: Quake[] = [];
  for (const feature of features) {
    const quake = parseQuake(feature);
    if (quake !== null) quakes.push(quake);
  }

  return {
    selection,
    generatedAt: readNumber(metadata.generated) ?? Date.now(),
    title: readString(metadata.title, 'USGS earthquake feed'),
    quakes,
  };
}

export async function fetchFeed(selection: FeedSelection, signal?: AbortSignal): Promise<Feed> {
  const response = await fetch(feedUrl(selection), { signal });
  if (!response.ok) {
    throw new Error(`USGS responded with ${response.status}`);
  }
  return parseFeed(selection, await response.json());
}
