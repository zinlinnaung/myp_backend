import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';

// Import each generated Prisma client
import { PrismaClient as AuthClient } from '../../generated/auth';
import { PrismaClient as UserClient } from '../../generated/user';
import { PrismaClient as CourseClient } from '../../generated/course';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  auth = new AuthClient();
  user = new UserClient();
  course = new CourseClient();
    upload: any;

  async onModuleInit() {
    await this.auth.$connect();
    await this.user.$connect();
    await this.course.$connect();
  }

  async onModuleDestroy() {
    await this.auth.$disconnect();
    await this.user.$disconnect();
    await this.course.$disconnect();
  }
}
