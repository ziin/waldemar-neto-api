import { Controller, Post } from '@overnightjs/core';
import { Request, Response } from 'express';
import { User } from '@src/models/user';
import { BaseController } from '.';
import AuthService from '@src/services/auth';

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
}
