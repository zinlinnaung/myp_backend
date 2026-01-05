// instructors.service.ts
import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Instructor } from 'generated/auth';
import { CreateInstructorDto, UpdateInstructorDto } from './dto/instructor.dto';

@Injectable()
export class InstructorsService {
  constructor(private prisma: PrismaService) {}

  async createInstructor(data: CreateInstructorDto): Promise<Instructor> {
    // 1. Check if this User already has an Instructor profile
    const existing = await this.prisma.auth.instructor.findUnique({
      where: { userId: data.userId },
    });

    if (existing) {
      throw new ConflictException(
        'This user is already registered as an instructor',
      );
    }

    // 2. Create Instructor and connect relations
    return this.prisma.auth.instructor.create({
      data: {
        fullName: data.fullName,
        bio: data.bio,
        user: {
          connect: { id: data.userId },
        },
        // Connect roles if provided
        roles: data.roleIds
          ? {
              connect: data.roleIds.map((id) => ({ id })),
            }
          : undefined,
      },
      include: {
        roles: true, // Return the roles in the response
      },
    });
  }

  async findAllInstructors(): Promise<Instructor[]> {
    return this.prisma.auth.instructor.findMany({
      include: {
        user: {
          select: { email: true, username: true, isActive: true }, // Select only safe fields
        },
        roles: true,
      },
    });
  }

  async findOneInstructor(id: string): Promise<Instructor> {
    const instructor = await this.prisma.auth.instructor.findUnique({
      where: { id },
      include: {
        user: {
          select: { email: true, username: true, phone: true, isActive: true },
        },
        roles: true,
      },
    });

    if (!instructor) {
      throw new NotFoundException(`Instructor with ID ${id} not found`);
    }

    return instructor;
  }

  async updateInstructor(
    id: string,
    data: UpdateInstructorDto,
  ): Promise<Instructor> {
    try {
      return await this.prisma.auth.instructor.update({
        where: { id },
        data: {
          fullName: data.fullName,
          bio: data.bio,
          // Relation update logic
          roles: data.roleIds
            ? {
                set: data.roleIds.map((roleId) => ({ id: roleId })), // 'set' replaces all existing roles with this new list
              }
            : undefined,
        },
        include: {
          roles: true,
        },
      });
    } catch (error) {
      // Prisma throws code P2025 if record not found
      throw new NotFoundException(`Instructor with ID ${id} not found`);
    }
  }

  async deleteInstructor(id: string): Promise<void> {
    try {
      await this.prisma.auth.instructor.delete({ where: { id } });
    } catch (error) {
      throw new NotFoundException(`Instructor with ID ${id} not found`);
    }
  }
}
