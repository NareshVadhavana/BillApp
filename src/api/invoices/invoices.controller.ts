import { Router, Request, Response, NextFunction } from 'express';
import { ROUTES } from '../../constants';
import { ControllerI } from '../../interfaces/common.interface';
import MongoService from '../../services/mongo.service';
import InvoiceModel from './invoice.model';

class InvoicessController implements ControllerI {
  public path = `/${ROUTES.INVOICES}`;
  public router = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Web routes (render EJS views)
    this.router.get(`${this.path}`, this.list);
    this.router.get(`${this.path}/create`, this.createNewInvoiceForm);
    this.router.post(`${this.path}`, this.create);
    this.router.get(`${this.path}/:id`, this.show);
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
    // get next invoice number (auto-increment logic)
    const lastInvoice = await InvoiceModel.findOne().sort({ invoiceNumber: -1 });
    const nextInvoiceNumber = lastInvoice ? lastInvoice.invoiceNumber + 1 : 1;

    res.render('invoices/invoice-create', {
      formTitle: 'New Invoice',
      title: 'new new',
      nextInvoiceNumber,
    });
  };

  private create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const invoice = await MongoService.create(InvoiceModel, { insert: req.body });
      res.redirect(`${this.path}/${invoice._id}`);
    } catch (err) {
      next(err);
    }
  };

  private show = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const invoice = await MongoService.findOne(InvoiceModel, { query: { _id: req.params.id } });
      if (!invoice) return res.status(404).send('Invoice not found');
      res.render('invoices/show', { invoice });
    } catch (err) {
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
