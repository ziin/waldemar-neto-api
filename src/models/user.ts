import mongoose, { model, Document, Model } from 'mongoose';
import logger from '../logger';
import AuthService from '../services/auth';

export interface User {
  _id?: string;
  name: string;
  email: string;
  password: string;
}

export enum CustomValidationErrorTypes {
  DUPLICATE = 'duplicated',
}

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: [true, 'Email must be unique'],
    },
    password: { type: String, required: true },
  },
  {
    toJSON: {
      transform: (_, ret): void => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

schema.path('email').validate(
  async (email: string) => {
    const docs = await mongoose.models.User.countDocuments({ email });
    return !docs;
  },
  'already exists on the database',
  CustomValidationErrorTypes.DUPLICATE
);

schema.pre<UserModel>('save', async function (): Promise<void> {
  if (this.password && this.isModified('password')) {
    try {
      this.password = await AuthService.hashPassword(this.password);
    } catch (error) {
      logger.error(`Error while hashing the password of the user ${this.name}`);
    }
  }
});

export interface UserModel extends Omit<User, '_id'>, Document {}
export const User: Model<UserModel> = model('User', schema);
