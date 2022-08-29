import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}
  async create(createUserDtoDto: CreateUserDto) {
    try {
      const { password, ...userData } = createUserDtoDto;
      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10),
      });
      await this.userRepository.save(user);
      return { ...user, token: this.getJwt({ id: user.id }) };
    } catch (error) {
      this.handleException(error);
    }
  }

  async login(loginUserDto: LoginUserDto) {
    const { password, email } = loginUserDto;
    const user = await this.userRepository.findOne({
      where: { email },
      select: { email: true, password: true, id: true },
    });
    if (!user) {
      throw new UnauthorizedException('Credentials are not valid');
    }
    if (!bcrypt.compareSync(password, user.password)) {
      throw new UnauthorizedException('Credentials are not valid');
    }

    return { ...user, token: this.getJwt({ id: user.id }) };
  }
  checkAuthStatus(user: User) {
    return { ...user, token: this.getJwt({ id: user.id }) };
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateUserDtoDto: UpdateUserDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
  private handleException(error: any) {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }
    console.log(error);
    throw new InternalServerErrorException('Error -> check server logs');
  }
  private getJwt(payload: JwtPayload) {
    return this.jwtService.sign(payload);
  }
}
