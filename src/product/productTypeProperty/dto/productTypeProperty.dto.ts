import {IsEnum, IsNotEmpty, IsOptional, IsString, Validate} from "class-validator";
import {ProductTypePropertyType} from "../../enums/productTypePropertyType.enum.";
import {IsNumberOrStringArray} from "../../../helpers/pipes/IsNumberOrStringArray";

export class ProductTypePropertyDTO {
  @IsNotEmpty()
  showCard: boolean;

  @IsNotEmpty()
  showFilter: boolean;

  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsString()
  units?: string

  @IsNotEmpty()
  @IsEnum(ProductTypePropertyType)
  type: ProductTypePropertyType

  @IsOptional()
  @Validate(IsNumberOrStringArray)
  options?: string[] | number[];
}
