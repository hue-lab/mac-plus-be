import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import {MongooseModule} from "@nestjs/mongoose";
import {OrderSchema} from "./schema/order.schema";
import {OrderStateSchema} from "./orderState/schema/orderState.schema";
import {DeliveryMethodSchema} from "./deliveryMethod/schema/deliveryMethod.schema";
import {PaymentMethodSchema} from "./paymentMethod/schema/paymentMethod.schema";
import {OrderHistoryItemSchema} from "./schema/orderHistoryItem.schema";
import {DeliveryMethodController} from "./deliveryMethod/deliveryMethod.controller";
import {DeliveryMethodService} from "./deliveryMethod/deliveryMethod.service";
import {OrderStateController} from "./orderState/orderState.controller";
import {OrderStateService} from "./orderState/orderState.service";
import {PaymentMethodController} from "./paymentMethod/paymentMethod.controller";
import {PaymentMethodService} from "./paymentMethod/paymentMethod.service";
import {NotifyModule} from "../notify/notify.module";
import {SharedModule} from "../shared/shared.module";

@Module({
  controllers: [
    OrderController,
    DeliveryMethodController,
    OrderStateController,
    PaymentMethodController
  ],
  providers: [
    OrderService,
    DeliveryMethodService,
    OrderStateService,
    PaymentMethodService
  ],
  imports: [
    MongooseModule.forFeature([
      {name: 'Order', schema: OrderSchema},
      {name: 'OrderState', schema: OrderStateSchema},
      {name: 'OrderHistoryItem', schema: OrderHistoryItemSchema},
      {name: 'DeliveryMethod', schema: DeliveryMethodSchema},
      {name: 'PaymentMethod', schema: PaymentMethodSchema}
    ]),
    NotifyModule,
    SharedModule
  ]
})
export class OrderModule {}
