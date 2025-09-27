import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  Next,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UserRegisterDTO } from './dtos/user.register.dto';
import { UserLoginDTO } from './dtos/user.login.dto';
import type { NextFunction, Request, Response } from 'express';
import type { RequestWithCookies } from 'src/interface/req.interface';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/register')
  async AddUser(
    @Body() userData: UserRegisterDTO,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    try {
      const result = await this.usersService.userRegister(userData);
      this.setCooke(res, result.refreshToken);
      return res.status(HttpStatus.CREATED).json({
        user: result.data,
        accessToken: result.accessToken,
      });
    } catch (error) {
      next(error);
    }
  }

  @Post('/login')
  async LoginUser(
    @Body() userData: UserLoginDTO,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    try {
      const result = await this.usersService.userLogin(userData);
      this.setCooke(res, result);
      return res.status(HttpStatus.ACCEPTED).json({ message: true });
    } catch (error) {
      next(error);
    }
  }

  @Get('/refresh')
  async refreshToken(
    @Next() next: NextFunction,
    @Req() req: RequestWithCookies,
    @Res() res: Response,
  ) {
    try {
      const token = req.cookies.refreshToken as string;
      if (!token) {
        throw new BadRequestException('Token not found');
      }
      const refresh_token = await this.usersService.refreshToken(token);
      this.setCooke(res, refresh_token);
      return res.json({ message: 'токен успешно заменен', refresh_token });
    } catch (error) {
      next(error);
    }
  }

  setCooke(@Res() res: Response, refresh: string) {
    res.cookie('refreshToken', refresh, {
      httpOnly: true,
      secure: true,
      maxAge: 15 * 24 * 60 * 60 * 1000,
    });
  }
}
