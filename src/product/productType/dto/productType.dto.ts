import {IsArray, IsNotEmpty, IsOptional, IsString} from "class-validator";

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
}
