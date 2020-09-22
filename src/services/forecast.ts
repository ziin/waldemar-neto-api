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

export interface BeachForecast extends ForecastPoint, Omit<Beach, 'user'> {
  rating: number;
}

export interface TimeForecast {
  time: string;
  forecast: BeachForecast[];
}

export class Forecast {
  constructor(protected stormGlass = new StormGlass()) {}

  public async processForecastForBeaches(
    beaches: Beach[]
  ): Promise<TimeForecast[]> {
    const forecastResponses: BeachForecast[] = [];
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
    return this.mapToTimeForecast(forecastResponses);
  }

  private mapToTimeForecast(beachForecast: BeachForecast[]): TimeForecast[] {
    const timeForecasts: TimeForecast[] = [];
    for (const point of beachForecast) {
      const timePoint = timeForecasts.find((f) => f.time === point.time);
      if (timePoint) {
        timePoint.forecast.push(point);
      } else {
        timeForecasts.push({ time: point.time, forecast: [point] });
      }
    }
    return timeForecasts;
  }
}
