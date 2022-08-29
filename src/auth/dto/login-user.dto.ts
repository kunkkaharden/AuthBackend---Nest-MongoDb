import {
  IsEmail,
  isString,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class LoginUserDto {
  @IsEmail()
  email: string;
  @IsString()
  @MinLength(8)
  @MaxLength(40)
  password: string;
}
