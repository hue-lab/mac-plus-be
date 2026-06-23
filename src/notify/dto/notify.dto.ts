import { CustomerDTO } from '../../order/dto/customer.dto';
import { DeliveryDTO } from '../../order/dto/delivery.dto';
import { PaymentMethod } from '../../order/paymentMethod/schema/paymentMethod.schema';
import { IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class NotifyDTO {
  customer?: CustomerDTO;
  orderCode?: string;
  delivery?: DeliveryDTO;
  paymentMethod?: PaymentMethod;
  totalDiscount?: number;
  totalPrice?: number;
  products?: string;
}

export class NotifyMessageDTO {
  @IsOptional()
  @IsString()
  @MaxLength(1200)
  message?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(7)
  @MaxLength(30)
  @Matches(/^[+\d\s\-()]+$/)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  website?: string;

  @IsOptional()
  @IsString()
  turnstileToken?: string;

  @IsOptional()
  @IsString()
  captchaToken?: string;

  @IsOptional()
  @IsString()
  formToken?: string;
}
