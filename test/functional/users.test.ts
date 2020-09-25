import { User } from '@src/models/user';
import AuthService from '@src/services/auth';

describe('Users functional tests', () => {
  beforeAll(async () => await User.deleteMany({}));
  describe('When creating a user', () => {
    it('should succeed in creating an user', async () => {
      const newUser = {
        name: 'Alisson Schwanz',
        email: 'alisson@gmail.com',
        password: 'senha123',
      };

      const { body, status } = await global.testRequest
        .post('/users')
        .send(newUser);

      expect(status).toBe(201);
      expect(
        await AuthService.checkPassword(newUser.password, body.password)
      ).toBeTruthy();
      expect(body).toEqual(
        expect.objectContaining({ ...newUser, password: expect.any(String) })
      );
    });

    it('should return 422 when there is validation error', async () => {
      const newUser = {
        name: 'Another User',
        email: 'anotheruser@mail.com',
      };

      const { body, status } = await global.testRequest
        .post('/users')
        .send(newUser);

      expect(status).toBe(422);
      expect(body).toEqual({
        code: 422,
        error: 'User validation failed: password: Path `password` is required.',
      });
    });

    it('should return 409 when user already exists', async () => {
      const newUser = {
        name: 'Alisson Schwanz',
        email: 'alisson@gmail.com',
        password: 'senha123',
      };

      const { body, status } = await global.testRequest
        .post('/users')
        .send(newUser);

      expect(status).toBe(409);
      expect(body).toEqual({
        code: 409,
        error: 'User validation failed: email: already exists on the database',
      });
    });
  });
});
