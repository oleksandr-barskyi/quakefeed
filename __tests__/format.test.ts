import {
  formatCoordinates,
  formatDepth,
  formatFelt,
  formatMagnitude,
  formatTimeAgo,
  magnitudeBucket,
} from '../src/lib/format';

describe('magnitudeBucket', () => {
  it.each([
    [null, 'micro'],
    [0.4, 'micro'],
    [1.9, 'micro'],
    [2, 'minor'],
    [3.9, 'minor'],
    [4, 'light'],
    [5, 'moderate'],
    [6, 'strong'],
    [7.8, 'major'],
  ])('maps %p to %s', (magnitude, expected) => {
    expect(magnitudeBucket(magnitude as number | null)).toBe(expected);
  });
});

describe('formatMagnitude', () => {
  it('shows one decimal', () => {
    expect(formatMagnitude(4)).toBe('4.0');
    expect(formatMagnitude(4.25)).toBe('4.3');
  });

  it('marks an unknown magnitude', () => {
    expect(formatMagnitude(null)).toBe('--');
  });
});

describe('formatDepth', () => {
  it('rounds to whole kilometres', () => {
    expect(formatDepth(8.6)).toBe('9 km deep');
  });

  it('handles a missing depth', () => {
    expect(formatDepth(null)).toBe('Depth unknown');
  });
});

describe('formatCoordinates', () => {
  it('uses hemispheres instead of signs', () => {
    expect(formatCoordinates(35.7, -117.6)).toBe('35.70°N 117.60°W');
    expect(formatCoordinates(-12.34, 56.78)).toBe('12.34°S 56.78°E');
  });
});

describe('formatTimeAgo', () => {
  const now = 1_700_000_000_000;

  it.each([
    [now - 5_000, '5s ago'],
    [now - 90_000, '1m ago'],
    [now - 3_600_000, '1h ago'],
    [now - 90_000_000, '1d ago'],
  ])('formats %p', (time, expected) => {
    expect(formatTimeAgo(time, now)).toBe(expected);
  });

  it('never reports a negative age for clock skew', () => {
    expect(formatTimeAgo(now + 60_000, now)).toBe('0s ago');
  });
});

describe('formatFelt', () => {
  it('hides zero and missing reports', () => {
    expect(formatFelt(null)).toBeNull();
    expect(formatFelt(0)).toBeNull();
  });

  it('uses singular for one report', () => {
    expect(formatFelt(1)).toBe('1 person reported feeling this');
  });

  it('uses plural above one', () => {
    expect(formatFelt(42)).toBe('42 people reported feeling this');
  });
});
