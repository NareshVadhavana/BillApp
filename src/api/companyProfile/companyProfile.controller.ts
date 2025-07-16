import { Router, Request, Response, NextFunction } from 'express';
import { ROUTES, SUCCESS_MESSAGES, HTTP_STATUS_CODES } from '../../constants';
import { ControllerI } from '../../interfaces/common.interface';
import { successResposne } from '../../middleware/apiResponse.middleware';
import LoggerService from '../../services/logger/logger.service';

class CompanyProfileController implements ControllerI {
  public path = `/${ROUTES.COMPANY_PROFILE}`;
  public router = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}`, this.createCompanyProfile);
  }

  private createCompanyProfile = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      return successResposne(
        {
          message: SUCCESS_MESSAGES.COMMON.CREATE_SUCCESS.replace(':attribute', 'Admin user'),
          status: SUCCESS_MESSAGES.SUCCESS,
          statusCode: HTTP_STATUS_CODES.CREATED,
          data: null,
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
