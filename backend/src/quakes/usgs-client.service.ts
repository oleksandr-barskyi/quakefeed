import { BadGatewayException, Injectable } from '@nestjs/common';
import { QuakeRange } from './types/quake.types';

const BASE_URL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary';

export function usgsFeedUrl(range: QuakeRange): string {
  return `${BASE_URL}/all_${range}.geojson`;
}

@Injectable()
export class UsgsClientService {
  async fetchRange(range: QuakeRange): Promise<unknown> {
    const response = await fetch(usgsFeedUrl(range));
    if (!response.ok) {
      throw new BadGatewayException(`USGS responded with ${response.status}`);
    }
    return response.json();
  }
}
