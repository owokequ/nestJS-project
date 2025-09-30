import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRepository } from './user.repository';
import { UserRegisterDTO } from './dtos/user.register.dto';
import { UserLoginDTO } from './dtos/user.login.dto';
import { User } from './user.entity';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly configService: ConfigService,
  ) {}

  async userRegister({ email, name, password }: UserRegisterDTO) {
    const verify = await this.userRepository.verifyDataFromDB(email);
    if (verify) {
      throw new BadRequestException('Пользователь уже зарегестрирован');
    }
    const newUser = new User(name, email);
    password = await newUser.setPassword(password);
    const { accessToken, refreshToken } = this.createToken({
      name,
      email,
      role: 'user',
    });
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

  async userLogin({ email, password }: UserLoginDTO) {
    const data = await this.userRepository.verifyDataFromDB(email);
    if (!data) {
      throw new NotFoundException(`user not found`);
    }
    const newUser = new User(data.email, data.name, data.password);
    const pass = await newUser.comparePassword(password);
    if (!pass) {
      throw new BadRequestException(`password is not correct`);
    }
    const { refreshToken, accessToken } = this.createToken({
      email: data.email,
      name: data.name,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      role: data.role,
    });
    await this.userRepository.updateTokenFromDB(data.id, refreshToken);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    return { refresh: refreshToken, access: accessToken, role: data.role };
  }

  async validate(email: string) {
    const user = await this.userRepository.verifyDataFromDB(email);
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    return { email: user.email, name: user.name, role: user.role };
  }

  async refreshToken(token: string) {
    const verify = jwt.verify(
      token,
      this.configService.get('SECRET_FOR_REFRESH') as string,
    ) as jwt.JwtPayload & { email: string; name: string; role: string };
    if (!verify) {
      throw new BadRequestException(`Токен не прошел проверку`);
    }
    const data = await this.userRepository.verifyDataFromDB(verify.email);
    if (!data || !data.userToken) {
      throw new BadRequestException(`Токен был отозван`);
    }
    const tokens = this.createToken({
      email: verify.email,
      name: verify.name,
      role: verify.role,
    });
    await this.userRepository.updateTokenFromDB(data.id, tokens.refreshToken);
    return {
      refresh: tokens.refreshToken,
      access: tokens.accessToken,
      role: verify.role,
    };
  }

  private createToken(payload: object) {
    const jwtSecret = this.configService.get('SECRET_FOR_ACCESS') as string;
    const jwtSecretRefresh = this.configService.get(
      'SECRET_FOR_REFRESH',
    ) as string;
    const accessToken = jwt.sign(payload, jwtSecret, {
      expiresIn: '15m',
    });
    const refreshToken = jwt.sign(payload, jwtSecretRefresh, {
      expiresIn: '7d',
    });
    return { accessToken, refreshToken };
  }
}
