import {Body, Controller, Delete, Get, NotFoundException, Param, Post, Put, UseGuards} from "@nestjs/common";
import {RolesGuard} from "../../auth/guards/roles.guard";
import {JwtAuthGuard} from "../../auth/guards/jwt.guard";
import {Role} from "../../auth/enums/role.enum";
import {Roles} from "../../auth/decorators/roles.decorator";
import {IdValidationPipe} from "../../helpers/pipes/idValidation.pipe";
import {OrderStateService} from "./orderState.service";
import {OrderState} from "./schema/orderState.schema";
import {OrderStateDTO} from "./dto/orderState.dto";

@Controller('store/')
export class OrderStateController {
  constructor(private orderStateService: OrderStateService) {}

  @Get('order-state')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async getDeliveryMethods(): Promise<OrderState[]> {
    return this.orderStateService.getOrderStates()
  }

  @Get('order-state/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async getOrderStateById(@Param('id', IdValidationPipe) id: string): Promise<OrderState> {
    const orderState = await this.orderStateService.getOrderStateById(id)
    if (!orderState) throw new NotFoundException('OrderState does not exist!')
    return orderState
  }

  @Post('order-state')
  async addOrderState(@Body() orderStateDTO: OrderStateDTO): Promise<OrderState> {
    return this.orderStateService.addOrderState(orderStateDTO)
  }

  @Put('order-state/:id')
  async updateOrderState(@Param('id', IdValidationPipe) id: string, @Body() orderStateDTO: OrderStateDTO): Promise<OrderState> {
    const orderState = await this.orderStateService.updateOrderState(id, orderStateDTO)
    if (!orderState) throw new NotFoundException('OrderState does not exist!')
    return orderState
  }

  @Delete('order-state/:id')
  async deleteOrderState(@Param('id', IdValidationPipe) id: string): Promise<OrderState> {
    const orderState = await this.orderStateService.deleteOrderState(id)
    if (!orderState) throw new NotFoundException('OrderState does not exist!')
    return orderState
  }
}
