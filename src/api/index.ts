import AuthController from './auth/auth.controller';
import CompanyProfileController from './companyProfile/companyProfile.controller';
import CustomerController from './customers/customers.controller';
// import InvoiceController from './invoice/invoice.controller';
import InvoicessController from './invoices/invoices.controller';
import UserController from './users/users.controller';

export = [
  new CompanyProfileController(),
  new UserController(),
  new AuthController(),
  new CustomerController(),
  // new InvoiceController(),
  new InvoicessController(),
];
