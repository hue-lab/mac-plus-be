import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';

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

  @IsNumber()
  @IsNotEmpty()
  deliveryPrice: number;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  paymentMethods: string[];
}
