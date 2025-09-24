import { Body, Controller, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserRegisterDTO } from './dtos/user.register.dto';
import { UserLoginDTO } from './dtos/user.login.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/register')
  async AddUser(@Body() userData: UserRegisterDTO) {
    const result = await this.usersService.userRegister(userData);
    return result;
  }

  @Post('/login')
  async LoginUser(@Body() userData: UserLoginDTO) {
    const result = await this.usersService.userLogin(userData);
    if (result) {
      return 'Пользователь зареган';
    } else {
      return 'НЕМА!';
    }
  }
}
