import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserRegisterDTO } from './dtos/user.register.dto';
import { User } from '@prisma/client';

@Injectable()
export class UserRepository {
  constructor(private readonly prismaService: PrismaService) {}
  async addUserFromDB(
    { name, email, password }: UserRegisterDTO,
    refresh_token: string,
  ): Promise<User> {
    const addUser = await this.prismaService.user.create({
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
    return addUser;
  }

  async verifyDataFromDB(email: string): Promise<User | null> {
    const user = await this.prismaService.user.findUnique({
      where: { email },
      include: {
        userToken: true,
      },
    });
    return user;
  }
}
