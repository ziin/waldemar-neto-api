import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from 'config';
import { User } from '@src/models/user';

export interface DecodedUser extends Omit<User, '_id'> {
  id: string;
}

export default class AuthService {
  static hashPassword = async function (
    password: string,
    salt = 10
  ): Promise<string> {
    return await bcrypt.hash(password, salt);
  };

  static checkPassword = async function (
    password: string,
    hashPassword: string
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashPassword);
  };

  static generateToken = function (payload: DecodedUser): string {
    const { access_secret, access_expire } = config.get('app.auth');
    const token = jwt.sign(payload, access_secret, {
      expiresIn: access_expire,
    });

    return token;
  };

  static decodeToken = function (token: string): DecodedUser {
    const { access_secret } = config.get('app.auth');
    return jwt.verify(token, access_secret) as DecodedUser;
  };
}
