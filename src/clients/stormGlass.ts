import { AxiosStatic } from 'axios';

export interface StormGlassForecastSource {
  readonly noaa: number;
}

export interface StormGlassForecastPoint {
  readonly time: string;
  readonly swellDirection: StormGlassForecastSource;
  readonly swellHeight: StormGlassForecastSource;
  readonly swellPeriod: StormGlassForecastSource;
  readonly waveDirection: StormGlassForecastSource;
  readonly waveHeight: StormGlassForecastSource;
  readonly windDirection: StormGlassForecastSource;
  readonly windSpeed: StormGlassForecastSource;
}

export interface StormGlassForecastResponse {
  readonly hours: StormGlassForecastPoint[];
}

export interface ForecastPoint {
  time: string;
  waveHeight: number;
  waveDirection: number;
  swellDirection: number;
  swellHeight: number;
  swellPeriod: number;
  windDirection: number;
  windSpeed: number;
}

export class StormGlass {
  readonly stormGlassAPIParams =
    'swellDirection,swellHeight,swellPeriod,waveDirection,waveHeight,windDirection,windSpeed';
  readonly stormGlassAPISource = 'noaa';

  constructor(protected request: AxiosStatic) {}

  public async fetchPoints(lat: number, lng: number): Promise<ForecastPoint[]> {
    const response = await this.request.get<StormGlassForecastResponse>(
      `https://api.stormglass.io/v2/weather/point?lat=${lat}&lng=${lng}&params=${this.stormGlassAPIParams}&source=${this.stormGlassAPISource}`
    );
    return this.normalizeResponse(response.data);
  }

  private normalizeResponse(
    forecastResponse: StormGlassForecastResponse
  ): ForecastPoint[] {
    return forecastResponse.hours
      .filter(this.isValidPoint.bind(this))
      .map<ForecastPoint>((point) => ({
        time: point.time,
        waveHeight: point.waveHeight[this.stormGlassAPISource],
        waveDirection: point.waveDirection[this.stormGlassAPISource],
        swellDirection: point.swellDirection[this.stormGlassAPISource],
        swellHeight: point.swellHeight[this.stormGlassAPISource],
        swellPeriod: point.swellPeriod[this.stormGlassAPISource],
        windDirection: point.windDirection[this.stormGlassAPISource],
        windSpeed: point.windSpeed[this.stormGlassAPISource],
      }));
  }

  private isValidPoint(point: Partial<StormGlassForecastPoint>): boolean {
    return !!(
      point.time &&
      point.waveHeight?.[this.stormGlassAPISource] &&
      point.waveDirection?.[this.stormGlassAPISource] &&
      point.swellDirection?.[this.stormGlassAPISource] &&
      point.swellHeight?.[this.stormGlassAPISource] &&
      point.swellPeriod?.[this.stormGlassAPISource] &&
      point.windDirection?.[this.stormGlassAPISource] &&
      point.windSpeed?.[this.stormGlassAPISource]
    );
  }
}
