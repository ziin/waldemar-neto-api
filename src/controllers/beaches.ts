import { ClassMiddleware, Controller, Post } from '@overnightjs/core';
import { Request, Response } from 'express';
import { Beach } from '@src/models/beach';
import { authMiddleware } from '../middlewares/auth';
import { BaseController } from '.';

@Controller('beaches')
@ClassMiddleware([authMiddleware])
export class BeachesController extends BaseController {
  @Post('')
  public async create(req: Request, res: Response): Promise<void> {
    try {
      const beach = await Beach.create({ ...req.body, user: req.decoded?.id });
      res.status(201).send(beach.toJSON());
    } catch (err) {
      this.handleCreateAndUpdateErrors(res, err);
    }
  }
}
