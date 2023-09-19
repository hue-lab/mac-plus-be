import {DeliveryMethodDTO} from "../deliveryMethod/dto/deliveryMethod.dto";
import {IsArray, IsNotEmpty, IsOptional, IsString, ValidateNested} from "class-validator";
import {Type} from "class-transformer";
import {DeliveryMethodFieldValueDTO} from "./DeliveryMethodFieldValue.dto";

export class DeliveryDTO {
  @ValidateNested()
  @Type(() => DeliveryMethodDTO)
  @IsNotEmpty()
  deliveryMethod: DeliveryMethodDTO;

  @IsString()
  @IsNotEmpty()
  deliveryAddress: string;

  @ValidateNested()
  @Type(() => DeliveryMethodFieldValueDTO)
  @IsArray()
  @IsNotEmpty()
  deliveryData: DeliveryMethodFieldValueDTO[];

  @IsOptional()
  @IsString()
  comment?: string;
}
