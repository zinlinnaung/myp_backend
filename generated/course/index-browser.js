
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.14.0
 * Query Engine version: e9771e62de70f79a5e1c604a2d7c8e2a0a874b48
 */
Prisma.prismaVersion = {
  client: "5.14.0",
  engine: "e9771e62de70f79a5e1c604a2d7c8e2a0a874b48"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}

/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.PostScalarFieldEnum = {
  id: 'id',
  title: 'title',
  content: 'content',
  excerpt: 'excerpt',
  slug: 'slug',
  published: 'published',
  authorId: 'authorId',
  tags: 'tags',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  publishedAt: 'publishedAt'
};

exports.Prisma.PostEventScalarFieldEnum = {
  id: 'id',
  postId: 'postId',
  eventType: 'eventType',
  authorId: 'authorId',
  eventData: 'eventData',
  createdAt: 'createdAt'
};

exports.Prisma.PostViewScalarFieldEnum = {
  id: 'id',
  postId: 'postId',
  viewerId: 'viewerId',
  ipAddress: 'ipAddress',
  userAgent: 'userAgent',
  createdAt: 'createdAt'
};

exports.Prisma.HomeSliderScalarFieldEnum = {
  id: 'id',
  image: 'image',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  websiteImage: 'websiteImage'
};

exports.Prisma.CategoryScalarFieldEnum = {
  id: 'id',
  name: 'name',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  isDeleted: 'isDeleted',
  type: 'type',
  image: 'image'
};

exports.Prisma.SubCategoryScalarFieldEnum = {
  id: 'id',
  name: 'name',
  categoryId: 'categoryId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  isDeleted: 'isDeleted'
};

exports.Prisma.HomeCategoryScalarFieldEnum = {
  id: 'id',
  name: 'name',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  isDeleted: 'isDeleted'
};

exports.Prisma.HomeCategoryItemScalarFieldEnum = {
  id: 'id',
  homeCategoryId: 'homeCategoryId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  type: 'type',
  courseId: 'courseId',
  isDeleted: 'isDeleted',
  course2Id: 'course2Id'
};

exports.Prisma.CourseScalarFieldEnum = {
  name: 'name',
  image: 'image',
  enrolledCount: 'enrolledCount',
  date: 'date',
  categoryId: 'categoryId',
  subCategoryId: 'subCategoryId',
  isDeleted: 'isDeleted',
  createdAt: 'createdAt',
  description: 'description',
  duration: 'duration',
  parentCourseId: 'parentCourseId',
  updatedAt: 'updatedAt',
  videoCount: 'videoCount',
  id: 'id',
  rating: 'rating',
  previewImage: 'previewImage',
  previewVideo: 'previewVideo',
  createdBy: 'createdBy',
  updatedBy: 'updatedBy'
};

exports.Prisma.UserOnCourseScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  courseId: 'courseId',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  certificate: 'certificate',
  completedPercentage: 'completedPercentage',
  course2Id: 'course2Id'
};

exports.Prisma.CourseSectionScalarFieldEnum = {
  id: 'id',
  title: 'title',
  description: 'description',
  courseId: 'courseId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  order: 'order',
  isDeleted: 'isDeleted',
  course2Id: 'course2Id'
};

exports.Prisma.ActivityScalarFieldEnum = {
  id: 'id',
  title: 'title',
  type: 'type',
  content: 'content',
  order: 'order',
  sectionId: 'sectionId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  description: 'description',
  isDeleted: 'isDeleted'
};

exports.Prisma.ReviewScalarFieldEnum = {
  id: 'id',
  courseId: 'courseId',
  userId: 'userId',
  text: 'text',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  course2Id: 'course2Id'
};

exports.Prisma.RatingScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  courseId: 'courseId',
  rating: 'rating',
  comment: 'comment',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  course2Id: 'course2Id'
};

