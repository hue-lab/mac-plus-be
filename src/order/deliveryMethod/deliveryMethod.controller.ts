import {Body, Controller, Delete, Get, NotFoundException, Param, Post, Put, UseGuards} from "@nestjs/common"
import { Roles } from "src/auth/decorators/roles.decorator";
import { Role } from "src/auth/enums/role.enum";
import { JwtAuthGuard } from "src/auth/guards/jwt.guard";
import { RolesGuard } from "src/auth/guards/roles.guard";
import {DeliveryMethod} from "./schema/deliveryMethod.schema";
import {IdValidationPipe} from "../../helpers/pipes/idValidation.pipe";
import {DeliveryMethodDTO} from "./dto/deliveryMethod.dto";
import {DeliveryMethodService} from "./deliveryMethod.service";


@Controller('store/')
export class DeliveryMethodController {
  constructor(private deliveryMethodService: DeliveryMethodService) {}

  @Get('/delivery-method')
  async getDeliveryMethods(): Promise<DeliveryMethod[]> {
    return this.deliveryMethodService.getDeliveryMethods()
  }

  @Get('/delivery-method/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async getDeliveryMethodById(@Param('id', IdValidationPipe) id: string) {
    const deliveryMethod = await this.deliveryMethodService.getDeliveryMethodById(id)
    if (!deliveryMethod) throw new NotFoundException('DeliveryMethod does not exist!')
    return deliveryMethod
  }

  @Post('delivery-method')
  async addDeliveryMethod(@Body() deliveryMethodDTO: DeliveryMethodDTO): Promise<DeliveryMethod> {
    return this.deliveryMethodService.addDeliveryMethod(deliveryMethodDTO)
  }

  @Put('delivery-method/:id')
  async updateDeliveryMethod(@Param('id', IdValidationPipe) id: string, @Body() deliveryMethodDTO: DeliveryMethodDTO): Promise<DeliveryMethod> {
    const deliveryMethod = await this.deliveryMethodService.updateDeliveryMethod(id, deliveryMethodDTO)
    if (!deliveryMethod) throw new NotFoundException('DeliveryMethod does not exist!')
    return deliveryMethod
  }

  @Delete('delivery-method/:id')
  async deleteDeliveryMethod(@Param('id', IdValidationPipe) id: string): Promise<DeliveryMethod> {
    const deliveryMethod = await this.deliveryMethodService.deleteDeliveryMethod(id)
    if (!deliveryMethod) throw new NotFoundException('DeliveryMethod does not exist!')
    return deliveryMethod
  }
}
