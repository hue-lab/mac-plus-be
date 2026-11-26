import { ArrayUnique, IsArray, IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ProductTypeDTO {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsArray()
  properties: string[];

  @IsOptional()
  @IsMongoId()
  canonicalColorProperty?: string | null;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsMongoId({ each: true })
  canonicalVariantProperties?: string[];
}
