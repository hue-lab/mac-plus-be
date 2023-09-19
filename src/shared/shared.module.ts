import { Module } from '@nestjs/common';
import {CalculationController} from "./calculation.controller";
import {CalculationService} from "./calculation.service";
import {ProductModule} from "../product/product.module";

@Module({
  imports: [ProductModule],
  controllers: [CalculationController],
  providers: [CalculationService],
  exports: [CalculationService]
})
export class SharedModule {}
