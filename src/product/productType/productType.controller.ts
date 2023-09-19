import { Body, Controller, Delete, Get, NotFoundException, Param, Post, Put, Query, UseGuards } from "@nestjs/common";
import {ProductTypeService} from "./productType.service";
import {JwtAuthGuard} from "../../auth/guards/jwt.guard";
import {RolesGuard} from "../../auth/guards/roles.guard";
import {Roles} from "../../auth/decorators/roles.decorator";
import {ProductType} from "./schema/productType.schema";
import {Role} from "../../auth/enums/role.enum";
import {IdValidationPipe} from "../../helpers/pipes/idValidation.pipe";
import {ProductTypeDTO} from "./dto/productType.dto";


@Controller('store/')
export class ProductTypeController {
  constructor(private productTypeService: ProductTypeService) {}

  @Get('type/')
  async getProductTypes(): Promise<ProductType[]> {
    return this.productTypeService.getProductTypes()
  }

  @Get('type/prev')
  async getProductTypePreviews(): Promise<ProductType[]> {
    return this.productTypeService.getProductTypePreviews()
  }

  @Get('type/filters')
  async getProductTypesFilters(@Query() data: { types: string }) {
    return this.productTypeService.getProductTypesFilters(data.types.split(','));
  }

  @Get('type/:id')
  async getProductType(@Param('id', IdValidationPipe) id: string): Promise<ProductType>{
    const productType = await this.productTypeService.getProductType(id)
    if (!productType) throw new NotFoundException('ProductType does not exist')
    return productType
  }

  @Post('type/')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async addProductType(@Body() productTypeDTO: ProductTypeDTO): Promise<ProductType>{
    return this.productTypeService.addProductType(productTypeDTO)
  }

  @Put('type/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async updateProductType(
    @Param('id', IdValidationPipe) id: string,
    @Body() productTypeDTO: ProductTypeDTO): Promise<ProductType> {
    const productType = await this.productTypeService.updateProductType(id, productTypeDTO)
    if(!productType) throw new NotFoundException('ProductType does not exist')
    return productType
  }

  @Delete('type/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async deleteProductType(@Param('id', IdValidationPipe) id: string): Promise<ProductType>{
    const productType = await this.productTypeService.deleteProductType(id)
    if (!productType) throw new NotFoundException('ProductType does not exist')
    return productType
  }
}
