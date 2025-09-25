import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRepository } from './user.repository';
import { UserRegisterDTO } from './dtos/user.register.dto';
import { UserLoginDTO } from './dtos/user.login.dto';
import { User } from './user.entity';
import { sign } from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly configService: ConfigService,
  ) {}

  async userRegister({ email, name, password }: UserRegisterDTO) {
    const newUser = new User(name, email);
    password = await newUser.setPassword(password);
    const { accessToken, refreshToken } = this.createToken({ name, email });
    const data = await this.userRepository.addUserFromDB(
      {
        email,
        name,
        password,
      },
      refreshToken,
    );
    return { data, accessToken, refreshToken };
  }

  async userLogin({ email, password }: UserLoginDTO): Promise<string> {
    const data = await this.userRepository.verifyDataFromDB(email);
    if (!data) {
      throw new NotFoundException(`user not found`);
    }
    const newUser = new User(data.email, data.name, data.password);
    const pass = await newUser.comparePassword(password);
    if (!pass) {
      throw new BadRequestException(`password is not correct`);
    }
    const { refreshToken } = this.createToken({
      email: data.email,
      name: data.name,
    });
    await this.userRepository.updateTokenFromDB(data.id, refreshToken);
    return refreshToken;
  }

  createToken(payload: object) {
    const jwtSecret = this.configService.get('SECRET_FOR_ACCESS') as string;
    const jwtSecretRefresh = this.configService.get(
      'SECRET_FOR_REFRESH',
    ) as string;
    const accessToken = sign(payload, jwtSecret, {
      expiresIn: '15m',
    });
    const refreshToken = sign(payload, jwtSecretRefresh, {
      expiresIn: '7d',
    });
    return { accessToken, refreshToken };
  }
}
