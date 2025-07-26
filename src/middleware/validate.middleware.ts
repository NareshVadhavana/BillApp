import { Request, Response, NextFunction } from 'express';
import { ValidationChain, validationResult } from 'express-validator';
import { HTTP_STATUS_CODES, ERROR_MESSAGES } from '../constants';
import Logger from '../services/logger/logger.service';
import { errorResponse } from './apiResponse.middleware';

const validate = (validations: ValidationChain[]) => {
  return async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    await Promise.all(validations.map((validation) => validation.run(request)));

    const errors = validationResult(request);
    if (errors.isEmpty()) {
      return next();
    }
    Logger.error(`Error in validation: ${errors.array()[0].msg}`);

    response.statusCode = HTTP_STATUS_CODES.BAD_REQUEST;

    return errorResponse(
      {
        message: errors.array()?.[0]?.msg || ERROR_MESSAGES.SOMETHING_WENT_WRONG,
        status: ERROR_MESSAGES.ERROR,
        statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
        data: null,
      },
      request,
      response,
      next
    );
  };
};

export default validate;
