import { BeachPosition } from '@src/services/forecast';
import { Beach } from '@src/models/beach';

describe('Beaches functional tests', () => {
  afterAll(async () => await Beach.deleteMany({}));

  describe('When creating a beach', () => {
    it('should create a beach with success', async () => {
      const newBeach = {
        lat: -33.792726,
        lng: 151.289824,
        name: 'Manly',
        position: BeachPosition.E,
      };

      const { body, status } = await global.testRequest
        .post('/beaches')
        .send(newBeach);

      expect(status).toBe(201);
      expect(body).toEqual(expect.objectContaining(newBeach));
    });

    it('should return error 422 when there is a validation error', async () => {
      const newBeach = {
        lat: 'invalid_latitude',
        lng: 151.289824,
        name: 'Manly',
        position: BeachPosition.E,
      };

      const { body, status } = await global.testRequest
        .post('/beaches')
        .send(newBeach);

      expect(status).toBe(422);
      expect(body).toEqual({
        error:
          'Beach validation failed: lat: Cast to Number failed for value "invalid_latitude" at path "lat"',
      });
    });

    it.skip('should return error 500 when there is an error other than validation', async () => {
      // TODO
    });
  });
});
