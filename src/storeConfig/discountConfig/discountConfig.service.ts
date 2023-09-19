import { Injectable } from '@nestjs/common';
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import {DiscountConfig} from "./schema/discountConfig.schema";
import {DiscountConfigDTO} from "./dto/discountConfig.dto";

@Injectable()
export class DiscountConfigService {
  constructor(@InjectModel('DiscountConfig') private readonly discountConfigModel: Model<DiscountConfig>) {}

  async isDiscountConfigExist() {
    const config = await this.getDiscountConfig()
    if (config) return
    return this.createDefaultDiscountConfig()
  }

  async getDiscountConfig(): Promise<DiscountConfig> {
    return this.discountConfigModel.findOne().exec()
  }

  async createDefaultDiscountConfig(): Promise<DiscountConfig> {
    const defaultDiscountConfig: DiscountConfigDTO = {
      minCount: 1,
      discount: 0,
      fixPriceMinCount: null,
      fixPrice: null,
      fixPriceCategories: null
    }
    const discountConfig = await this.discountConfigModel.create(defaultDiscountConfig)
    return discountConfig.save()
  }

  async updateDiscountConfig(id: string, discountConfigDTO: DiscountConfigDTO): Promise<DiscountConfig> {
    return this.discountConfigModel.findByIdAndUpdate(id, discountConfigDTO, {new: true})
  }
}
