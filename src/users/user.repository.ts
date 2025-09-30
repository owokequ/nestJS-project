import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRegisterDTO } from './dtos/user.register.dto';
import { User, UserToken } from '@prisma/client';

@Injectable()
export class UserRepository {
  constructor(private readonly prismaService: PrismaService) {}
  async addUserFromDB(
    { name, email, password }: UserRegisterDTO,
    refresh_token: string,
  ): Promise<User | boolean> {
    return await this.prismaService.user.create({
      data: {
        name,
        email,
        password,
        userToken: {
          create: {
            refresh_token,
          },
        },
      },
    });
  }

  async verifyDataFromDB(email: string) {
    return await this.prismaService.user.findUnique({
      where: { email },
      include: {
        userToken: true,
      },
    });
  }

  async updateTokenFromDB(
    userId: number,
    refreshToken: string,
  ): Promise<UserToken> {
    return await this.prismaService.userToken.upsert({
      where: { user_id: userId },
      update: {
        refresh_token: refreshToken,
      },
      create: {
        user_id: userId,
        refresh_token: refreshToken,
      },
    });
  }
}
