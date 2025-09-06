import * as mongoose from 'mongoose';
import { CustomerI } from './customers.interface';

const CustomerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    address: {
      type: String,
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

const CustomerModel = mongoose.model<CustomerI & mongoose.Document>('Customer', CustomerSchema);

export default CustomerModel;
