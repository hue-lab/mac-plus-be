import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StoreConfigService } from './storeConfig.service';
import { StoreConfigController } from './storeConfig.controller';
import { DiscountConfigService } from './discountConfig/discountConfig.service';
import { DiscountConfigSchema } from './discountConfig/schema/discountConfig.schema';
import { CurrencyConfigSchema } from './currencyConfig/schema/currencyConfig.schema';
import { CurrencyConfigService } from './currencyConfig/currencyConfig.service';
import { ProductModule } from '../product/product.module';

@Global()
@Module({
  providers: [StoreConfigService, DiscountConfigService, CurrencyConfigService],
  controllers: [StoreConfigController],
  imports: [
    MongooseModule.forFeature([
      { name: 'DiscountConfig', schema: DiscountConfigSchema },
      { name: 'CurrencyConfig', schema: CurrencyConfigSchema },
    ]),
    ProductModule,
  ],
  exports: [DiscountConfigService, StoreConfigService, CurrencyConfigService],
})
export class StoreConfigModule {}
