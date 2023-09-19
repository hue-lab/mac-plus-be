import {StateColor} from "../../enums/stateColor.enum";
import {IsEnum, IsNotEmpty, IsOptional, IsString} from "class-validator";

export class OrderStateDTO {
  @IsString()
  @IsNotEmpty()
  label: string;

  @IsEnum(StateColor)
  @IsNotEmpty()
  color: StateColor;

  @IsOptional()
  @IsString()
  description?: string;
}
