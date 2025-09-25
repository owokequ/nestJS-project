import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserRegisterDTO } from './dtos/user.register.dto';
import { UserLoginDTO } from './dtos/user.login.dto';
import type { Response } from 'express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/register')
  async AddUser(@Body() userData: UserRegisterDTO, @Res() res: Response) {
    const result = await this.usersService.userRegister(userData);
    this.setCooke(res, result.refreshToken);
    return res.status(HttpStatus.CREATED).json({
      user: result.data,
      accessToken: result.accessToken,
    });
  }

  @Post('/login')
  async LoginUser(@Body() userData: UserLoginDTO, @Res() res: Response) {
    const result = await this.usersService.userLogin(userData);
    this.setCooke(res, result);
    return res.status(HttpStatus.ACCEPTED).json({ message: true });
  }

  setCooke(@Res() res: Response, refresh: string) {
    res.cookie('refreshToken', refresh, {
      httpOnly: true,
      secure: true,
      maxAge: 15 * 24 * 60 * 60 * 1000,
    });
  }
}
