// src/content/dto/create-content.dto.ts
export class CreateContentDto {
  typeId: string;
  title: string;
  description?: string;
  fileUrl?: string;
  thumbnailUrl?: string;
  author?: string;
  publishedAt?: Date;
  categoryId?: string;
  content?: string;
}

// src/content/dto/update-content.dto.ts
export class UpdateContentDto {
  typeId?: string; // <-- Added this line
  title?: string;
  description?: string;
  fileUrl?: string;
  thumbnailUrl?: string;
  author?: string;
  publishedAt?: Date;
  categoryId?: string;
  content?: string;
}
