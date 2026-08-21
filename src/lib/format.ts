export type MagnitudeBucket = 'micro' | 'minor' | 'light' | 'moderate' | 'strong' | 'major';

export function magnitudeBucket(magnitude: number | null): MagnitudeBucket {
  if (magnitude === null || magnitude < 2) return 'micro';
  if (magnitude < 4) return 'minor';
  if (magnitude < 5) return 'light';
  if (magnitude < 6) return 'moderate';
  if (magnitude < 7) return 'strong';
  return 'major';
}

export function formatMagnitude(magnitude: number | null): string {
  if (magnitude === null) return '--';
  return magnitude.toFixed(1);
}

export function formatDepth(depthKm: number | null): string {
  if (depthKm === null) return 'Depth unknown';
  return `${Math.round(depthKm)} km deep`;
}

export function formatCoordinates(latitude: number, longitude: number): string {
  const lat = `${Math.abs(latitude).toFixed(2)}°${latitude >= 0 ? 'N' : 'S'}`;
  const lon = `${Math.abs(longitude).toFixed(2)}°${longitude >= 0 ? 'E' : 'W'}`;
  return `${lat} ${lon}`;
}

export function formatTimeAgo(time: number, now: number): string {
  const seconds = Math.max(0, Math.floor((now - time) / 1000));
  if (seconds < 60) return `${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function formatFelt(felt: number | null): string | null {
  if (felt === null || felt <= 0) return null;
  if (felt === 1) return '1 person reported feeling this';
  return `${felt} people reported feeling this`;
}
