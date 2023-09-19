import { Injectable } from '@nestjs/common';
import { Model, PipelineStage } from "mongoose";
import { Order } from "./schema/order.schema";
import { CreateOrderDTO } from "./dto/create-order.dto";
import { InjectModel } from "@nestjs/mongoose";
import { nanoid } from "nanoid";
import { NotifyService } from "../notify/notify.service";
import { NotifyDTO } from "../notify/dto/notify.dto";
import { CalculationService } from "../shared/calculation.service";
import { IProduct } from "../shared/interfaces/total.interface";
import { UpdateOrderDTO } from "./dto/update-order.dto";
import { GetOrdersDTO, OrderSortProperties } from "./dto/get-orders.dto";
import { paginate } from "../helpers/functions/paginate.func";

@Injectable()
export class OrderService {
  constructor(
    @InjectModel('Order') private readonly orderModel: Model<Order>,
    private readonly notifyService: NotifyService,
    private readonly calculationService: CalculationService) {
  }

  async getOrders(getOrdersDTO: GetOrdersDTO): Promise<Order[]> {
    const page: number = parseInt(getOrdersDTO?.pagination?.page as any) || 1
    const limit: number = parseInt(String(getOrdersDTO?.pagination?.limit)) || 10

    const aggregate: PipelineStage[] = [];

    if (getOrdersDTO.sort) {
      const property: OrderSortProperties = getOrdersDTO.sort.property;
      let sortOperator = { $sort: {} };
      if (property === OrderSortProperties.Customer) {
        sortOperator["$sort"]['customer.name'] = getOrdersDTO.sort.direction;
      } else {
        sortOperator["$sort"][property] = getOrdersDTO.sort.direction;
      }
      aggregate.push(sortOperator);
    }

    paginate(aggregate, page, limit);

    return this.orderModel.aggregate([...aggregate]).exec().then(items => items[0])
  }

  async getOrderById(id: string): Promise<Order> {
    return this.orderModel.findById(id).exec()
  }

  async getTrackingStatus(code: string): Promise<Order> {
    return this.orderModel.findOne({ orderCode: code}).exec()
  }

  async addOrder(createOrderDTO: CreateOrderDTO): Promise<Order> {
    const orderCode = nanoid(6)
    const checkCode = await this.isUnique(orderCode)
    if (checkCode && checkCode.length !== 0) {
      return this.addOrder(createOrderDTO)
    }
    createOrderDTO.orderCode = orderCode
    const calculation = await this.calculationService.getTotalDiscount(createOrderDTO.cartItems, true)
    Object.assign(createOrderDTO, {
      orderCode,
      cartItems: createOrderDTO.cartItems.map(cartItem => ({
        product: calculation.products.find((product: IProduct) => product._id.toString() === cartItem.productId.toString()),
        count: cartItem.count,
      })),
      subTotalPrice: calculation.orderPrice,
      totalPrice: calculation.totalPrice,
      totalDiscount: calculation.totalDiscount,
    })

    const newOrder = await this.orderModel.create(createOrderDTO)
    const notify: NotifyDTO = {
      customer: createOrderDTO.customer,
      orderCode,
      delivery: createOrderDTO.delivery,
      paymentMethod: createOrderDTO.paymentMethod,
      totalDiscount: calculation.totalDiscount,
      totalPrice: calculation.totalPrice
    }
    await this.notifyService.sendMessage(notify)
    return newOrder.save()
  }


  async isUnique(orderCode: string) {
    return this.orderModel.find( {orderCode: orderCode})
  }

  async updateOrder(id: string, updateOrderDTO: UpdateOrderDTO): Promise<Order> {
    return this.orderModel.findByIdAndUpdate(id, updateOrderDTO, {new: true})
  }

  async deleteOrder(id: string): Promise<Order> {
    return this.orderModel.findByIdAndRemove(id)
  }
}
