import { IsEmail, IsString, MinLength } from 'class-validator';

export class UserLoginDTO {
  @IsEmail({}, { message: 'Не верно указан Email' })
  email: string;

  @IsString({ message: 'Неверно указан пароль' })
  @MinLength(3)
  password: string;
}
