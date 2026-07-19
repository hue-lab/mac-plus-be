import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class PaymentMethodDTO {
  @IsOptional()
  @IsMongoId()
  _id?: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;
}
