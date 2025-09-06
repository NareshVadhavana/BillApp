import { NextFunction, Response, Request } from 'express';
import { ERROR_MESSAGES, HTTP_STATUS_CODES } from '../constants';
import { RequestWithUserI } from '../interfaces/common.interface';
import MongoService from '../services/mongo.service';
import UserModel from '../api/users/users.model';

function hasRole(allowedRoles: string[]) {
  const roleMiddleware = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<boolean> => {
    try {
      const req = request as RequestWithUserI;
      const userId = req.user;

      const user = await MongoService.findOne(UserModel, { query: { _id: userId } });

      if (allowedRoles.includes(user.role)) {
        next();
        return true;
      } else {
        response.statusCode = HTTP_STATUS_CODES.FORBIDDEN;
        throw new Error(ERROR_MESSAGES.NOT_ACCESS);
      }
    } catch (error) {
      next(error);
      return false;
    }
  };

  return roleMiddleware;
}

export default hasRole;
