import { StormGlass } from '@src/clients/stormGlass';
import stormGlassWeather3hours from '@test/fixtures/stormglass_weather_3_hours.json';
import stormGlassWeather3hoursNormalized from '@test/fixtures/stormglass_weather_3_hours_normalized.json';
import * as HTTPUtils from '@src/utils/request';

jest.mock('@src/utils/request');

describe('StormGlass Client', () => {
  const MockedRequestClass = HTTPUtils.Request as jest.Mocked<
    typeof HTTPUtils.Request
  >;

  const mockedRequest = new HTTPUtils.Request() as jest.Mocked<
    HTTPUtils.Request
  >;

  it('should return the normalized forecast from the StormGlass service', async () => {
    const lat = -33.792726;
    const lng = 151.289824;

    mockedRequest.get.mockResolvedValue({
      data: stormGlassWeather3hours,
    } as HTTPUtils.Response);

    const stormGlass = new StormGlass(mockedRequest);
    const response = await stormGlass.fetchPoints(lat, lng);
    expect(response).toEqual(stormGlassWeather3hoursNormalized);
  });

  it('should ignore points with incompleted data coming from StormGlass service', async () => {
    const lat = -33.792726;
    const lng = 151.289824;

    mockedRequest.get.mockResolvedValue({
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
    } as HTTPUtils.Response);

    const stormGlass = new StormGlass(mockedRequest);
    const response = await stormGlass.fetchPoints(lat, lng);
    expect(response.length).toBe(stormGlassWeather3hours.hours.length);
  });

  it('should throw an specific error message for network error', async () => {
    const lat = -33.792726;
    const lng = 151.289824;

    mockedRequest.get.mockRejectedValue({ message: 'Network Error' });
    const stormGlass = new StormGlass(mockedRequest);
    await expect(stormGlass.fetchPoints(lat, lng)).rejects.toThrow(
      'Unexpected error when trying to communicate to StormGlass: Network Error'
    );
  });

  it('should get an StormGlassResponseError when the StormGlass service responds with error', async () => {
    const lat = -33.792726;
    const lng = 151.289824;

    MockedRequestClass.isRequestResponse.mockReturnValue(true);
    mockedRequest.get.mockRejectedValue({
      response: {
        status: 429,
        data: { errors: ['Rate Limit reached'] },
      },
    });

    const stormGlass = new StormGlass(mockedRequest);
    await expect(stormGlass.fetchPoints(lat, lng)).rejects.toThrow(
      'Unexpected error returned by the StormGlass service: Error: {"errors":["Rate Limit reached"]} Code: 429'
    );
  });
});
