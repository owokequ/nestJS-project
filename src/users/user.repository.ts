import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserRegisterDTO } from './dtos/user.register.dto';
import { User, UserToken } from '@prisma/client';

@Injectable()
export class UserRepository {
  constructor(private readonly prismaService: PrismaService) {}
  async addUserFromDB(
    { name, email, password }: UserRegisterDTO,
    refresh_token: string,
  ): Promise<User> {
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

  async verifyDataFromDB(email: string): Promise<User | null> {
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
    return await this.prismaService.userToken.update({
      where: { user_id: userId },
      data: {
        refresh_token: refreshToken,
      },
    });
  }
}
