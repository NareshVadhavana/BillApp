import { Router, Request, Response, NextFunction } from 'express';
import {
  ROUTES,
  SUCCESS_MESSAGES,
  HTTP_STATUS_CODES,
  ERROR_MESSAGES,
  USERS_CONSTANT,
} from '../../constants';
import { ControllerI, RequestWithUserI } from '../../interfaces/common.interface';
import { successResposne } from '../../middleware/apiResponse.middleware';
import LoggerService from '../../services/logger/logger.service';
import MongoService from '../../services/mongo.service';
import CompanyProfileModel from '../companyProfile/companyProfile.model';
import CustomerModel from './customers.model';
import authMiddleware from '../../middleware/auth.middleware';
import roleMiddleware from '../../middleware/role.middleware';
import CustomerValidation from './customer.validation';

class CustomerController implements ControllerI {
  public path = `/${ROUTES.CUSTOMERS}`;
  public router = Router();
  private validation = new CustomerValidation();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}`,
      authMiddleware,
      roleMiddleware([USERS_CONSTANT.ROLE.COMPANY, USERS_CONSTANT.ROLE.COMPANY_STAFF]),
      this.validation.createCustomerValidation(),
      this.createCustomer
    );
  }

  private createCustomer = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const { name, phoneNumber, address } = request.body;
      const req = request as RequestWithUserI;
      const companyId = req.user.companyId;

      const company = await MongoService.findOne(CompanyProfileModel, {
        query: { _id: companyId },
      });

      if (!company) {
        throw new Error(ERROR_MESSAGES.COMMON.NOT_FOUND.replace(':attribute', 'company details'));
      }

      // check customer phone already exists or not
      const isPhoneNumberAlreadyExists = await MongoService.findOne(CustomerModel, {
        query: { phoneNumber: phoneNumber, companyId: companyId },
        select: 'phoneNumber',
      });

      if (isPhoneNumberAlreadyExists) {
        throw new Error(ERROR_MESSAGES.COMMON.ALREADY_EXISTS.replace(':attribute', 'customer'));
      }

      const customer = await MongoService.create(CustomerModel, {
        insert: { name, companyId, phoneNumber, address },
      });

      return successResposne(
        {
          message: SUCCESS_MESSAGES.COMMON.CREATE_SUCCESS.replace(':attribute', 'Customer'),
          status: SUCCESS_MESSAGES.SUCCESS,
          statusCode: HTTP_STATUS_CODES.CREATED,
          data: customer,
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

export default CustomerController;
