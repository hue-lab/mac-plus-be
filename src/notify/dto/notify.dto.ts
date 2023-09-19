import {CustomerDTO} from "../../order/dto/customer.dto";
import {DeliveryDTO} from "../../order/dto/delivery.dto";
import {PaymentMethod} from "../../order/paymentMethod/schema/paymentMethod.schema";

export class NotifyDTO {
  customer?: CustomerDTO;
  orderCode?: string;
  delivery?: DeliveryDTO;
  paymentMethod?: PaymentMethod;
  totalDiscount?: number;
  totalPrice?: number;
}
