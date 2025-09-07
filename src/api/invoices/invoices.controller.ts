import { Router, Request, Response, NextFunction } from 'express';
import { ERROR_MESSAGES, ROUTES } from '../../constants';
import { ControllerI } from '../../interfaces/common.interface';
import MongoService from '../../services/mongo.service';
import InvoiceModel from './invoice.model';
import INVOICE_CONSTANT from './invoice.constant';
import InvoiceValidation from './invoice.validation';
import CustomerModel from '../customers/customers.model';
import { Types } from 'mongoose';

class InvoicessController implements ControllerI {
  public path = `/${ROUTES.INVOICES}`;
  public router = Router();
  private validation = new InvoiceValidation();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Web routes (render EJS views)
    this.router.get(`${this.path}`, this.list);
    this.router.get(`${this.path}/create-form`, this.createNewInvoiceForm);
    this.router.post(`${this.path}/create`, this.validation.createInvoiceValidation(), this.create);
    this.router.get(`${this.path}/:id`, this.show);
    this.router.post(`${this.path}/render-invoice-template`, this.renderInvoiceTemplate);
    this.router.get(`${this.path}/:id/edit`, this.editForm);
    this.router.post(`${this.path}/:id`, this.update);
    this.router.post(`${this.path}/:id/delete`, this.remove);
  }

  // -------- Controller Methods --------

  private list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const invoices = await MongoService.find(InvoiceModel, { query: {} });

      res.render('invoices/invoice-list', {
        // <-- folder name + file name
        title: 'Invoices',
        activePage: 'invoices',
        invoices,
      });
    } catch (err) {
      next(err);
    }
  };

  private createNewInvoiceForm = async (req: Request, res: Response) => {
    const companyId = INVOICE_CONSTANT.DEFAULT_COMPANY_ID;
    const lastInvoice = await MongoService.findOne(InvoiceModel, {
      query: { companyId: new Types.ObjectId(companyId) },
      sort: { invoiceNumber: -1 },
    });
    const nextInvoiceNumber = lastInvoice ? lastInvoice.invoiceNumber + 1 : 1;

    res.render('invoices/invoice-create', {
      formTitle: 'New Invoice',
      title: 'new new',
      nextInvoiceNumber,
    });
  };

  private create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { customerPhoneNumber, customerName, customerAddress } = req.body;
      const companyId = new Types.ObjectId(INVOICE_CONSTANT.DEFAULT_COMPANY_ID);

      let customer = await MongoService.findOne(CustomerModel, {
        query: {
          companyId,
          phoneNumber: customerPhoneNumber,
        },
      });

      if (!customer) {
        customer = await MongoService.create(CustomerModel, {
          insert: {
            name: customerName,
            companyId,
            phoneNumber: customerPhoneNumber,
            address: customerAddress,
          },
        });
      }

      if (!customer) {
        throw new Error(ERROR_MESSAGES.COMMON.NOT_FOUND.replace(':attribute', 'customer details'));
      }

      const invoiceObj = {
        ...req.body,
        companyId,
        customeId: customer?._id,
      };

      const invoice = await MongoService.create(InvoiceModel, { insert: invoiceObj });

      res.json({ message: 'Invoice created successfully', invoiceId: invoice._id });
      // res.redirect(`${this.path}/${invoice._id}`);
    } catch (err) {
      next(err);
    }
  };

  private show = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const invoice = await MongoService.findOne(InvoiceModel, {
        query: { _id: req.params.id },
        populate: {
          path: 'companyId',
          select: 'companyName logoImage termsAndConditions companyAddress companyPhoneNumber',
        },
      });

      console.log(invoice);

      if (!invoice) {
        return res.status(404).send('Invoice not found');
      }

      res.render('invoices/show', { invoice, title: 'Preview Invoice' });
    } catch (err) {
      next(err);
    }
  };

  private renderInvoiceTemplate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log('/eveveve');
      const invoice = req.body.invoice; // now JSON is automatically parsed
      console.log('invoice', invoice);

      if (!invoice) return res.status(400).send('Invoice data is required');

      res.render(
        'invoices/invoice-template',
        { invoice, title: 'Preview Invoice', layout: false },
        (err, html) => {
          if (err) return res.status(500).send(err.message);
          res.send(html);
        }
      );
    } catch (err) {
      console.error(err);
      next(err);
    }
  };

  private editForm = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const invoice = await MongoService.findOne(InvoiceModel, { query: { _id: req.params.id } });
      if (!invoice) return res.status(404).send('Invoice not found');
      res.render('invoices/form', { formTitle: 'Edit Invoice', invoice });
    } catch (err) {
      next(err);
    }
  };

  private update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await MongoService.findOneAndUpdate(InvoiceModel, {
        query: { _id: req.params.id },
        updateData: req.body,
      });
      res.redirect(`${this.path}/${req.params.id}`);
    } catch (err) {
      next(err);
    }
  };

  private remove = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await MongoService.deleteOne(InvoiceModel, { query: { _id: req.params.id } });
      res.redirect(this.path);
    } catch (err) {
      next(err);
    }
  };
}

export default InvoicessController;
