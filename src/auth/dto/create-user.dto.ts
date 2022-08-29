import {
  IsEmail,
  isString,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;
  @IsString()
  @MinLength(8)
  @MaxLength(40)
  password: string;
  @IsString()
  @MinLength(4)
  fullName: string;
}
