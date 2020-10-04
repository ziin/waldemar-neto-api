import { Beach, GeoPosition } from '@src/models/beach';
import { User } from '@src/models/user';
import AuthService from '@src/services/auth';

describe('Beaches functional tests', () => {
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
  });

  describe('When creating a beach', () => {
    it('should create a beach with success', async () => {
      const newBeach = {
        lat: -33.792726,
        lng: 151.289824,
        name: 'Manly',
        position: GeoPosition.E,
      };

      const { body, status } = await global.testRequest
        .post('/beaches')
        .set({
          'x-access-token': token,
        })
        .send(newBeach);

      expect(status).toBe(201);
      expect(body).toEqual(expect.objectContaining(newBeach));
    });

    it('should return error 422 when there is a validation error', async () => {
      const newBeach = {
        lat: 'invalid_latitude',
        lng: 151.289824,
        name: 'Manly',
        position: GeoPosition.E,
      };

      const { body, status } = await global.testRequest
        .post('/beaches')
        .set({
          'x-access-token': token,
        })
        .send(newBeach);

      expect(status).toBe(422);
      expect(body).toEqual({
        code: 422,
        message:
          'Beach validation failed: lat: Cast to Number failed for value "invalid_latitude" at path "lat"',
        error: 'Unprocessable Entity',
      });
    });

    it.skip('should return error 500 when there is an error other than validation', async () => {
      // TODO
    });
  });
});
