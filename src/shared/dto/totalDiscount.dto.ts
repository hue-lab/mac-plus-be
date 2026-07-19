import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class TotalDiscountProductDTO {
  @IsMongoId()
  @IsNotEmpty()
  productId: string;

  @IsInt()
  @Min(1)
  @Max(99)
  count: number;
}

export class TotalDiscountDTO {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested()
  @Type(() => TotalDiscountProductDTO)
  products: TotalDiscountProductDTO[];

  @IsOptional()
  @IsMongoId()
  deliveryMethod?: string;
}
