// roles.service.ts
import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from 'generated/auth';
import { CreateRoleDto, UpdateRoleDto } from './role.dto';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async createRole(data: CreateRoleDto): Promise<Role> {
    const existing = await this.prisma.auth.role.findUnique({
      where: { name: data.name },
    });

    if (existing) {
      throw new ConflictException('Role name already exists');
    }

    return this.prisma.auth.role.create({ data });
  }

  async findAllRoles(): Promise<Role[]> {
    return this.prisma.auth.role.findMany({
      include: {
        _count: { select: { instructors: true } },
      },
    });
  }

  async findOneRole(id: string): Promise<Role> {
    const role = await this.prisma.auth.role.findUnique({
      where: { id },
      include: { instructors: true },
    });
    if (!role) throw new NotFoundException(`Role with ID ${id} not found`);
    return role;
  }

  async updateRole(id: string, data: UpdateRoleDto): Promise<Role> {
    try {
      return await this.prisma.auth.role.update({
        where: { id },
        data,
      });
    } catch (error) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
  }

  async deleteRole(id: string): Promise<void> {
    try {
      await this.prisma.auth.role.delete({ where: { id } });
    } catch (error) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
  }
}
