import * as mongoose from 'mongoose';
import { UserI } from './users.interface';

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      index: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    role: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
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

const UserModel = mongoose.model<UserI & mongoose.Document>('User', UserSchema);

export default UserModel;
