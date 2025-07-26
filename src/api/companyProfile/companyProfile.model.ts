import * as mongoose from 'mongoose';
import { CompanyProfileI } from './companyProfile.interface';

const companyProfileSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
      index: true,
    },
    logoImage: {
      type: String,
    },
    termsAndConditions: {
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

// companyProfileSchema.plugin(mongoosePaginate);

const CompanyProfileModel = mongoose.model<CompanyProfileI & mongoose.Document>(
  'CompanyProfile',
  companyProfileSchema
);

export default CompanyProfileModel;
