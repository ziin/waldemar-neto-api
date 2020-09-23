import mongoose, { model, Document, Model } from 'mongoose';

export enum BeachPosition {
  N = 'N',
  E = 'E',
  S = 'S',
  W = 'W',
}

export interface Beach {
  _id?: string;
  lat: number;
  lng: number;
  name: string;
  position: BeachPosition;
}

const schema = new mongoose.Schema(
  {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    name: { type: String, required: true },
    position: { type: String, required: true },
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

export interface BeachModel extends Omit<Beach, '_id'>, Document {}

export const Beach: Model<BeachModel> = model('Beach', schema);
