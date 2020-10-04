import { Beach, GeoPosition } from '@src/models/beach';
import forecastWeather3hours1beach from '@test/fixtures/forecast_weather_3_hours_1_beach.json';
import stormglassWeather3hours from '@test/fixtures/stormglass_weather_3_hours.json';
import nock from 'nock';
import { User } from '@src/models/user';
import AuthService from '@src/services/auth';

describe('Beach forecast functional tests', () => {
  let token: string;
  beforeEach(async () => {
    await Beach.deleteMany({});
    await User.deleteMany({});

    const user = await User.create({
      name: 'Test user',
      email: 'test@mail.com',
      password: '1234',
    });

    token = AuthService.generateToken(user.toJSON());

    await Beach.create({
      lat: -33.792726,
      lng: 151.289824,
      name: 'Manly',
      position: GeoPosition.E,
      user: user.id,
    });
  });

  it('should return a forecast with just a few times', async () => {
    nock('https://api.stormglass.io:443', {
      encodedQueryParams: true,
      reqheaders: {
        Authorization: () => true,
      },
    })
      .defaultReplyHeaders({
        'access-control-allow-origin': '*',
      })
      .get('/v2/weather/point')
      .query({
        lat: '-33.792726',
        lng: '151.289824',
        params:
          'swellDirection%2CswellHeight%2CswellPeriod%2CwaveDirection%2CwaveHeight%2CwindDirection%2CwindSpeed',
        source: 'noaa',
      })
      .reply(200, stormglassWeather3hours);

    const { body, status } = await global.testRequest.get('/forecast').set({
      'x-access-token': token,
    });

    expect(status).toBe(200);
    expect(body).toEqual(forecastWeather3hours1beach);
  });
});
