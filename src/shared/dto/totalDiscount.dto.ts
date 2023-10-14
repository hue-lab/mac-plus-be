import { CartItem } from '../../cart/schema/cartItem.schema';

export class TotalDiscountDTO {
  products: CartItem[];
  deliveryMethod: string;
}
