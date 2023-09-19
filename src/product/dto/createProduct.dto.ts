import {IsArray, IsBoolean, IsNotEmpty, IsNumber, IsString, ValidateNested} from "class-validator";
import {Type} from "class-transformer";
import {ProductPropsDTO} from "./productProps.dto";

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
}
