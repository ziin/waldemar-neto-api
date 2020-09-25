import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from 'config';
import { User } from '@src/models/user';

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

  static generateToken = function (payload: Partial<User>): string {
    const { access_secret, access_expire } = config.get('app.auth');
    const token = jwt.sign(payload, access_secret, {
      expiresIn: access_expire,
    });

    return token;
  };
}
