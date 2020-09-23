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
  });
});
