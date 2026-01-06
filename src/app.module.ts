import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';

// import { ConfigModule } from '@nestjs/config';
// import { AuthenticationModule } from './authentication/authentication.module';
// import { APP_GUARD } from '@nestjs/core';
// import { AtGuard } from './common/guards/at.guard';

import { MulterModule } from '@nestjs/platform-express';
// import { CodeModule } from './code/code.module';
// import { RecordModule } from './record/record.module';
import { APP_GUARD } from '@nestjs/core';
import { UserModule } from './User/user.module';
import { CourseModule } from './Course/course.module';
import { SubCategoryModule } from './SubCategory/sub-category.module';
import { CategoryModule } from './Category/category.module';
import { AuthModule } from './Auth/auth.module';
import { HomeCategoryModule } from './HomeCategory/home-category.module';
import { HomeSliderModule } from './HomeSlider/home-slider.module';
import { MinioModule } from './Minio/minio.module';
import { CourseSectionModule } from './Course-section/course-section.module';
import { ActivityModule } from './Course-activities/activity.module';
import { ContentModule } from './E-library/content.module';
import * as multer from 'multer'; // <-- 1. IMPORT MULTER
import { CertificateTemplateModule } from './Certificate_template/certificate-templates.module';
import { FeedbackTemplateModule } from './Feedback/feedback-template.module';
import { ContentTypeModule } from './E-library/content-type.module';
import { RolesModule } from './Role/roles.module';
import { InstructorModule } from './Instructor/instructors.module';
import { UserOnCourseModule } from './User_On_Course/user-on-course.module';
// import { AtGuard } from './common/guards';
// import { AuthenticationModule } from './authentication/authentication.module';
// import { UserModule } from './user/user.module';
// import { MlcheckerModule } from './ml_checker/mlchecker.module';
// import { TelegramModule } from './telegram/telegram.module';
// import { CmsModule } from './cms/cms.module';
// import { QueueModule } from './queue/queue.module';
// import { BotModule } from './bot/bot.module';
// import { TelegramModule } from './telegram/telegram.module';
// import { FlowModule } from './flow/flow.module';
// import { EditorFlowModule } from './editor/editor.module';

@Module({
  imports: [
    // ConfigModule.forRoot({ isGlobal: true }),
    MulterModule.register({
      // 2. CHANGE DEST TO STORAGE:
      storage: multer.memoryStorage(),
      // 3. (Optional but recommended) Increase limits for large H5P files
      limits: {
        fileSize: 100 * 1024 * 1024, // Example: Increase limit to 100MB
      },
    }),
    // AuthenticationModule,
    // UserModule,
    // CodeModule,
    // RecordModule,
    PrismaModule,

    MinioModule,
    CourseModule,
    ActivityModule,
    CourseSectionModule,
    CategoryModule,
    UserModule,
    AuthModule,
    SubCategoryModule,
    HomeCategoryModule,
    ContentModule,
    ContentTypeModule,
    HomeSliderModule,
    CertificateTemplateModule,
    FeedbackTemplateModule,

    RolesModule,
    InstructorModule,
    UserOnCourseModule,

    // MlcheckerModule,
    // CmsModule,
    // BotModule,
    // QueueModule,
    // LogModule,
    // FlowModule,
    // TelegramModule,
    // EditorFlowModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
