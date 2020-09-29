import { ForecastPoint, StormGlass } from '../clients/stormGlass';
import logger from '../logger';
import { Beach } from '../models/beach';
import { InternalError } from '../utils/errors/internal-error';

export interface BeachForecast extends ForecastPoint, Omit<Beach, 'user'> {
  rating: number;
}

export interface TimeForecast {
  time: string;
  forecast: BeachForecast[];
}

export class ForecastProcessingError extends InternalError {
  constructor(message: string) {
    super(`Unexpected error during Forecast processing: ${message}`);
  }
}

export class Forecast {
  constructor(protected stormGlass = new StormGlass()) {}

  public async processForecastForBeaches(
    beaches: Beach[]
  ): Promise<TimeForecast[]> {
    try {
      logger.info(`Preparing to fetch ${beaches.length} beaches...`);
      const beachForecasts: BeachForecast[] = [];
      for (const beach of beaches) {
        const points = await this.stormGlass.fetchPoints(beach.lat, beach.lng);
        beachForecasts.push(...this.createBeachForecasts(beach, points));
      }
      return this.mapToTimeForecast(beachForecasts);
    } catch (error) {
      logger.error(error);
      throw new ForecastProcessingError(error.message);
    }
  }

  private createBeachForecasts(
    beach: Beach,
    points: ForecastPoint[]
  ): BeachForecast[] {
    const { lat, lng, position, name } = beach;
    return [
      ...points.map((point) => ({
        name,
        position,
        lat,
        lng,
        rating: 1,
        ...point,
      })),
    ];
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
