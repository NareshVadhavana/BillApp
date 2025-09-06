import { Router, Request, Response, NextFunction } from 'express';
import { ROUTES, SUCCESS_MESSAGES, HTTP_STATUS_CODES, USERS_CONSTANT } from '../../constants';
import { ControllerI, RequestWithUserI } from '../../interfaces/common.interface';
import { successResposne } from '../../middleware/apiResponse.middleware';
import LoggerService from '../../services/logger/logger.service';
import InvoiceValidation from './invoice.validation';
import InvoiceModel from './invoice.model';
import MongoService from '../../services/mongo.service';
import authMiddleware from '../../middleware/auth.middleware';
import roleMiddleware from '../../middleware/role.middleware';

class InvoiceController implements ControllerI {
  public path = `/${ROUTES.INVOICES}`;
  public router = Router();
  private validation = new InvoiceValidation();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}`,
      authMiddleware,
      roleMiddleware([USERS_CONSTANT.ROLE.COMPANY, USERS_CONSTANT.ROLE.COMPANY_STAFF]),
      this.validation.createInvoiceValidation(),
      this.createInvoice
    );
  }

  private createInvoice = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const { companyName } = request.body;

      const req = request as RequestWithUserI;
      const companyId = req.user.companyId;

      const lastInvoice = await MongoService.findOne(InvoiceModel, { sort: { invoiceNumber: -1 } });
      const invoiceNumber = lastInvoice ? lastInvoice.invoiceNumber + 1 : 1;

      const createdInvoice = await MongoService.create(InvoiceModel, {
        insert: {
          invoiceNumber,
          companyId,
          invoiceIssueDate: new Date(),
        },
      });

      return successResposne(
        {
          message: SUCCESS_MESSAGES.COMMON.CREATE_SUCCESS.replace(':attribute', 'Invoice'),
          status: SUCCESS_MESSAGES.SUCCESS,
          statusCode: HTTP_STATUS_CODES.CREATED,
          data: createdInvoice,
        },
        request,
        response,
        next
      );
    } catch (error) {
      LoggerService.error(`There was an issue into creating an invoice.: ${error}`);
      return next(error);
    }
  };
}

export default InvoiceController;
