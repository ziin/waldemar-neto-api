import { ForecastPoint, StormGlass } from '../clients/stormGlass';

export enum BeachPosition {
  N = 'N',
  E = 'E',
  S = 'S',
  W = 'W',
}

export interface Beach {
  lat: number;
  lng: number;
  name: string;
  position: BeachPosition;
  user: 'some-id';
}

export interface ForecastResponse extends ForecastPoint, Omit<Beach, 'user'> {
  rating: number;
}

export class Forecast {
  constructor(protected stormGlass = new StormGlass()) {}

  public async processForecastForBeaches(
    beaches: Beach[]
  ): Promise<ForecastResponse[]> {
    const forecastResponses: ForecastResponse[] = [];
    for (const beach of beaches) {
      /* eslint-disable @typescript-eslint/no-unused-vars */
      const { user, ...beachWithoutUser } = beach;
      const points = await this.stormGlass.fetchPoints(beach.lat, beach.lng);
      forecastResponses.push(
        ...points.map((point) => ({
          ...beachWithoutUser,
          rating: 1,
          ...point,
        }))
      );
    }
    return forecastResponses;
  }
}
