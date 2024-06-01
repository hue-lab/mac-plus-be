import { Injectable } from '@nestjs/common';
import { Telegraf } from 'telegraf';
import { ITelegram } from './interface/telegram.interface';
import { NotifyDTO, NotifyMessageDTO } from './dto/notify.dto';
import * as process from "process";

@Injectable()
export class NotifyService {
  bot: Telegraf;
  options: ITelegram;

  constructor() {
    this.options = {
      token: process.env.TG_TOKEN,
      chatId: process.env.TG_CHAT_ID,
    };
    this.bot = new Telegraf(this.options.token);
  }

  async sendMessage(
    notifyDTO: NotifyDTO,
    chartId: string = this.options.chatId,
  ) {
    const message =
      `Новый заказ\n` +
      `Заказчик:\n` +
      `Имя: ${notifyDTO.customer?.name ?? ''}\n` +
      `Телефон: ${notifyDTO.customer?.phone ?? ''}\n` +
      `Код заказа: ${notifyDTO.orderCode ?? ''}\n` +
      `Доставка:\n` +
      `Метод: ${notifyDTO.delivery?.deliveryMethod.name ?? ''}\n` +
      `Стоимость доставки: ${
        notifyDTO.delivery?.deliveryMethod.deliveryPrice ?? ''
      }\n` +
      notifyDTO.delivery?.deliveryData?.map(item => (
        `${item?.name}: ${item?.value} \n`
      ))?.join() ?? '' +
      `Товары: ${notifyDTO.products ?? ''}\n` +
      `Оплата: ${notifyDTO.paymentMethod?.name ?? ''}\n` +
      `Скидка: ${notifyDTO.totalDiscount ?? ''}\n` +
      `К оплате: ${notifyDTO.totalPrice ?? ''}\n`;
    await this.bot.telegram.sendMessage(chartId, message);
  }

  async sendCustomMessage(
    notifyMessageDTO: NotifyMessageDTO,
    chartId: string = this.options.chatId,
  ) {
    const message =
      `Новый запрос\n` +
      `Имя: ${notifyMessageDTO.name}\n` +
      `Телефон: ${notifyMessageDTO.phone}\n` +
      `Комментарий:\n` +
      `${notifyMessageDTO.message}`;
    await this.bot.telegram.sendMessage(chartId, message);
  }
}
