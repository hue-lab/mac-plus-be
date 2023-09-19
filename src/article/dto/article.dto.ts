import {IsArray, IsNotEmpty, IsOptional, IsString} from "class-validator";

export class ArticleDTO {
  @IsString()
  @IsNotEmpty()
  media: string;

  @IsString()
  @IsOptional()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  tags: string[];
}
