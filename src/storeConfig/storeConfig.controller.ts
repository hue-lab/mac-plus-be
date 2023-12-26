import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { DiscountConfig } from './discountConfig/schema/discountConfig.schema';
import { DiscountConfigService } from './discountConfig/discountConfig.service';
import { DiscountConfigDTO } from './discountConfig/dto/discountConfig.dto';
import { CurrencyConfig } from './currencyConfig/schema/currencyConfig.schema';
import { CurrencyConfigService } from './currencyConfig/currencyConfig.service';
import { CurrencyConfigDTO } from './currencyConfig/dto/currencyConfig.dto';

@Controller('config')
export class StoreConfigController {
  constructor(
    private readonly discountConfigService: DiscountConfigService,
    private readonly currencyConfigService: CurrencyConfigService,
  ) {}

  @Get('discount')
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard)
  async getDiscountConfig(): Promise<DiscountConfig> {
    return this.discountConfigService.getDiscountConfig();
  }

  @Put('discount/:id')
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard)
  async updateDiscountConfig(
    @Param('id') id: string,
    @Body() discountConfigDTO: DiscountConfigDTO,
  ): Promise<DiscountConfig> {
    return this.discountConfigService.updateDiscountConfig(
      id,
      discountConfigDTO,
    );
  }

  @Get('currency')
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard)
  async getCurrencyConfig(): Promise<CurrencyConfig> {
    return this.currencyConfigService.getCurrencyConfig();
  }

  @Put('currency/:id')
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard)
  async updateCurrencyConfig(
    @Param('id') id: string,
    @Body() currencyConfigDTO: CurrencyConfigDTO,
  ): Promise<CurrencyConfig> {
    return this.currencyConfigService.updateCurrencyConfig(
      id,
      currencyConfigDTO,
    );
  }
}
