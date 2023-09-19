import {Global, Injectable} from '@nestjs/common';
import {TotalDiscountDTO} from "./dto/totalDiscount.dto";
import {DiscountConfigService} from "../storeConfig/discountConfig/discountConfig.service";
import {ProductService} from "../product/product.service";
import mongoose from "mongoose";
import {ITotal} from "./interfaces/total.interface";

@Global()
@Injectable()
export class CalculationService {
  constructor(
    private readonly discountConfigService: DiscountConfigService,
    private readonly productService: ProductService
  ) {
  }

  async getTotalDiscount(totalDiscountDTO: TotalDiscountDTO[], isOrder = false) {
    let totalItemsCount = 0
    let fixPriceCount = 0
    let orderPrice = 0
    let fixPrice = 0

    const productIds: mongoose.Types.ObjectId[] = []
    totalDiscountDTO.forEach((query) => {
      const id = query.productId
      query.productId = new mongoose.Types.ObjectId(id)
      productIds.push(query.productId)
    })

    const discountConfig = await this.discountConfigService.getDiscountConfig()
    const products = await this.productService.getProductsByIds(productIds)

    products.map(product => {
      product.count = totalDiscountDTO
        .find(el => (el.productId).toString() === (product._id).toString()).count
      delete product._id
      totalItemsCount += product.count
      orderPrice += Math.ceil((product.totalPrice * 100) / 100) * product.count
    })

    if (discountConfig.fixPriceCategories && discountConfig.fixPriceCategories.length !== 0) {
      const fixPriceCategories = discountConfig.fixPriceCategories
      fixPriceCount = products.reduce((acc, product) => fixPriceCategories.includes(product.categoryId) ? acc += product.count : acc += 0, 0)
      fixPriceCount = fixPriceCount >= discountConfig.fixPriceMinCount ? fixPriceCount : 0

      if (fixPriceCount >= discountConfig.fixPriceMinCount) {
        products.map(product => {
          if (fixPriceCategories.includes(product.categoryId)) {
            fixPrice += product.totalPrice * product.count
            product.totalPrice = discountConfig.fixPrice
          }
        })
      }
    }

    const productsList = isOrder ? await this.productService.getProductsByIdsFull(productIds): []
    const itemsCountDiscount = (totalItemsCount - fixPriceCount) >= discountConfig.minCount ? discountConfig.discount : 0
    const fixPriceDiscount = (Math.ceil((fixPrice - (fixPrice !== 0 ? fixPriceCount * discountConfig.fixPrice : 0)) * 100) / 100)
    const discountByCount = (Math.ceil((itemsCountDiscount !== 0 ? (orderPrice - fixPrice) * itemsCountDiscount / 100 : 0) * 100) / 100)

    const result: ITotal = {
      orderPrice,
      totalItemsCount,
      totalDiscount: discountByCount + fixPriceDiscount,
      totalPrice: (Math.ceil((orderPrice - (discountByCount + fixPriceDiscount)) * 100) / 100),
    }
    isOrder ? result.products = productsList : null
    return result
  }
}
