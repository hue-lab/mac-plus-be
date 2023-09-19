import {IsNotEmpty, IsString} from "class-validator";

export class PaymentMethodDTO {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;
}
