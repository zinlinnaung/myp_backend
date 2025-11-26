import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAuthUserDto, UpdateAuthUserDto } from './dto/auth.dto';

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

  // Additional methods can be added for RefreshToken and OtpSession
}
