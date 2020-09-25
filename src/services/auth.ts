import bcrypt from 'bcrypt';

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
}
