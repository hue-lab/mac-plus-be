import {Global, Module} from '@nestjs/common';
import { MongooseModule } from "@nestjs/mongoose";
import { StoreConfigService } from "./storeConfig.service";
import { StoreConfigController } from "./storeConfig.controller";
import { DiscountConfigService } from "./discountConfig/discountConfig.service";
import { DiscountConfigSchema } from "./discountConfig/schema/discountConfig.schema";

@Global()
@Module({
  providers: [
    StoreConfigService,
    DiscountConfigService
  ],
  controllers: [StoreConfigController],
  imports: [
    MongooseModule.forFeature([
      { name: 'DiscountConfig', schema: DiscountConfigSchema }
    ])
  ],
  exports: [
    DiscountConfigService,
    StoreConfigService
  ]
})
export class StoreConfigModule {}
