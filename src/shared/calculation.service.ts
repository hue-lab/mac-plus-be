import { Global, Injectable } from '@nestjs/common';
import { TotalDiscountDTO } from './dto/totalDiscount.dto';
import { DiscountConfigService } from '../storeConfig/discountConfig/discountConfig.service';
import { ProductService } from '../product/product.service';
import mongoose from 'mongoose';
import { ITotal } from './interfaces/total.interface';
import { DeliveryMethodService } from '../order/deliveryMethod/deliveryMethod.service';
import { DeliveryMethodDTO } from '../order/deliveryMethod/dto/deliveryMethod.dto';

@Global()
@Injectable()
export class CalculationService {
  constructor(
    private readonly discountConfigService: DiscountConfigService,
    private readonly productService: ProductService,
    private readonly deliveryMethodService: DeliveryMethodService,
  ) {}

  async getTotalDiscount(totalDiscountDTO: TotalDiscountDTO, isOrder = false) {
    let totalItemsCount = 0;
    let fixPriceCount = 0;
    let orderPrice = 0;
    let fixPrice = 0;
    let deliveryPrice = 0;
    let deliveryThreshold = 0;

    const productIds: mongoose.Types.ObjectId[] = [];
    totalDiscountDTO.products.forEach((query) => {
      const id = query.productId;
      (query.productId as unknown) = new mongoose.Types.ObjectId(id);
      productIds.push(query.productId as any);
    });

    if (totalDiscountDTO.deliveryMethod) {
      const deliveryMethod: DeliveryMethodDTO[] =
        await this.deliveryMethodService.getDeliveryMethodById(
          totalDiscountDTO.deliveryMethod,
        );
      deliveryPrice = deliveryMethod[0]?.deliveryPrice || 0;
      deliveryThreshold = deliveryMethod[0]?.deliveryThreshold || 0;
    }

    const discountConfig = await this.discountConfigService.getDiscountConfig();
    const products = await this.productService.getProductsByIds(productIds);

    products.map((product) => {
      product.count = totalDiscountDTO.products.find(
        (el) => el.productId.toString() === product._id.toString(),
      ).count;
      delete product._id;
      totalItemsCount += product.count;
      orderPrice += product.totalPrice * product.count;
    });

    if (deliveryThreshold > 0 && orderPrice >= deliveryThreshold) {
      deliveryPrice = 0;
    }

    if (
      discountConfig.fixPriceCategories &&
      discountConfig.fixPriceCategories.length !== 0
    ) {
      const fixPriceCategories = discountConfig.fixPriceCategories;
      fixPriceCount = products.reduce(
        (acc, product) =>
          fixPriceCategories.includes(product.categoryId)
            ? (acc += product.count)
            : (acc += 0),
        0,
      );
      fixPriceCount =
        fixPriceCount >= discountConfig.fixPriceMinCount ? fixPriceCount : 0;

      if (fixPriceCount >= discountConfig.fixPriceMinCount) {
        products.map((product) => {
          if (fixPriceCategories.includes(product.categoryId)) {
            fixPrice += product.totalPrice * product.count;
            product.totalPrice = discountConfig.fixPrice;
          }
        });
      }
    }

    const productsList = isOrder
      ? await this.productService.getProductsByIdsFull(productIds)
      : [];
    const itemsCountDiscount =
      totalItemsCount - fixPriceCount >= discountConfig.minCount
        ? discountConfig.discount
        : 0;
    const fixPriceDiscount =
      ((fixPrice -
        (fixPrice !== 0 ? fixPriceCount * discountConfig.fixPrice : 0)) *
        100) /
      100;
    const discountByCount =
      ((itemsCountDiscount !== 0
        ? ((orderPrice - fixPrice) * itemsCountDiscount) / 100
        : 0) *
        100) /
      100;

    const result: ITotal = {
      orderPrice,
      totalItemsCount,
      totalDiscount:
        Number(discountByCount.toFixed(2)) +
        Number(fixPriceDiscount.toFixed(2)),
      deliveryPrice,
      totalPrice: Number(
        (
          orderPrice -
          (discountByCount + fixPriceDiscount) +
          deliveryPrice
        ).toFixed(2),
      ),
    };
    isOrder ? (result.products = productsList) : null;
    return result;
  }
}
