import { IsNotEmpty, IsNumber } from 'class-validator';

export class CurrencyConfigDTO {
  @IsNumber()
  @IsNotEmpty()
  currency: number;
}
