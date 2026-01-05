import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAuthUserDto, UpdateAuthUserDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  // User CRUD
  async createUser(dto: CreateAuthUserDto) {
    const { password, ...userData } = dto;

    // 1. Generate salt and hash the password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 2. Save to database
    return this.prisma.auth.user.create({
      data: {
        ...userData,
        password: hashedPassword,
      },
    });
  }

  async findAllUsers() {
    return this.prisma.auth.user.findMany({
      include: { refreshTokens: true, otpSessions: true },
    });
  }

  // async findUserById(id: string) {
  //   const user = await this.prisma.auth.user.findUnique({
  //     where: { id },
  //     include: { refreshTokens: true, otpSessions: true },
  //   });
  //   if (!user) throw new NotFoundException('User not found');
  //   return user;
  // }

  async updateUser(id: string, dto: UpdateAuthUserDto) {
    await this.findUserById(id);
    return this.prisma.auth.user.update({ where: { id }, data: dto });
  }

  async removeUser(id: string) {
    await this.findUserById(id);
    return this.prisma.auth.user.delete({ where: { id } });
  }

  private get userInclude() {
    return {
      instructor: {
        include: {
          roles: true,
        },
      },
    };
  }

  async findUserById(id: string) {
    const user = await this.prisma.auth.user.findUnique({
      where: { id },
      include: this.userInclude, // Now includes Instructor and Roles
    });
    if (!user) throw new NotFoundException('User not found');

    const { password, ...result } = user;
    return result;
  }

  async login(email: string, pass: string) {
    const user = await this.prisma.auth.user.findUnique({
      where: { email },
      include: this.userInclude,
    });

    if (!user) throw new UnauthorizedException('Invalid user');

    const isMatch = pass === user.password;
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    const { password, ...safeUser } = user;
    return {
      api_token: `secret-token-${user.id}`, // In production, use JWT
      user: safeUser,
    };
  }

  // Additional methods can be added for RefreshToken and OtpSession
}
