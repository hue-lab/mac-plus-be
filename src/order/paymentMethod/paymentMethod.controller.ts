import {Body, Controller, Delete, Get, NotFoundException, Param, Post, Put, UseGuards} from "@nestjs/common"
import { Roles } from "src/auth/decorators/roles.decorator";
import { Role } from "src/auth/enums/role.enum";
import { JwtAuthGuard } from "src/auth/guards/jwt.guard";
import { RolesGuard } from "src/auth/guards/roles.guard";
import {IdValidationPipe} from "../../helpers/pipes/idValidation.pipe";
import {PaymentMethodService} from "./paymentMethod.service";
import {PaymentMethod} from "./schema/paymentMethod.schema";
import {PaymentMethodDTO} from "./dto/paymentMethod.dto";


@Controller('store/')
export class PaymentMethodController {
  constructor(private paymentMethodService: PaymentMethodService) {}

  @Get('/payment-method')
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    return this.paymentMethodService.getPaymentMethods()
  }

  @Get('/payment-method/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async getPaymentMethodById(@Param('id', IdValidationPipe) id: string): Promise<PaymentMethod> {
    const paymentMethod = await this.paymentMethodService.getPaymentMethodById(id)
    if (!paymentMethod) throw new NotFoundException('PaymentMethod does not exist!')
    return paymentMethod
  }

  @Post('payment-method')
  async addPaymentMethod(@Body() paymentMethodDTO: PaymentMethodDTO): Promise<PaymentMethod> {
    return this.paymentMethodService.addPaymentMethod(paymentMethodDTO)
  }

  @Put('payment-method/:id')
  async updatePaymentMethod(@Param('id', IdValidationPipe) id: string, @Body() paymentMethodDTO: PaymentMethodDTO): Promise<PaymentMethod> {
    const paymentMethod = await this.paymentMethodService.updatePaymentMethod(id, paymentMethodDTO)
    if (!paymentMethod) throw new NotFoundException('PaymentMethod does not exist!')
    return paymentMethod
  }

  @Delete('payment-method/:id')
  async deletePaymentMethod(@Param('id', IdValidationPipe) id: string): Promise<PaymentMethod> {
    const paymentMethod = await this.paymentMethodService.deletePaymentMethod(id)
    if (!paymentMethod) throw new NotFoundException('PaymentMethod does not exist!')
    return paymentMethod
  }
}
