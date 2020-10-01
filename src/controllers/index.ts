import { Response } from 'express';
import mongoose from 'mongoose';
import logger from '@src/logger';
import { CustomValidationErrorTypes } from '../models/user';
import ApiError, { APIError } from '../utils/errors/ApiError';

export abstract class BaseController {
  protected handleCreateAndUpdateErrors(
    res: Response,
    error: mongoose.Error.ValidationError | Error
  ): void {
    if (error instanceof mongoose.Error.ValidationError) {
      const validationError = this.handleValidationError(error);
      this.sendErrorResponse(res, {
        code: validationError.code,
        message: validationError.error,
      });
    } else {
      logger.error(error);
      this.sendErrorResponse(res, {
        code: 500,
        message: 'Something went error',
      });
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

  protected sendErrorResponse = (res: Response, error: APIError): Response => {
    return res.status(error.code).send(ApiError.format(error));
  };
}
