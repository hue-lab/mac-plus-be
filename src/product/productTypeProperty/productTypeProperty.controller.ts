import {Body, Controller, Delete, Get, NotFoundException, Param, Post, Put, UseGuards} from "@nestjs/common";
import {ProductTypePropertyService} from "./productTypeProperty.service";
import {IdValidationPipe} from "../../helpers/pipes/idValidation.pipe";
import {JwtAuthGuard} from "../../auth/guards/jwt.guard";
import {RolesGuard} from "../../auth/guards/roles.guard";
import {Roles} from "../../auth/decorators/roles.decorator";
import {Role} from "../../auth/enums/role.enum";
import {ProductTypeProperty} from "./schema/ProductTypeProperty.schema";
import {ProductTypePropertyDTO} from "./dto/productTypeProperty.dto";

@Controller('store/')
export class ProductTypePropertyController {
  constructor(private productTypePropertyService: ProductTypePropertyService) {}

  @Get('property/')
  async getProductTypeProperties(): Promise<ProductTypeProperty[]> {
    return this.productTypePropertyService.getProductTypeProperties()
  }

  @Get('property/:id')
  async getProductType(@Param('id', IdValidationPipe) id: string): Promise<ProductTypeProperty>{
    const productTypeProperty = await this.productTypePropertyService.getProductTypeProperty(id)
    if (!productTypeProperty) throw new NotFoundException('ProductTypeProperty does not exist')
    return productTypeProperty
  }

  @Post('property/')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async addProductType(@Body() productTypePropertyDTO: ProductTypePropertyDTO): Promise<ProductTypeProperty>{
    return this.productTypePropertyService.addProductTypeProperty(productTypePropertyDTO)
  }

  @Put('property/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async updateProductType(
    @Param('id', IdValidationPipe) id: string,
    @Body() productTypePropertyDTO: ProductTypePropertyDTO): Promise<ProductTypeProperty> {
    const productTypeProperty = await this.productTypePropertyService.updateProductTypeProperty(id, productTypePropertyDTO)
    if(!productTypeProperty) throw new NotFoundException('ProductTypeProperty does not exist')
    return productTypeProperty
  }

  @Delete('property/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async deleteProductType(@Param('id', IdValidationPipe) id: string): Promise<ProductTypeProperty>{
    const productTypeProperty = await this.productTypePropertyService.deleteProductTypeProperty(id)
    if (!productTypeProperty) throw new NotFoundException('ProductTypeProperty does not exist')
    return productTypeProperty
  }
}
