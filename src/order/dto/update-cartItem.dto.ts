import {IsNotEmpty, IsNumber} from "class-validator";
import {Type} from "class-transformer";
import { Product } from "../../product/schema/product.schema";

export class UpdateCartItemDTO {
  @IsNotEmpty()
  @Type(() => Product)
  product: Product

  @IsNumber()
  @IsNotEmpty()
  count: number
}
