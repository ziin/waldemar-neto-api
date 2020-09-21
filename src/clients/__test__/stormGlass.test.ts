import { StormGlass } from '@src/clients/stormGlass';
import axios from 'axios';
import stormGlassWeather3hours from '@test/fixtures/stormglass_weather_3_hours.json';
import stormGlassWeather3hoursNormalized from '@test/fixtures/stormglass_weather_3_hours_normalized.json';
import { EPROTONOSUPPORT } from 'constants';

jest.mock('axios');

describe('StormGlass Client', () => {
  const mockedAxios = axios as jest.Mocked<typeof axios>;

  it('should return the normalized forecast from the StormGlass service', async () => {
    const lat = -33.792726;
    const lng = 151.289824;

    mockedAxios.get.mockResolvedValue({ data: stormGlassWeather3hours });

    const stormGlass = new StormGlass(mockedAxios);
    const response = await stormGlass.fetchPoints(lat, lng);
    expect(response).toEqual(stormGlassWeather3hoursNormalized);
  });

  it('should ignore points with incompleted data coming from StormGlass service', async () => {
    const lat = -33.792726;
    const lng = 151.289824;

    mockedAxios.get.mockResolvedValue({
      data: {
        hours: [
          ...stormGlassWeather3hours.hours,
          // adding an incompleted response
          {
            waveHeight: {
              noaa: 300,
            },
            time: 'time',
          },
        ],
      },
    });

    const stormGlass = new StormGlass(mockedAxios);
    const response = await stormGlass.fetchPoints(lat, lng);
    expect(response.length).toBe(stormGlassWeather3hours.hours.length);
  });

  it('should throw an specific error message for network error', async () => {
    const lat = -33.792726;
    const lng = 151.289824;

    mockedAxios.get.mockRejectedValue({ message: 'Network Error' });
    const stormGlass = new StormGlass(mockedAxios);
    await expect(stormGlass.fetchPoints(lat, lng)).rejects.toThrow(
      'Unexpected error when trying to communicate to StormGlass: Network Error'
    );
  });
});
