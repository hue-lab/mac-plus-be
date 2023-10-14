import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class DeliveryMethodDTO {
  _id: string;

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
