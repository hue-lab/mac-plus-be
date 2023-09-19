import {IsNotEmpty, IsString} from "class-validator";

export class DeliveryMethodFieldValueDTO {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  value: string;
}
