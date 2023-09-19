import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  UseGuards
} from '@nestjs/common';
import {Brand} from "./schema/brand.schema";
import {JwtAuthGuard} from "../../auth/guards/jwt.guard";
import {RolesGuard} from "../../auth/guards/roles.guard";
import {Roles} from "../../auth/decorators/roles.decorator";
import {Role} from "../../auth/enums/role.enum";
import {BrandDTO} from "./dto/brand.dto";
import {IdValidationPipe} from "../../helpers/pipes/idValidation.pipe";
import {BrandService} from "./brand.service";


@Controller('store/')
export class BrandController {
  constructor(private brandService: BrandService) {
  }

  @Get('brand/')
  async getBrands(): Promise<Brand[]> {
    return this.brandService.getBrands();
  }

  @Get('brand/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async getBrand(@Param('id', IdValidationPipe) id: string): Promise<Brand> {
    const brand = await this.brandService.getBrand(id)
    if (!brand) throw new NotFoundException('Brand does not exist')
    return brand
  }

  @Post('brand/')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async addBrand(@Body() brandDTO: BrandDTO): Promise<Brand> {
    return await this.brandService.addBrand(brandDTO)
  }

  @Put('brand/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async updateBrand(@Param('id', IdValidationPipe) id: string, @Body() brandDTO: BrandDTO): Promise<Brand> {
    const brand = await this.brandService.updateBrand(id, brandDTO);
    if (!brand) throw new NotFoundException('Brand does not exist!');
    return brand;
  }

  @Delete('brand/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async deleteBrand(@Param('id', IdValidationPipe) id: string) {
    const brand = await this.brandService.deleteBrand(id);
    if (!brand) throw new NotFoundException('Brand does not exist');
    return brand;
  }
}
