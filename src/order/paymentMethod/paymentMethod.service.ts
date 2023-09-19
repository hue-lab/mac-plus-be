import {Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {PaymentMethod} from "./schema/paymentMethod.schema";
import {PaymentMethodDTO} from "./dto/paymentMethod.dto";


@Injectable()
export class PaymentMethodService {
  constructor(@InjectModel('PaymentMethod') private readonly paymentMethodModel: Model<PaymentMethod>) {}

  async getPaymentMethods(): Promise<PaymentMethod[]> {
    return this.paymentMethodModel.find().exec()
  }

  async getPaymentMethodById(id: string): Promise<PaymentMethod> {
    return this.paymentMethodModel.findById(id).exec()
  }

  async addPaymentMethod(paymentMethodDTO: PaymentMethodDTO): Promise<PaymentMethod> {
    const newPaymentMethod = await this.paymentMethodModel.create(paymentMethodDTO)
    return newPaymentMethod.save()
  }

  async updatePaymentMethod(id: string, paymentMethodDTO: PaymentMethodDTO): Promise<PaymentMethod> {
    return this.paymentMethodModel.findByIdAndUpdate(id, paymentMethodDTO, {new: true})
  }

  async deletePaymentMethod(id: string): Promise<PaymentMethod> {
    return this.paymentMethodModel.findByIdAndRemove(id)
  }
}
