import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { NotifyService } from './notify.service';
import { NotifyDTO, NotifyMessageDTO } from './dto/notify.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { PublicForm } from '../security/public-form.decorator';
import { PublicFormProtectionGuard } from '../security/public-form-protection.guard';
import { Throttle } from '@nestjs/throttler';

@Controller('notify')
export class NotifyController {
  constructor(private readonly telegramService: NotifyService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async notify(@Body() notifyDTO: NotifyDTO) {
    return this.telegramService.sendMessage(notifyDTO);
  }

  @Post('message')
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @PublicForm('quick-message')
  @UseGuards(PublicFormProtectionGuard)
  async notifyMessage(@Body() notifyMessageDTO: NotifyMessageDTO) {
    return this.telegramService.sendCustomMessage(notifyMessageDTO);
  }
}
