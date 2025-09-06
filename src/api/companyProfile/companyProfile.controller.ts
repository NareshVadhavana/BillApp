import { Router, Request, Response, NextFunction } from 'express';
import {
  ROUTES,
  SUCCESS_MESSAGES,
  HTTP_STATUS_CODES,
  ERROR_MESSAGES,
  USERS_CONSTANT,
} from '../../constants';
import { ControllerI } from '../../interfaces/common.interface';
import { successResposne } from '../../middleware/apiResponse.middleware';
import LoggerService from '../../services/logger/logger.service';
import MongoService from '../../services/mongo.service';
import CompanyProfileModel from './companyProfile.model';
import authMiddleware from '../../middleware/auth.middleware';
import roleMiddleware from '../../middleware/role.middleware';
import UserModel from '../users/users.model';
import * as bcrypt from 'bcrypt';
import CompanyProfileValidation from './compnayProfile.validation';

class CompanyProfileController implements ControllerI {
  public path = `/${ROUTES.COMPANY_PROFILE}`;
  public router = Router();
  private validation = new CompanyProfileValidation();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}`,
      authMiddleware,
      roleMiddleware([USERS_CONSTANT.ROLE.ADMIN]),
      this.validation.createCompanyValidation(),
      this.createCompanyProfile
    );
  }

  private createCompanyProfile = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const { companyName, username, phoneNumber, password } = request.body;

      // check company already exists or not
      const isCompanyAlreadyExists = await MongoService.findOne(CompanyProfileModel, {
        query: { companyName: companyName },
        select: 'phoneNumber',
      });

      if (isCompanyAlreadyExists) {
        throw new Error(ERROR_MESSAGES.COMMON.ALREADY_EXISTS.replace(':attribute', 'company'));
      }

      // check user already exists or not
      const isPhoneNumberAlreadyExists = await MongoService.findOne(UserModel, {
        query: { phoneNumber: phoneNumber },
        select: 'phoneNumber',
      });

      if (isPhoneNumberAlreadyExists) {
        throw new Error(ERROR_MESSAGES.COMMON.ALREADY_EXISTS.replace(':attribute', 'user'));
      }

      const company = await MongoService.create(CompanyProfileModel, { insert: { companyName } });

      // create user
      const companyRole = USERS_CONSTANT.ROLE.COMPANY;
      const hashedPassword = await bcrypt.hash(password, 10);

      MongoService.create(UserModel, {
        insert: {
          username: username,
          companyId: company?._id,
          role: companyRole,
          phoneNumber,
          password: hashedPassword,
        },
      });

      return successResposne(
        {
          message: SUCCESS_MESSAGES.COMMON.CREATE_SUCCESS.replace(':attribute', 'Company'),
          status: SUCCESS_MESSAGES.SUCCESS,
          statusCode: HTTP_STATUS_CODES.CREATED,
          data: company,
        },
        request,
        response,
        next
      );
    } catch (error) {
      LoggerService.error(`There was an issue into creating a company profile.: ${error}`);
      return next(error);
    }
  };
}

export default CompanyProfileController;