exports.Prisma.FaqScalarFieldEnum = {
  id: 'id',
  question: 'question',
  answer: 'answer',
  isDeleted: 'isDeleted',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ContentTypeScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ContentScalarFieldEnum = {
  id: 'id',
  typeId: 'typeId',
  title: 'title',
  description: 'description',
  fileUrl: 'fileUrl',
  thumbnailUrl: 'thumbnailUrl',
  author: 'author',
  publishedAt: 'publishedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  categoryId: 'categoryId',
  content: 'content'
};

exports.Prisma.NewAndEventsScalarFieldEnum = {
  id: 'id',
  title: 'title',
  image: 'image',
  description: 'description',
  date: 'date',
  time: 'time',
  isDeleted: 'isDeleted',
  created_at: 'created_at',
  updated_at: 'updated_at',
  location: 'location'
};

exports.Prisma.CertificateScalarFieldEnum = {
  id: 'id',
  name: 'name',
  created_at: 'created_at',
  updated_at: 'updated_at',
  courseId: 'courseId',
  course2Id: 'course2Id'
};

exports.Prisma.FeedbackScalarFieldEnum = {
  id: 'id',
  text: 'text',
  created_at: 'created_at',
  updated_at: 'updated_at',
  courseId: 'courseId',
  course2Id: 'course2Id'
};

exports.Prisma.UserOnActivityScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  time: 'time',
  created_at: 'created_at',
  updated_at: 'updated_at',
  activityId: 'activityId'
};

exports.Prisma.UserOnSectionScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  sectionId: 'sectionId',
  time: 'time',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.Certificate_templatesScalarFieldEnum = {
  id: 'id',
  name: 'name',
  backgroundImage: 'backgroundImage',
  components: 'components',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.Course2ScalarFieldEnum = {
  id: 'id',
  image: 'image',
  name: 'name',
  description: 'description',
  duration: 'duration',
  videoCount: 'videoCount',
  enrolledCount: 'enrolledCount',
  isDeleted: 'isDeleted',
  rating: 'rating',
  date: 'date',
  parentCourseId: 'parentCourseId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  categoryId: 'categoryId',
  subCategoryId: 'subCategoryId',
  previewImage: 'previewImage',
  previewVideo: 'previewVideo',
  createdBy: 'createdBy',
  updatedBy: 'updatedBy'
};

exports.Prisma.Feedback_templatesScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  content: 'content',
  isDeleted: 'isDeleted',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.JsonNullValueInput = {
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};
exports.CategoryType = exports.$Enums.CategoryType = {
  NORMAL: 'NORMAL',
  FEATURE: 'FEATURE',
  CATEGORY_ONLY: 'CATEGORY_ONLY'
};

exports.CourseType = exports.$Enums.CourseType = {
  NORMAL: 'NORMAL',
  FEATURE: 'FEATURE'
};

exports.CourseStatus = exports.$Enums.CourseStatus = {
  IN_PROGRESS: 'IN_PROGRESS',
  DONE: 'DONE'
};

exports.ActivityType = exports.$Enums.ActivityType = {
  PDF_FILE: 'PDF_FILE',
  VIDEO_FILE: 'VIDEO_FILE',
  H5P: 'H5P',
  WEB_URL: 'WEB_URL',
  YOUTUBE_LINK: 'YOUTUBE_LINK',
  PAGE: 'PAGE',
  CERTIFICATE: 'CERTIFICATE',
  FEEDBACK: 'FEEDBACK',
  FORUM: 'FORUM',
  QUIZ: 'QUIZ',
  SCORM: 'SCORM',
  LESSON: 'LESSON',
  CHOICE: 'CHOICE',
  RESOURCE: 'RESOURCE',
  ASSIGN: 'ASSIGN'
};

exports.Prisma.ModelName = {
  Post: 'Post',
  PostEvent: 'PostEvent',
  PostView: 'PostView',
  HomeSlider: 'HomeSlider',
  Category: 'Category',
  SubCategory: 'SubCategory',
  HomeCategory: 'HomeCategory',
  HomeCategoryItem: 'HomeCategoryItem',
  Course: 'Course',
  UserOnCourse: 'UserOnCourse',
  CourseSection: 'CourseSection',
  Activity: 'Activity',
  Review: 'Review',
  Rating: 'Rating',
  Faq: 'Faq',
  ContentType: 'ContentType',
  Content: 'Content',
  newAndEvents: 'newAndEvents',
  certificate: 'certificate',
  feedback: 'feedback',
  userOnActivity: 'userOnActivity',
  userOnSection: 'userOnSection',
  certificate_templates: 'certificate_templates',
  course2: 'course2',
  feedback_templates: 'feedback_templates'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
