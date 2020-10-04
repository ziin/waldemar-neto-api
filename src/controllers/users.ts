import { Controller, Get, Middleware, Post } from '@overnightjs/core';
import { Request, Response } from 'express';
import { User } from '@src/models/user';
import { BaseController } from '.';
import AuthService from '@src/services/auth';
import { authMiddleware } from '../middlewares/auth';

@Controller('users')
export class UsersController extends BaseController {
  @Post('')
  public async create(req: Request, res: Response): Promise<void> {
    try {
      const user = await User.create(req.body);
      res.status(201).send(user.toJSON());
    } catch (error) {
      this.handleCreateAndUpdateErrors(res, error);
    }
  }

  @Post('authenticate')
  public async authenticate(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      this.sendErrorResponse(res, {
        code: 401,
        message: 'User not found',
      });
      return;
    }

    if (!(await AuthService.checkPassword(password, user.password))) {
      this.sendErrorResponse(res, {
        code: 401,
        message: 'Wrong password',
      });
      return;
    }

    const token = AuthService.generateToken(user.toJSON());

    res.status(200).send({ token });
  }

  @Get('me')
  @Middleware(authMiddleware)
  public async me(req: Request, res: Response): Promise<void> {
    const user = await User.findById(req.decoded?.id);

    if (!user) {
      this.sendErrorResponse(res, { code: 404, message: 'Not found' });
      return;
    }
    res.status(200).send({ name: user?.name, email: user?.email });
  }
}
