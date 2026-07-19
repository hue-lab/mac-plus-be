import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CustomerDTO } from './customer.dto';
import { DeliveryDTO } from './delivery.dto';
import { PaymentMethodDTO } from '../paymentMethod/dto/paymentMethod.dto';

export class CreateOrderCartItemDTO {
  @IsMongoId()
  @IsNotEmpty()
  productId: string;

  @IsInt()
  @Min(1)
  @Max(99)
  count: number;
}

export class CreateOrderDTO {
  @ValidateNested()
  @Type(() => CustomerDTO)
  @IsNotEmpty()
  customer: CustomerDTO;

  @ValidateNested()
  @Type(() => DeliveryDTO)
  @IsNotEmpty()
  delivery: DeliveryDTO;

  @ValidateNested()
  @Type(() => PaymentMethodDTO)
  @IsNotEmpty()
  paymentMethod: PaymentMethodDTO;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested()
  @Type(() => CreateOrderCartItemDTO)
  cartItems: CreateOrderCartItemDTO[];

  @IsString()
  @IsOptional()
  website?: string;

  @IsString()
  @IsOptional()
  turnstileToken?: string;

  @IsString()
  @IsOptional()
  captchaToken?: string;

  @IsString()
  @IsOptional()
  formToken?: string;
}
