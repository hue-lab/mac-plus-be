import { Injectable } from '@nestjs/common';
import { DiscountConfigService } from './discountConfig/discountConfig.service';
import { CurrencyConfigService } from './currencyConfig/currencyConfig.service';

@Injectable()
export class StoreConfigService {
  constructor(
    private readonly discountConfigService: DiscountConfigService,
    private readonly currencyConfigService: CurrencyConfigService,
  ) {
    this.discountConfigService.isDiscountConfigExist();
    this.currencyConfigService.isCurrencyConfigExist();
  }
}
