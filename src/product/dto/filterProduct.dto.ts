import { BasePropertyName, ComparisonOperator } from "../enums/product.enum";
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class GetProductsSortDTO {
  @IsEnum(BasePropertyName)
  property: BasePropertyName;

  @IsOptional()
  @IsNumber()
  direction?: -1 | 1;
}

export class GetProductsPaginationDTO {
  @IsNumber()
  page: number;

  @IsNumber()
  limit: number;
}

export type  GetProductsComparison = Partial<Record<ComparisonOperator,  GetProductsComparisonValue>>;

export type  GetProductsComparisonValue = string | number | boolean | (string | number)[];

export type GetProductsBasePropertiesDTO = Partial<Record<BasePropertyName,  GetProductsComparison>>;

export type GetProductsCustomPropertiesDTO = Partial<Record<string,  GetProductsComparison>>;

export class GetProductsDTO {
  @IsString()
  @IsOptional()
  search?: string;

  @IsBoolean()
  @IsOptional()
  preview?: boolean;

  @ValidateNested()
  @Type(() => GetProductsSortDTO)
  @IsOptional()
  sort?: GetProductsSortDTO;

  @ValidateNested()
  @Type(() => GetProductsPaginationDTO)
  @IsOptional()
  pagination?: GetProductsPaginationDTO;

  @IsOptional()
  baseProperties?: GetProductsBasePropertiesDTO;

  @IsOptional()
  customProperties?: GetProductsCustomPropertiesDTO;
}
