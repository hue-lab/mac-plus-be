import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CurrencyConfig } from './schema/currencyConfig.schema';
import { CurrencyConfigDTO } from './dto/currencyConfig.dto';
import { ProductService } from '../../product/product.service';

@Injectable()
export class CurrencyConfigService {
  constructor(
    @InjectModel('CurrencyConfig')
    private readonly currencyConfigModel: Model<CurrencyConfig>,
    private readonly productService: ProductService,
  ) {}

  async isCurrencyConfigExist() {
    const config = await this.getCurrencyConfig();
    if (config) return;
    return this.createDefaultCurrencyConfig();
  }

  async getCurrencyConfig(): Promise<CurrencyConfig> {
    return this.currencyConfigModel.findOne().exec();
  }

  async createDefaultCurrencyConfig(): Promise<CurrencyConfig> {
    const defaultCurrencyConfig: CurrencyConfigDTO = {
      currency: 1,
    };
    const currencyConfig = await this.currencyConfigModel.create(
      defaultCurrencyConfig,
    );
    return currencyConfig.save();
  }

  async updateCurrencyConfig(
    id: string,
    currencyConfigDTO: CurrencyConfigDTO,
  ): Promise<CurrencyConfig> {
    const currencyConfig = await this.currencyConfigModel.findByIdAndUpdate(
      id,
      currencyConfigDTO,
      {
        new: true,
      },
    );
    if (currencyConfig) {
      await this.productService.updateProductsPrice(currencyConfig.currency);
    }
    return currencyConfig;
  }
}
