import { IsEmail, IsString, MinLength } from 'class-validator';

export class UserRegisterDTO {
  @IsString()
  name: string;

  @IsEmail({}, { message: 'Не верно указан Email' })
  email: string;

  @IsString()
  @MinLength(3)
  password: string;
}
