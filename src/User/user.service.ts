import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    return this.prisma.user.user.create({
      data: dto,
    });
  }

  async findAll() {
    return this.prisma.user.user.findMany();
  }

  async findOne(id: string) {
    const user = await this.prisma.user.user.findUnique({
      where: { id },
    });

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findOne(id);

    return this.prisma.user.user.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.user.user.delete({
      where: { id },
    });
  }

  async deactivate(id: string) {
    await this.findOne(id);

    return this.prisma.user.user.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
