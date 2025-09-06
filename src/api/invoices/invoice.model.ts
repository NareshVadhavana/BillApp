import * as mongoose from 'mongoose';
import { InvoiceI } from './invoice.interface';

const ItemSchema = new mongoose.Schema(
  {
    itemName: {
      type: String,
      required: true,
    },
    unitPrice: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
    },
    itemTotalPrice: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      virtuals: true,
      getters: true,
    },
  }
);

const InvoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: Number,
      required: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      index: true,
    },
    customerPhoneNumber: {
      type: String,
    },
    customerName: {
      type: String,
    },
    customerAddress: {
      type: String,
    },
    invoiceIssueDate: {
      type: Date,
    },
    items: {
      type: [ItemSchema],
    },
    subTotal: {
      type: Number,
    },
    sgstTax: {
      type: Number,
    },
    cgstTax: {
      type: Number,
    },
    otherTax: {
      type: Number,
    },
    totalTax: {
      type: Number,
    },
    discount: {
      type: Number,
    },
    grandTotal: {
      type: Number,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      virtuals: true,
      getters: true,
    },
  }
);

const InvoiceModel = mongoose.model<InvoiceI & mongoose.Document>('Invoice', InvoiceSchema);

export default InvoiceModel;
