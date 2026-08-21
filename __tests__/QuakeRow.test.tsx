import { fireEvent, render } from '@testing-library/react-native';

import { Quake } from '../src/api/types';
import { QuakeRow } from '../src/ui/QuakeRow';

const NOW = 1_700_000_000_000;

function quake(overrides: Partial<Quake> = {}): Quake {
  return {
    id: 'ci1',
    magnitude: 4.2,
    magnitudeType: 'ml',
    place: '12km NE of Ridgecrest, CA',
    time: NOW - 3_600_000,
    depthKm: 8.4,
    latitude: 35.7,
    longitude: -117.6,
    tsunami: false,
    significance: 178,
    felt: null,
    status: 'reviewed',
    url: 'https://example.test',
    ...overrides,
  };
}

function renderRow(overrides: Partial<Quake> = {}, onPress = jest.fn()) {
  return render(<QuakeRow quake={quake(overrides)} now={NOW} onPress={onPress} />);
}

describe('QuakeRow', () => {
  it('shows place, age and depth', async () => {
    const { getByText } = await renderRow();

    expect(getByText('12km NE of Ridgecrest, CA')).toBeTruthy();
    expect(getByText(/1h ago/)).toBeTruthy();
    expect(getByText(/8 km deep/)).toBeTruthy();
  });

  it('renders the magnitude with one decimal', async () => {
    const { getByText } = await renderRow();
    expect(getByText('4.2')).toBeTruthy();
  });

  it('marks an unknown magnitude instead of rendering NaN', async () => {
    const { getByText } = await renderRow({ magnitude: null });
    expect(getByText('--')).toBeTruthy();
  });

  it('announces a tsunami alert in the row', async () => {
    const { getByText } = await renderRow({ tsunami: true });
    expect(getByText(/tsunami alert/)).toBeTruthy();
  });

  it('does not mention tsunami for ordinary events', async () => {
    const { queryByText } = await renderRow();
    expect(queryByText(/tsunami alert/)).toBeNull();
  });

  it('passes the id up on press', async () => {
    const onPress = jest.fn();
    const { getByLabelText } = await renderRow({}, onPress);

    fireEvent.press(getByLabelText('12km NE of Ridgecrest, CA'));

    expect(onPress).toHaveBeenCalledWith('ci1');
  });
});
