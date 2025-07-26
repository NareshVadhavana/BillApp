import { Router, Request, Response, NextFunction } from 'express';
import { ROUTES, SUCCESS_MESSAGES, HTTP_STATUS_CODES, ERROR_MESSAGES } from '../../constants';
import { ControllerI } from '../../interfaces/common.interface';
import { successResposne } from '../../middleware/apiResponse.middleware';
import LoggerService from '../../services/logger/logger.service';
import MongoService from '../../services/mongo.service';
import UserModel from './users.model';
import CompanyProfileModel from '../companyProfile/companyProfile.model';
import * as bcrypt from 'bcrypt';

class UserController implements ControllerI {
  public path = `/${ROUTES.USERS}`;
  public router = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}`, this.createUser);
  }

  private createUser = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const { username, companyId, phoneNumber, password } = request.body;

      const defaultRole = 'Admin';

      const company = await MongoService.findOne(CompanyProfileModel, {
        query: { _id: companyId },
      });

      if (!company) {
        throw new Error(ERROR_MESSAGES.COMMON.NOT_FOUND.replace(':attribute', 'company details'));
      }

      // check user already exists or not
      const isPhoneNumberAlreadyExists = await MongoService.findOne(UserModel, {
        query: { phoneNumber: phoneNumber },
        select: 'phoneNumber',
      });

      if (isPhoneNumberAlreadyExists) {
        throw new Error(ERROR_MESSAGES.COMMON.ALREADY_EXISTS.replace(':attribute', 'user'));
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await MongoService.create(UserModel, {
        insert: { username, companyId, role: defaultRole, phoneNumber, password: hashedPassword },
      });

      const userResponseData = user.toObject();

      delete userResponseData.password;

      return successResposne(
        {
          message: SUCCESS_MESSAGES.COMMON.CREATE_SUCCESS.replace(':attribute', 'User'),
          status: SUCCESS_MESSAGES.SUCCESS,
          statusCode: HTTP_STATUS_CODES.CREATED,
          data: userResponseData,
        },
        request,
        response,
        next
      );
    } catch (error) {
      LoggerService.error(`There was an issue into creating an user.: ${error}`);
      response.status(HTTP_STATUS_CODES.BAD_REQUEST);
      return next(error);
    }
  };
}

export default UserController;
