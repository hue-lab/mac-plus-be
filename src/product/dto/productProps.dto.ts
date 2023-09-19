import {IsNotEmpty, IsString, Validate} from "class-validator";
import {IsMixedType} from "../../helpers/pipes/isMixedType";

export class ProductPropsDTO {
  @IsNotEmpty()
  @IsString()
  productTypePropertyId: string;

  @IsNotEmpty()
  @Validate(IsMixedType)
  value: string | string[] | number | boolean;
}
