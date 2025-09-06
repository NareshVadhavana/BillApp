import { NextFunction, Response, Request } from 'express';
import * as jwt from 'jsonwebtoken';
import { ERROR_MESSAGES, HTTP_STATUS_CODES } from '../constants';
import MongoService from '../services/mongo.service';
import { DataStoredInTokenI, RequestWithUserI } from '../interfaces/common.interface';
import UserModel from '../api/users/users.model';

async function authMiddleware(
  request: Request,
  response: Response,
  next: NextFunction
): Promise<boolean> {
  try {
    const req = request as RequestWithUserI;

    const secret = process.env.JWT_SECRET || 'JWT_SECRET';
    const authHeader = req.headers.authorization as string;

    if (!authHeader) {
      response.statusCode = HTTP_STATUS_CODES.FORBIDDEN;
      throw new Error(ERROR_MESSAGES.TOKEN_EXPIRED);
    }

    const token = authHeader.split(' ')?.[1] || '';

    console.log('token: ', token);

    const verificationResponse = jwt.verify(token, secret) as DataStoredInTokenI;

    const _id = verificationResponse._id;
    const user = await MongoService.findOne(UserModel, {
      query: { _id },
    });

    if (!user) {
      response.statusCode = HTTP_STATUS_CODES.FORBIDDEN;
      throw new Error(ERROR_MESSAGES.TOKEN_EXPIRED);
    }

    req.user = user;
    next();
    return true;
  } catch (error) {
    response.status(HTTP_STATUS_CODES.UNAUTHORIZED);
    next(error);
    return false;
  }
}

export default authMiddleware;
