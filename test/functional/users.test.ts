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
        message:
          'User validation failed: password: Path `password` is required.',
        error: 'Unprocessable Entity',
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
        message:
          'User validation failed: email: already exists on the database',
        error: 'Conflict',
      });
    });
  });

  describe('When authenticate a user', () => {
    it('should authenticate an user with success', async () => {
      const newUser: User = {
        name: 'Authentication Test',
        email: 'auth@mail.com',
        password: 'pass123',
      };

      const user = await User.create(newUser);

      const { body, status } = await global.testRequest
        .post('/users/authenticate')
        .send({ email: user.email, password: newUser.password });

      expect(status).toBe(200);
      expect(body).toEqual({ token: expect.any(String) });
    });

    it('should return 401 (unauthorized) when user not found', async () => {
      const user: User = {
        name: 'Not found user',
        email: 'doesntexist@mail.com',
        password: 'pass123',
      };

      const { body, status } = await global.testRequest
        .post('/users/authenticate')
        .send({ email: user.email, password: user.password });

      expect(status).toBe(401);
      expect(body).toEqual({
        code: 401,
        message: 'User not found',
        error: 'Unauthorized',
      });
    });

    it('should return 401 (unauthorized) when password is incorrect', async () => {
      const user = await User.create({
        name: 'Password Test',
        email: 'wrongpass@mail.com',
        password: 'pass123',
      });

      const { body, status } = await global.testRequest
        .post('/users/authenticate')
        .send({ email: user.email, password: 'wrong_pass' });

      expect(status).toBe(401);
      expect(body).toEqual({
        code: 401,
        message: 'Wrong password',
        error: 'Unauthorized',
      });
    });
  });

  describe('When getting user profile data', () => {
    beforeEach(async () => await User.deleteMany({}));
    it('should get user data (/me) with success', async () => {
      const newUser: User = {
        name: 'Profile Test',
        email: 'profile@mail.com',
        password: 'pass123',
      };

      const user = await User.create(newUser);

      const token = await AuthService.generateToken({
        ...newUser,
        id: user.id,
      });

      const { body, status } = await global.testRequest.get('/users/me').set({
        'x-access-token': token,
      });

      expect(status).toBe(200);
      expect(body).toMatchObject({ name: newUser.name, email: newUser.email });
    });

    it('should return: Not found when user was not found', async () => {
      const newUser: User = {
        name: 'Profile Test',
        email: 'profile@mail.com',
        password: 'pass123',
      };

      const user = await User.create(newUser);

      const authResponse = await global.testRequest
        .post('/users/authenticate')
        .send({ email: newUser.email, password: newUser.password });

      const token = authResponse.body.token;

      await User.deleteOne({ _id: user.id });

      const { body, status } = await global.testRequest.get('/users/me').set({
        'x-access-token': token,
      });

      expect(status).toBe(404);
      expect(body).toEqual(
        expect.objectContaining({ code: 404, message: 'Not found' })
      );
    });
  });
});
