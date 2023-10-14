import { forwardRef, Module } from '@nestjs/common';
import { CalculationController } from './calculation.controller';
import { CalculationService } from './calculation.service';
import { ProductModule } from '../product/product.module';
import { OrderModule } from '../order/order.module';

@Module({
  imports: [ProductModule, forwardRef(() => OrderModule)],
  controllers: [CalculationController],
  providers: [CalculationService],
  exports: [CalculationService],
})
export class SharedModule {}
