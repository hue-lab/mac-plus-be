import { IsArray, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class UpdateCategoryDto {
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

  @IsOptional()
  @IsArray()
  @IsString({each: true})
  children?: string[];

  @IsOptional()
  @IsString()
  productTypeId?: string;
}
