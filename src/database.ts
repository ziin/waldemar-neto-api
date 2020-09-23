import config, { IConfig } from 'config';
import mongoose, { Mongoose } from 'mongoose';

const databaseConfig: IConfig = config.get('app.database');

export const connect = async (): Promise<Mongoose> =>
  await mongoose.connect(databaseConfig.get('mongoUrl'), {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

export const close = (): Promise<void> => mongoose.connection.close();
