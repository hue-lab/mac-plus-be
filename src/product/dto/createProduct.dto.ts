import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProductPropsDTO } from './productProps.dto';
import { SeoDTO } from '../../shared/dto/seo.dto';

export class CreateProductDTO {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  media: string[];

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsNumber()
  @IsNotEmpty()
  priceUSD: number;

  @IsNumber()
  @IsNotEmpty()
  totalPrice: number;

  @IsNumber()
  @IsNotEmpty()
  discount: number;

  @IsString()
  @IsNotEmpty()
  brand: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @IsString()
  @IsNotEmpty()
  productTypeId: string;

  @IsBoolean()
  @IsNotEmpty()
  isNew: boolean;

  @IsBoolean()
  @IsNotEmpty()
  isRec: boolean;

  @IsBoolean()
  @IsNotEmpty()
  isStock: boolean;

  @IsArray()
  @ValidateNested()
  @Type(() => ProductPropsDTO)
  productProps: ProductPropsDTO[];

  @Type(() => SeoDTO)
  seo?: SeoDTO;
}
