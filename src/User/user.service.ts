import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    // Check unique email
    if (dto.email) {
      const emailExists = await this.prisma.user.user.findFirst({
        where: { email: dto.email },
      });
      if (emailExists) {
        throw new BadRequestException('Email already exists');
      }
    }

    // Check unique username
    const usernameExists = await this.prisma.user.user.findFirst({
      where: { username: dto.username },
    });
    if (usernameExists) {
      throw new BadRequestException('Username already exists');
    }

    // Check unique phone
    if (dto.phone) {
      const phoneExists = await this.prisma.user.user.findFirst({
        where: { phone: dto.phone },
      });
      if (phoneExists) {
        throw new BadRequestException('Phone already exists');
      }
    }

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
    // make sure user exists
    await this.findOne(id);

    // check unique email
    if (dto.email) {
      const emailExists = await this.prisma.user.user.findFirst({
        where: { email: dto.email, NOT: { id } },
      });
      if (emailExists) {
        throw new BadRequestException('Email already exists');
      }
    }

    // check unique username
    if (dto.username) {
      const usernameExists = await this.prisma.user.user.findFirst({
        where: { username: dto.username, NOT: { id } },
      });
      if (usernameExists) {
        throw new BadRequestException('Username already exists');
      }
    }

    // check unique phone
    if (dto.phone) {
      const phoneExists = await this.prisma.user.user.findFirst({
        where: { phone: dto.phone, NOT: { id } },
      });
      if (phoneExists) {
        throw new BadRequestException('Phone already exists');
      }
    }

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
