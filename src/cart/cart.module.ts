import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import {MongooseModule} from "@nestjs/mongoose";
import {CartSchema} from "./schema/cart.schema";
import {CartItemSchema} from "./schema/cartItem.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Cart', schema: CartSchema },
      {name: 'CartItem', schema: CartItemSchema}
    ])
  ],
  providers: [CartService],
  controllers: [CartController]
})
export class CartModule {}
