import { Router, Request, Response, NextFunction } from 'express';
import { ERROR_MESSAGES, ROUTES } from '../../constants';
import { ControllerI } from '../../interfaces/common.interface';
import MongoService from '../../services/mongo.service';
import InvoiceModel from './invoice.model';
import INVOICE_CONSTANT from './invoice.constant';
import InvoiceValidation from './invoice.validation';
import CustomerModel from '../customers/customers.model';
import { Types } from 'mongoose';
import puppeteer from 'puppeteer';
const { v4: uuidv4 } = require('uuid');

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
    // this.router.post(`${this.path}/:id`, this.update);
    this.router.post(`${this.path}/:id/delete`, this.remove);
    this.router.post(`${this.path}/pdf/download`, this.downloadInvoicePdf);
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
      const uniqueUuid = uuidv4();

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
        uuid: uniqueUuid,
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
          select:
            'companyName logoImage termsAndConditions companyAddress companyPhoneNumber gstNumber',
        },
      });

      if (!invoice) {
        return res.status(404).send('Invoice not found');
      }

      if (invoice && invoice?.companyId && invoice?.companyId?.logoImage) {
        invoice.companyId.logoImage = `${process.env.BACKEND_URL}${invoice?.companyId?.logoImage}`;
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

  sanitizeFileName = (str: string) => str.replace(/[^a-z0-9]/gi, '_'); // safe for filenames

  formatInvoiceDateTime = (date: Date) => {
    const d = new Date(date);

    let hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12; // convert 0-23 to 1-12

    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');

    return `${day}-${month}-${year}-${hours}-${minutes}_${ampm}`;
  };

  private downloadInvoicePdf = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { html, invoiceId } = req.body; // your invoice HTML

      // Fetch invoice from DB
      const invoice = await InvoiceModel.findById(invoiceId);
      if (!invoice) return res.status(404).send('Invoice not found');

      // Generate filename
      const customerSafe = this.sanitizeFileName(invoice.customerName || 'Customer');

      const dateTime = this.formatInvoiceDateTime(new Date());
      const fileName = `${customerSafe}_${dateTime}_${invoice.uuid}.pdf`;

      // Wrap with full HTML including bootstrap
      const fullHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Invoice</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
        <style>
          body { font-family: Arial, sans-serif; }
          table.table { border-collapse: collapse; }
          table.table-bordered td, table.table-bordered th {
            border: 1px solid #eaeaea !important; /* Light thin border like preview */
          }
          table.table thead th {
            background-color: #f8f9fa !important; /* Same as Bootstrap table-light */
            font-weight: 600;
            color: #333;
          }
          td, th {
            color: #495057; /* Matches Bootstrap default text color */
            font-size: 0.95rem;
          }
        </style>

        <style>
          @media print {
            .row { display: flex; flex-wrap: nowrap !important; }
            .col-md-6 { flex: 0 0 50% !important; max-width: 50% !important; }
          }
        </style>
      </head>
      <body>
        ${html}
      </body>
      </html>
    `;

      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      const page = await browser.newPage();

      // Increase timeout (default is 30,000 ms)
      page.setDefaultNavigationTimeout(120000); // 2 minutes
      page.setDefaultTimeout(120000); // optional: for all waits

      await page.setContent(fullHtml, { waitUntil: 'networkidle0' });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' },
      });

      await browser.close();

      console.log('fileName: ', fileName);

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=${fileName}`,
        'Content-Length': pdfBuffer.length,
      });

      res.send(pdfBuffer);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error generating PDF', error: err });
    }
  };
}

export default InvoicessController;
