import { ClassMiddleware, Controller, Get } from '@overnightjs/core';
import { Request, Response } from 'express';
import { authMiddleware } from '../middlewares/auth';
import { Beach } from '../models/beach';
import { Forecast } from '../services/forecast';

@Controller('forecast')
@ClassMiddleware(authMiddleware)
export class ForecastController {
  @Get('')
  public async getForecastForLoggedUser(
    req: Request,
    res: Response
  ): Promise<void> {
    const beaches = await Beach.find({ user: req.decoded?.id });
    const forecast = new Forecast();
    const forecasts = await forecast.processForecastForBeaches(beaches);
    res.status(200).send(forecasts);
  }
}
