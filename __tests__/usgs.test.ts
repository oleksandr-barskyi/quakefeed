import { feedKey, feedUrl, parseFeed } from '../src/api/usgs';
import { FeedSelection } from '../src/api/types';

const selection: FeedSelection = { magnitude: '2.5', window: 'week' };

function feature(overrides: Record<string, unknown> = {}) {
  return {
    type: 'Feature',
    id: 'ci40000001',
    properties: {
      mag: 3.4,
      place: '12km NE of Ridgecrest, CA',
      time: 1_700_000_000_000,
      tsunami: 0,
      sig: 178,
      felt: 12,
      status: 'reviewed',
      magType: 'ml',
      url: 'https://earthquake.usgs.gov/earthquakes/eventpage/ci40000001',
      ...overrides,
    },
    geometry: { type: 'Point', coordinates: [-117.6, 35.7, 8.2] },
  };
}

describe('feed url building', () => {
  it('builds the USGS summary url from a selection', () => {
    expect(feedUrl(selection)).toBe(
      'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson',
    );
  });

  it('builds a stable cache key', () => {
    expect(feedKey(selection)).toBe('2.5_week');
    expect(feedKey({ magnitude: 'all', window: 'hour' })).toBe('all_hour');
  });
});

describe('parseFeed', () => {
  it('maps a well formed feature into a quake', () => {
    const feed = parseFeed(selection, {
      metadata: { generated: 1_700_000_100_000, title: 'USGS Magnitude 2.5+ Earthquakes, Past Week' },
      features: [feature()],
    });

    expect(feed.quakes).toHaveLength(1);
    expect(feed.quakes[0]).toEqual({
      id: 'ci40000001',
      magnitude: 3.4,
      magnitudeType: 'ml',
      place: '12km NE of Ridgecrest, CA',
      time: 1_700_000_000_000,
      depthKm: 8.2,
      latitude: 35.7,
      longitude: -117.6,
      tsunami: false,
      significance: 178,
      felt: 12,
      status: 'reviewed',
      url: 'https://earthquake.usgs.gov/earthquakes/eventpage/ci40000001',
    });
    expect(feed.generatedAt).toBe(1_700_000_100_000);
    expect(feed.title).toContain('Past Week');
  });

  it('keeps events whose magnitude is missing', () => {
    const feed = parseFeed(selection, { features: [feature({ mag: null })] });
    expect(feed.quakes).toHaveLength(1);
    expect(feed.quakes[0].magnitude).toBeNull();
  });

  it('substitutes a placeholder when place is missing', () => {
    const feed = parseFeed(selection, { features: [feature({ place: null })] });
    expect(feed.quakes[0].place).toBe('Location unavailable');
  });

  it('flags tsunami events', () => {
    const feed = parseFeed(selection, { features: [feature({ tsunami: 1 })] });
    expect(feed.quakes[0].tsunami).toBe(true);
  });

  it('drops features without an id, a time or coordinates', () => {
    const feed = parseFeed(selection, {
      features: [
        { ...feature(), id: undefined },
        { ...feature(), properties: { ...feature().properties, time: null } },
        { ...feature(), geometry: { type: 'Point', coordinates: [] } },
        feature(),
      ],
    });
    expect(feed.quakes).toHaveLength(1);
  });

  it('returns an empty feed when features are absent', () => {
    const feed = parseFeed(selection, { metadata: {} });
    expect(feed.quakes).toEqual([]);
  });

  it('throws when the payload is not an object', () => {
    expect(() => parseFeed(selection, 'not json')).toThrow('Feed payload is not an object');
  });
});
