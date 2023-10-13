import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsOptional()
  parent?: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  handle: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsString({ each: true })
  media: string[];

  @IsString()
  icon: string;

  @IsOptional()
  @IsString()
  productTypeId?: string;

  @IsOptional()
  @IsBoolean()
  root?: boolean;
}
