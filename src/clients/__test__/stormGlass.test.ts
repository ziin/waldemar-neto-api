import { StormGlass } from '@src/clients/stormGlass.ts';
import axios from 'axios';
import stormGlassWeather3hours from '@test/fixtures/stormglass_weather_3_hours.json';
import stormGlassWeather3hoursNormalized from '@test/fixtures/stormglass_weather_3_hours_normalized.json';

jest.mock('axios');

describe('StormGlass Client', () => {
  it('should return the normalized forecast from the StormGlass service', async () => {
    const lat = -33.792726;
    const lng = 151.289824;

    const mockedAxios = axios as jest.Mocked<typeof axios>;
    mockedAxios.get.mockResolvedValue({ data: stormGlassWeather3hours });

    const stormGlass = new StormGlass(mockedAxios);
    const response = await stormGlass.fetchPoints(lat, lng);
    expect(response).toEqual(stormGlassWeather3hoursNormalized);
  });
});
