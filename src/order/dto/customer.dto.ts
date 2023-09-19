import {IsNotEmpty, IsString} from "class-validator";

export class CustomerDTO {
  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  name: string;
}
