export enum QuakeRange {
  Day = 'day',
  Week = 'week',
  Month = 'month',
}

export enum QuakeSort {
  Time = 'time',
  Magnitude = 'magnitude',
}

export interface QuakeRecord {
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

export interface QuakeFeed {
  range: QuakeRange;
  generatedAt: number;
  title: string;
  quakes: QuakeRecord[];
}
