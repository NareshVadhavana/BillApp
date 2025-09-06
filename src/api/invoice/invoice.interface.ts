import { CompanyProfileI } from '../companyProfile/companyProfile.interface';
import { UserI } from '../users/users.interface';

export interface TaxDetailsI {
  name: string;
  percentage: number;
  taxAmount: number;
}

export interface InvoiceItemI {
  _id: string;
  itemName: string;
  unitPrice: number;
  quantity: number;
  itemTotalPrice: number;
}

export interface InvoiceI {
  _id: string;
  invoiceNumber: string;
  invoiceIssueDate: Date;
  companyId: CompanyProfileI;
  customerId: UserI;
  customerPhoneNumber: string;
  customerName: string;
  customerAddress: string;
  items: [InvoiceItemI];
  subTotal: number;
  taxes: [TaxDetailsI];
  totalTax: number;
  discount: number;
  grandTotal: number;
  status: string;
  notes: string;
}

export interface UpdateCompanyProfile {
  companyName?: string;
  logoImage?: string;
  termsAndConditions?: string;
}
