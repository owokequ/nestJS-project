import { Injectable } from '@nestjs/common';
import { compare, hash } from 'bcrypt';

@Injectable()
export class User {
  private _password?: string;
  private _name?: string;
  private _email: string;
  constructor(email: string, name?: string, hashPassword?: string) {
    this._email = email;
    this._name = name;
    this._password = hashPassword;
  }

  get password() {
    return this._password;
  }

  get name() {
    return this._name;
  }

  get email() {
    return this._email;
  }

  async setPassword(pass: string) {
    const hashPass = await hash(pass, 3);
    this._password = hashPass;
    return this._password;
  }
  async comparePassword(pass: string) {
    return await compare(pass, this.password as string);
  }
}
