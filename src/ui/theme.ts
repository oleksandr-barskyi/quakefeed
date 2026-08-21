import { MagnitudeBucket } from '../lib/format';

export const colors = {
  background: '#0b0f14',
  surface: '#141b23',
  surfaceRaised: '#1c2530',
  border: '#26313d',
  text: '#e8eef5',
  textMuted: '#8ea1b5',
  accent: '#4da3ff',
  warning: '#ffb020',
  danger: '#ff5c5c',
};

export const bucketColors: Record<MagnitudeBucket, string> = {
  micro: '#3f5666',
  minor: '#3f7d8c',
  light: '#4da3ff',
  moderate: '#ffb020',
  strong: '#ff7a3d',
  major: '#ff3d5c',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
};

export const ROW_HEIGHT = 76;
