import {IsNotEmpty, IsOptional, IsString} from "class-validator";

export class BrandDTO {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  origin: string;
}
