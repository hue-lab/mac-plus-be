import {Body, Controller, Post} from '@nestjs/common';
import {NotifyService} from "./notify.service";
import {NotifyDTO} from "./dto/notify.dto";

@Controller('notify')
export class NotifyController {
  constructor(private readonly telegramService: NotifyService) {}

  @Post()
  async notify(@Body() notifyDTO: NotifyDTO) {
    return this.telegramService.sendMessage(notifyDTO)
  }
}
