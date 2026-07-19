import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class DeliveryMethodFieldValueDTO {
  @IsNotEmpty()
  @IsString()
  @MaxLength(120)
  name: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  value: string;
}
