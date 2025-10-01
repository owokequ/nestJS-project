import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Next,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UserRegisterDTO } from './dtos/user.register.dto';
import { UserLoginDTO } from './dtos/user.login.dto';
import type { NextFunction, Request, Response } from 'express';
import type { RequestWithCookies } from 'src/interface/req.interface';
import { AuthGuard } from '@nestjs/passport';
import { Role } from '../common/decorators/role.decorators';
import { RoleGuard } from '../common/Guards/role.guard';

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
      const { refresh, access } = await this.usersService.userLogin(userData);
      this.setCooke(res, refresh);
      return res
        .status(HttpStatus.ACCEPTED)
        .json({ message: true, access: access });
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
        throw new UnauthorizedException('Token not found');
      }
      const { refresh, access, role } =
        await this.usersService.refreshToken(token);
      this.setCooke(res, refresh);
      return res.json({
        message: 'токен успешно заменен',
        refresh: refresh,
        access: access,
        role: role,
      });
    } catch (error) {
      next(error);
    }
  }

  @Get('logout')
  logout(@Res() res: Response, @Req() req: RequestWithCookies) {
    res.cookie('refreshToken', req.cookies.refreshToken, {
      maxAge: 0,
    });
    return res.json({ message: 'Вы вышли из аккаунта' });
  }

  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Role('admin')
  @Get('@me')
  me(@Req() req: Request) {
    return req.user;
  }

  private setCooke(@Res() res: Response, refresh: string) {
    res.cookie('refreshToken', refresh, {
      httpOnly: true,
      secure: true,
      maxAge: 15 * 24 * 60 * 60 * 1000,
    });
  }
}
