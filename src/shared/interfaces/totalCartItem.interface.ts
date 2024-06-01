import { CartItem } from "../../cart/schema/cartItem.schema";
import { IProduct } from "./total.interface";

export interface TotalCartItem extends CartItem {
  product?: IProduct
}
