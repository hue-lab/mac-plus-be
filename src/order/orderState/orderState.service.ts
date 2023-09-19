import {Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {OrderState} from "./schema/orderState.schema";
import {OrderStateDTO} from "./dto/orderState.dto";


@Injectable()
export class OrderStateService {
  constructor(@InjectModel('OrderState') private readonly orderStateModel: Model<OrderState>) {}

  async getOrderStates(): Promise<OrderState[]> {
    return this.orderStateModel.find().exec()
  }

  async getOrderStateById(id: string): Promise<OrderState> {
    return this.orderStateModel.findById(id).exec()
  }

  async addOrderState(orderStateDTO: OrderStateDTO): Promise<OrderState> {
    const newDeliveryMethod = await this.orderStateModel.create(orderStateDTO)
    return newDeliveryMethod.save()
  }

  async updateOrderState(id: string, orderStateDTO: OrderStateDTO): Promise<OrderState> {
    return this.orderStateModel.findByIdAndUpdate(id, orderStateDTO, {new: true})
  }

  async deleteOrderState(id: string): Promise<OrderState> {
    return this.orderStateModel.findByIdAndRemove(id)
  }
}
