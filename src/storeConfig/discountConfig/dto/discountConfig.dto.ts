import {IsArray, IsNotEmpty, IsNumber, IsOptional, IsString} from "class-validator";

export class DiscountConfigDTO {
  @IsNumber()
  @IsNotEmpty()
  minCount: number;

  @IsNumber()
  @IsNotEmpty()
  discount: number;

  @IsNumber()
  @IsOptional()
  fixPriceMinCount?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  fixPriceCategories?: string[];

  @IsNumber()
  @IsOptional()
  fixPrice?: number;
}
