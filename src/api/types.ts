export type FeedWindow = 'hour' | 'day' | 'week' | 'month';

export type FeedMagnitude = 'all' | '1.0' | '2.5' | '4.5' | 'significant';

export interface FeedSelection {
  magnitude: FeedMagnitude;
  window: FeedWindow;
}

export interface Quake {
  id: string;
  magnitude: number | null;
  magnitudeType: string | null;
  place: string;
  time: number;
  depthKm: number | null;
  latitude: number;
  longitude: number;
  tsunami: boolean;
  significance: number;
  felt: number | null;
  status: string;
  url: string;
}

export interface Feed {
  selection: FeedSelection;
  generatedAt: number;
  title: string;
  quakes: Quake[];
}
