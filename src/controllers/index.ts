import { Response } from 'express';
import mongoose from 'mongoose';
import logger from '@src/logger';
import { CustomValidationErrorTypes } from '../models/user';

export abstract class BaseController {
  protected handleCreateAndUpdateErrors(
    res: Response,
    error: mongoose.Error.ValidationError | Error
  ): void {
    if (error instanceof mongoose.Error.ValidationError) {
      const validationError = this.handleValidationError(error);
      res
        .status(validationError.code)
        .send({ code: validationError.code, error: validationError.error });
    } else {
      logger.error(error);
      res.status(500).send({ error: 'Internal Error' });
    }
  }

  private handleValidationError(
    error: mongoose.Error.ValidationError
  ): { error: string; code: number } {
    return this.hasErrorOfKind(error, CustomValidationErrorTypes.DUPLICATE)
      ? { code: 409, error: error.message }
      : { code: 422, error: error.message };
  }

  private hasErrorOfKind(error: mongoose.Error.ValidationError, kind: string) {
    return Object.values(error.errors).filter((error) => error.kind === kind)
      .length;
  }
}
