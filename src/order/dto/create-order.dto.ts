import {PaymentMethod} from "../paymentMethod/schema/paymentMethod.schema";
import {CartItem} from "../../cart/schema/cartItem.schema";
import {OrderHistoryItem} from "../schema/orderHistoryItem.schema";
import {IsArray, IsNotEmpty, IsOptional, IsString, ValidateNested} from "class-validator";
import {Type} from "class-transformer";
import {CustomerDTO} from "./customer.dto";
import {OrderStateDTO} from "../orderState/dto/orderState.dto";
import {DeliveryDTO} from "./delivery.dto";

export class CreateOrderDTO {
  @IsString()
  @IsOptional()
  orderCode?: string;

  @ValidateNested()
  @Type(() => CustomerDTO)
  @IsNotEmpty()
  customer: CustomerDTO;

  @ValidateNested()
  @Type(() => OrderStateDTO)
  @IsNotEmpty()
  state: OrderStateDTO;

  @ValidateNested()
  @Type(() => DeliveryDTO)
  @IsNotEmpty()
  delivery: DeliveryDTO;

  @ValidateNested()
  @Type(() => PaymentMethod)
  @IsNotEmpty()
  paymentMethod: PaymentMethod;

  @IsArray()
  @ValidateNested()
  @Type(() => CartItem)
  cartItems: CartItem[]

  subTotalPrice: number;

  totalPrice: number;

  totalDiscount: number;

  @IsArray()
  @ValidateNested()
  @Type(() => OrderHistoryItem)
  historyList: OrderHistoryItem[]
}
