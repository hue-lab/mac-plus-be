import { Controller, Post, Body, Request, Delete, NotFoundException, Param } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartItemDto } from './dto/cartItem.dto';

@Controller('cart')
export class CartController {
  constructor(private cartService: CartService) { }

  // @Post('/')
  // async addItemToCart(@Request() req, @Body() itemDTO: CartItemDto) {
  //   const userId = req.user.userId;
  //   const cart = await this.cartService.addItemToCart(userId, itemDTO);
  //   return cart;
  // }
  //
  // @Delete('/')
  // async removeItemFromCart(@Request() req, @Body() { productId }) {
  //   const userId = req.user.userId;
  //   const cart = await this.cartService.removeItemFromCart(userId, productId);
  //   if (!cart) throw new NotFoundException('Item does not exist');
  //   return cart;
  // }
  //
  // @Delete('/:id')
  // async deleteCart(@Param('id') userId: string) {
  //   const cart = await this.cartService.deleteCart(userId);
  //   if (!cart) throw new NotFoundException('Cart does not exist');
  //   return cart;
  // }
}
