import { IsArray, IsMongoId, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class SeoDto {
  @IsMongoId()
  @IsOptional()
  id?: string;

  @IsString()
  @IsOptional()
  title: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  keywords: string[];

  @IsString()
  @IsOptional()
  tag: string;

  @IsString()
  @IsOptional()
  content: string;

  @IsString()
  @IsNotEmpty()
  url: string;
}
