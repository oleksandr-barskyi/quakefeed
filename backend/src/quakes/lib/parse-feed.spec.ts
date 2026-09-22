import { parseFeed } from './parse-feed';
import { QuakeRange } from '../types/quake.types';

function feature(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: 'us7000abcd',
    properties: {
      mag: 4.5,
      magType: 'mb',
      place: '10km NE of Somewhere',
      time: 1700000000000,
      tsunami: 0,
      sig: 340,
      felt: 12,
      status: 'reviewed',
      url: 'https://earthquake.usgs.gov/event/us7000abcd',
    },
    geometry: { coordinates: [12.3, 45.6, 10] },
    ...overrides,
  };
}

describe('parseFeed', () => {
  it('parses a well-formed feature', () => {
    const feed = parseFeed(QuakeRange.Day, {
      metadata: { generated: 1700000001000, title: 'USGS Significant Earthquakes' },
      features: [feature()],
    });

    expect(feed.range).toBe(QuakeRange.Day);
    expect(feed.title).toBe('USGS Significant Earthquakes');
    expect(feed.quakes).toHaveLength(1);
    expect(feed.quakes[0]).toMatchObject({
      id: 'us7000abcd',
      magnitude: 4.5,
      place: '10km NE of Somewhere',
      latitude: 45.6,
      longitude: 12.3,
      depthKm: 10,
      tsunami: false,
    });
  });

  it('keeps an event with a null magnitude and null place', () => {
    const feed = parseFeed(QuakeRange.Day, {
      features: [
        feature({
          properties: {
            mag: null,
            magType: null,
            place: null,
            time: 1700000000000,
            tsunami: 0,
            sig: null,
            felt: null,
            status: null,
            url: null,
          },
        }),
      ],
    });

    expect(feed.quakes).toHaveLength(1);
    expect(feed.quakes[0].magnitude).toBeNull();
    expect(feed.quakes[0].place).toBe('Location unavailable');
    expect(feed.quakes[0].status).toBe('unknown');
  });

  it('drops a feature with no id', () => {
    const feed = parseFeed(QuakeRange.Day, { features: [feature({ id: null })] });
    expect(feed.quakes).toHaveLength(0);
  });

  it('drops a feature with no time', () => {
    const feed = parseFeed(QuakeRange.Day, {
      features: [feature({ properties: { mag: 1 } })],
    });
    expect(feed.quakes).toHaveLength(0);
  });

  it('drops a feature with empty geometry', () => {
    const feed = parseFeed(QuakeRange.Day, {
      features: [feature({ geometry: {} })],
    });
    expect(feed.quakes).toHaveLength(0);
  });

  it('drops a feature that is not an object', () => {
    const feed = parseFeed(QuakeRange.Day, { features: [null, 'nope', 42] });
    expect(feed.quakes).toHaveLength(0);
  });

  it('treats a missing features array as empty', () => {
    const feed = parseFeed(QuakeRange.Day, {});
    expect(feed.quakes).toHaveLength(0);
  });

  it('falls back to Date.now for a missing generated timestamp', () => {
    const before = Date.now();
    const feed = parseFeed(QuakeRange.Day, { features: [] });
    expect(feed.generatedAt).toBeGreaterThanOrEqual(before);
  });

  it('throws for a payload that is not an object', () => {
    expect(() => parseFeed(QuakeRange.Day, null)).toThrow();
    expect(() => parseFeed(QuakeRange.Day, 'not json')).toThrow();
  });
});
