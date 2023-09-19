import { Injectable } from '@nestjs/common';
import {DiscountConfigService} from "./discountConfig/discountConfig.service";

@Injectable()
export class StoreConfigService {
  constructor(private readonly discountConfigService: DiscountConfigService) {
    this.discountConfigService.isDiscountConfigExist()
  }
}
