import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  handle: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsString({ each: true })
  keywords: string[];

  @IsArray()
  @IsString({ each: true })
  media: string[];

  @IsString()
  icon: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  children?: string[];

  @IsOptional()
  @IsString()
  productTypeId?: string;

  @IsOptional()
  @IsNumber()
  order?: number;
}
