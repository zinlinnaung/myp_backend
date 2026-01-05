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
    return this.prisma.auth.user.create({ data: dto });
  }

  async findAllUsers() {
    return this.prisma.auth.user.findMany({
      include: { refreshTokens: true, otpSessions: true },
    });
  }

  async findUserById(id: string) {
    const user = await this.prisma.auth.user.findUnique({
      where: { id },
      include: { refreshTokens: true, otpSessions: true },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateUser(id: string, dto: UpdateAuthUserDto) {
    await this.findUserById(id);
    return this.prisma.auth.user.update({ where: { id }, data: dto });
  }

  async removeUser(id: string) {
    await this.findUserById(id);
    return this.prisma.auth.user.delete({ where: { id } });
  }

  async login(email: string, pass: string) {
    // 1. Fetch user with deeply nested Instructor -> Roles
    const user = await this.prisma.auth.user.findUnique({
      where: { email },
      include: {
        instructor: {
          include: {
            roles: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // 2. Compare plain text password with BCrypt hash
    const isPasswordValid = await bcrypt.compare(pass, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // 3. Return the user and a token
    // In a real app, generate a JWT here. For now, we return the user object.
    return {
      api_token: `secret-token-${user.id}`,
      user: user,
    };
  }

  // Additional methods can be added for RefreshToken and OtpSession
}
