import {Body, Controller, Delete, Get, NotFoundException, Param, Post, Put, UseGuards} from '@nestjs/common';
import {OrderService} from "./order.service";
import {JwtAuthGuard} from "../auth/guards/jwt.guard";
import {RolesGuard} from "../auth/guards/roles.guard";
import {Roles} from "../auth/decorators/roles.decorator";
import {Order} from "./schema/order.schema";
import {Role} from "../auth/enums/role.enum";
import {IdValidationPipe} from "../helpers/pipes/idValidation.pipe";
import {CreateOrderDTO} from "./dto/create-order.dto";
import {UpdateOrderDTO} from "./dto/update-order.dto";
import {GetOrdersDTO} from "./dto/get-orders.dto";

@Controller('store/')
export class OrderController {
  constructor(private orderService: OrderService) {}

  @Post('/orders')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async getOrders(@Body() getOrdersDTO: GetOrdersDTO): Promise<Order[]> {
    return this.orderService.getOrders(getOrdersDTO)
  }

  @Get('/order/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async getOrderById(@Param('id', IdValidationPipe) id: string): Promise<Order> {
    const order = await this.orderService.getOrderById(id)
    if (!order) throw new NotFoundException('Order does not exist!')
    return order
  }

  @Get('order/tracking/:code')
  async getTrackingStatus(@Param('code') code: string): Promise<Order> {
    const order = await this.orderService.getTrackingStatus(code)
    if (!order) throw new NotFoundException('Order does not exist!')
    return order
  }

  @Post('order')
  async addOrder(@Body() createOrderDTO: CreateOrderDTO): Promise<Order> {
    return this.orderService.addOrder(createOrderDTO)
  }

  @Put('order/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async updateOrder(@Param('id', IdValidationPipe) id: string, @Body() updateOrderDTO: UpdateOrderDTO): Promise<Order> {
    const order = await this.orderService.updateOrder(id, updateOrderDTO)
    if (!order) throw new NotFoundException('Order does not exist!')
    return order
  }

  @Delete('order/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async deleteOrder(@Param('id', IdValidationPipe) id: string): Promise<Order> {
    const order = await this.orderService.deleteOrder(id)
    if (!order) throw new NotFoundException('Order does not exist!')
    return order
  }
}
