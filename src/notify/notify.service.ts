import { Injectable } from '@nestjs/common';
import {Telegraf} from "telegraf";
import {ITelegram} from "./interface/telegram.interface";
import {NotifyDTO} from "./dto/notify.dto";

@Injectable()
export class NotifyService {
  bot: Telegraf
  options: ITelegram

  constructor() {
    this.options = {
      token: '5977495083:AAGsa3XnTawx8uNhieoTRnBxXg-wbGNZTFE',
      chatId: '-1001819195635'
    }
    this.bot = new Telegraf(this.options.token)
  }

  async sendMessage(notifyDTO: NotifyDTO, chartId: string = this.options.chatId) {
    const message = `Новый заказ\n` +
                    `Заказчик:\n` +
                      `Имя: ${notifyDTO.customer?.name ?? ''}\n` +
                      `Телефон: ${notifyDTO.customer?.phone ?? ''}\n` +
                    `Код заказа: ${notifyDTO.orderCode ?? ''}\n` +
                    `Доставка:\n` +
                      `Метод: ${notifyDTO.delivery?.deliveryMethod.name ?? ''}\n` +
                    `Оплата: ${notifyDTO.paymentMethod?.name ?? ''}\n` +
                    `Скидка: ${notifyDTO.totalDiscount ?? ''}\n` +
                    `К оплате: ${notifyDTO.totalPrice ?? ''}\n`
    await this.bot.telegram.sendMessage(chartId, message)
  }
}
