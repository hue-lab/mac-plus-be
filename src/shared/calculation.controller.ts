import {Body, Controller, Post} from '@nestjs/common';
import {CalculationService} from "./calculation.service";
import {TotalDiscountDTO} from "./dto/totalDiscount.dto";

@Controller('calculation')
export class CalculationController {
  constructor(private readonly calculationService: CalculationService) {
  }
  @Post('discount')
  async getTotalDiscount(@Body() totalDiscountDTO: TotalDiscountDTO[]) {
    return this.calculationService.getTotalDiscount(totalDiscountDTO)
  }
}
