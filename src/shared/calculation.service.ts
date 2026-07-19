import { BadRequestException, Global, Injectable } from '@nestjs/common';
import {
  TotalDiscountDTO,
  TotalDiscountProductDTO,
} from './dto/totalDiscount.dto';
import { DiscountConfigService } from '../storeConfig/discountConfig/discountConfig.service';
import { ProductService } from '../product/product.service';
import mongoose from 'mongoose';
import { ITotal } from './interfaces/total.interface';
import { DeliveryMethodService } from '../order/deliveryMethod/deliveryMethod.service';
import { DeliveryMethodDTO } from '../order/deliveryMethod/dto/deliveryMethod.dto';

export interface NormalizedCartItem {
  productId: string;
  count: number;
}

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

    const productsInput = this.normalizeCartItems(totalDiscountDTO.products);
    const productIds = productsInput.map(
      (query) => new mongoose.Types.ObjectId(query.productId),
    );

    if (totalDiscountDTO.deliveryMethod) {
      if (!mongoose.Types.ObjectId.isValid(totalDiscountDTO.deliveryMethod)) {
        throw new BadRequestException('Invalid delivery method');
      }

      const deliveryMethod: DeliveryMethodDTO[] =
        await this.deliveryMethodService.getDeliveryMethodById(
          totalDiscountDTO.deliveryMethod,
        );
      if (!deliveryMethod?.[0]) {
        throw new BadRequestException('Delivery method does not exist');
      }

      deliveryPrice = deliveryMethod[0]?.deliveryPrice || 0;
      deliveryThreshold = deliveryMethod[0]?.deliveryThreshold || 0;
    }

    const discountConfig = await this.discountConfigService.getDiscountConfig();
    const products = await this.productService.getProductsByIds(productIds);
    if (products.length !== productsInput.length) {
      throw new BadRequestException(
        'One or more products do not exist or are unavailable',
      );
    }

    products.map((product) => {
      product.count = productsInput.find(
        (el) => el.productId.toString() === product._id.toString(),
      )?.count;
      if (!product.count) {
        throw new BadRequestException('Invalid cart item');
      }
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

  normalizeCartItems(products: TotalDiscountProductDTO[]): NormalizedCartItem[] {
    if (!Array.isArray(products) || products.length === 0) {
      throw new BadRequestException('Cart must contain at least one item');
    }

    const grouped = new Map<string, number>();
    products.forEach((item) => {
      if (!mongoose.Types.ObjectId.isValid(item?.productId)) {
        throw new BadRequestException('Invalid product id');
      }

      if (!Number.isInteger(item?.count) || item.count < 1 || item.count > 99) {
        throw new BadRequestException('Invalid product count');
      }

      const current = grouped.get(item.productId) || 0;
      const next = current + item.count;
      if (next > 99) {
        throw new BadRequestException('Invalid product count');
      }

      grouped.set(item.productId, next);
    });

    return [...grouped.entries()].map(([productId, count]) => ({
      productId,
      count,
    }));
  }
}
