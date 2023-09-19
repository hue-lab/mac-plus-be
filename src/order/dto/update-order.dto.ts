import {PaymentMethod} from "../paymentMethod/schema/paymentMethod.schema";
import {OrderHistoryItem} from "../schema/orderHistoryItem.schema";
import {IsArray, IsNotEmpty, IsOptional, IsString, ValidateNested} from "class-validator";
import {Type} from "class-transformer";
import {CustomerDTO} from "./customer.dto";
import {OrderStateDTO} from "../orderState/dto/orderState.dto";
import {DeliveryDTO} from "./delivery.dto";
import {UpdateCartItemDTO} from "./update-cartItem.dto";

export class UpdateOrderDTO {
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
  @Type(() => UpdateCartItemDTO)
  cartItems: UpdateCartItemDTO[];

  subTotalPrice: number;

  totalPrice: number;

  totalDiscount: number;

  @IsArray()
  @ValidateNested()
  @Type(() => OrderHistoryItem)
  historyList: OrderHistoryItem[]
}
