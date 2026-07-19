import { BadRequestException, Injectable } from '@nestjs/common';
import { Model, PipelineStage } from 'mongoose';
import { Order } from './schema/order.schema';
import { CreateOrderDTO } from './dto/create-order.dto';
import { InjectModel } from '@nestjs/mongoose';
import { nanoid } from 'nanoid';
import { NotifyService } from '../notify/notify.service';
import { NotifyDTO } from '../notify/dto/notify.dto';
import { CalculationService } from '../shared/calculation.service';
import { IProduct } from '../shared/interfaces/total.interface';
import { UpdateOrderDTO } from './dto/update-order.dto';
import { GetOrdersDTO, OrderSortProperties } from './dto/get-orders.dto';
import { paginate } from '../helpers/functions/paginate.func';
import { TotalCartItem } from '../shared/interfaces/totalCartItem.interface';
import { DeliveryMethodService } from './deliveryMethod/deliveryMethod.service';
import { PaymentMethodService } from './paymentMethod/paymentMethod.service';
import { StateColor } from './enums/stateColor.enum';
import { OrderHistoryEnum } from './enums/orderHistory.enum';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel('Order') private readonly orderModel: Model<Order>,
    private readonly notifyService: NotifyService,
    private readonly calculationService: CalculationService,
    private readonly deliveryMethodService: DeliveryMethodService,
    private readonly paymentMethodService: PaymentMethodService,
  ) {}

  async getOrders(getOrdersDTO: GetOrdersDTO): Promise<Order[]> {
    const page: number = parseInt(getOrdersDTO?.pagination?.page as any) || 1;
    const limit: number =
      parseInt(String(getOrdersDTO?.pagination?.limit)) || 10;

    const aggregate: PipelineStage[] = [];

    if (getOrdersDTO.sort) {
      const property: OrderSortProperties = getOrdersDTO.sort.property;
      const sortOperator = { $sort: {} };
      if (property === OrderSortProperties.Customer) {
        sortOperator['$sort']['customer.name'] = getOrdersDTO.sort.direction;
      } else {
        sortOperator['$sort'][property] = getOrdersDTO.sort.direction;
      }
      aggregate.push(sortOperator);
    }

    paginate(aggregate, page, limit);

    return this.orderModel
      .aggregate([...aggregate])
      .exec()
      .then((items) => items[0]);
  }

  async getOrderById(id: string): Promise<Order> {
    return this.orderModel.findById(id).exec();
  }

  async getTrackingStatus(code: string): Promise<Order> {
    return this.orderModel.findOne({ orderCode: code }).exec();
  }

  async addOrder(createOrderDTO: CreateOrderDTO): Promise<Order> {
    const orderCode = await this.generateUniqueOrderCode();
    const cartItems = this.calculationService.normalizeCartItems(
      createOrderDTO.cartItems,
    );
    const deliveryMethodId = createOrderDTO.delivery?.deliveryMethod?._id;
    const paymentMethodId = createOrderDTO.paymentMethod?._id;

    if (!deliveryMethodId) {
      throw new BadRequestException('Delivery method is required');
    }

    if (!paymentMethodId) {
      throw new BadRequestException('Payment method is required');
    }

    const deliveryMethod = (
      await this.deliveryMethodService.getDeliveryMethodById(deliveryMethodId)
    )?.[0];
    if (!deliveryMethod) {
      throw new BadRequestException('Delivery method does not exist');
    }

    const paymentMethod =
      await this.paymentMethodService.getPaymentMethodById(paymentMethodId);
    if (!paymentMethod) {
      throw new BadRequestException('Payment method does not exist');
    }
    const paymentMethodData =
      typeof (paymentMethod as any).toObject === 'function'
        ? (paymentMethod as any).toObject()
        : paymentMethod;

    const allowedPaymentMethodIds = (deliveryMethod.paymentMethods || []).map(
      (method: any) => (method?._id || method).toString(),
    );
    if (!allowedPaymentMethodIds.includes(paymentMethodId.toString())) {
      throw new BadRequestException(
        'Payment method is not available for selected delivery method',
      );
    }

    const calculation = await this.calculationService.getTotalDiscount(
      {
        products: cartItems,
        deliveryMethod: deliveryMethodId,
      },
      true,
    );
    const extendedDelivery = {
      deliveryData: createOrderDTO.delivery.deliveryData,
      comment: createOrderDTO.delivery.comment,
      deliveryMethod: {
        ...deliveryMethod,
        deliveryPrice: calculation.deliveryPrice,
      },
    };
    const orderToCreate = {
      orderCode,
      customer: createOrderDTO.customer,
      state: this.getInitialState(),
      delivery: extendedDelivery,
      paymentMethod: paymentMethodData,
      cartItems: cartItems.map((cartItem) => ({
        product: calculation.products.find(
          (product: IProduct) =>
            product._id.toString() === cartItem.productId.toString(),
        ),
        count: cartItem.count,
      })),
      subTotalPrice: calculation.orderPrice,
      totalPrice: calculation.totalPrice,
      totalDiscount: calculation.totalDiscount,
      historyList: [
        {
          type: OrderHistoryEnum.Pending,
          time: Date.now(),
        },
      ],
    };

    const newOrder = await this.orderModel.create(orderToCreate);
    try {
      const notify: NotifyDTO = {
        customer: orderToCreate.customer,
        orderCode,
        delivery: extendedDelivery,
        paymentMethod: paymentMethodData,
        totalDiscount: calculation.totalDiscount,
        totalPrice: calculation.totalPrice,
        products: (newOrder.cartItems as TotalCartItem[])
          .map((item) => item?.product?.name)
          ?.join(', '),
      };
      await this.notifyService.sendMessage(notify);
    } catch (e) {
      console.log('Error: Cannot send telegram message!');
    }
    return newOrder.save();
  }

  async isUnique(orderCode: string) {
    return this.orderModel.find({ orderCode: orderCode });
  }

  private async generateUniqueOrderCode(): Promise<string> {
    const maxAttempts = 5;
    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      const orderCode = nanoid(6);
      const existingOrder = await this.orderModel.exists({ orderCode }).exec();
      if (!existingOrder) {
        return orderCode;
      }
    }

    throw new BadRequestException('Cannot generate unique order code');
  }

  private getInitialState() {
    return {
      label: 'Ожидание',
      color: StateColor.Neutral,
      description: 'Ожидайте звонка оператора',
    };
  }

  async updateOrder(
    id: string,
    updateOrderDTO: UpdateOrderDTO,
  ): Promise<Order> {
    return this.orderModel.findByIdAndUpdate(id, updateOrderDTO, { new: true });
  }

  async deleteOrder(id: string): Promise<Order> {
    return this.orderModel.findByIdAndRemove(id);
  }
}
