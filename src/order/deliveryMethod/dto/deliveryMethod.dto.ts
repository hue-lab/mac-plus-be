import {IsArray, IsNotEmpty, IsString} from "class-validator";

export class DeliveryMethodDTO {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  fields: string[];

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  paymentMethods: string[];
}
