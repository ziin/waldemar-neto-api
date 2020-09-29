import { ClassMiddleware, Controller, Get } from '@overnightjs/core';
import { Request, Response } from 'express';
import logger from '@src/logger';
import { authMiddleware } from '@src/middlewares/auth';
import { Beach } from '@src/models/beach';
import { Forecast } from '@src/services/forecast';

@Controller('forecast')
@ClassMiddleware(authMiddleware)
export class ForecastController {
  @Get('')
  public async getForecastForLoggedUser(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const beaches = await Beach.find({ user: req.decoded?.id });
      const forecast = new Forecast();
      const forecasts = await forecast.processForecastForBeaches(beaches);
      res.status(200).send(forecasts);
    } catch (error) {
      logger.error(error);
      res.status(500).send({ error: 'Something went wrong' });
    }
  }
}
