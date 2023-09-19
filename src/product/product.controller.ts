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
import {ProductService} from "./product.service";
import {JwtAuthGuard} from "../auth/guards/jwt.guard";
import {RolesGuard} from "../auth/guards/roles.guard";
import {Role} from "../auth/enums/role.enum";
import {Roles} from "../auth/decorators/roles.decorator";
import {CreateProductDTO} from "./dto/createProduct.dto";
import {IdValidationPipe} from "../helpers/pipes/idValidation.pipe";
import {Product} from "./schema/product.schema";
import {GetProductsDTO} from "./dto/filterProduct.dto";

@Controller('store/')
export class ProductController {
  constructor(private productService: ProductService) {
  }

  @Get('product/:id')
  async getProduct(@Param('id') id: string): Promise<Product> {
    const product = await this.productService.getProduct(id);
    if (!product) throw new NotFoundException('Product does not exist!');
    return product;
  }

  @Get('autocomplete/:search')
  async autocomplete(@Param('search') search: string) {
    const products = await this.productService.autocomplete(search);
    if (!products) throw new NotFoundException('No results!');
    return products;
  }

  @Post('product/')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async addProduct(@Body() createProductDTO: CreateProductDTO) {
    return await this.productService.addProduct(createProductDTO);
  }

  @Post('products/')
  async getProducts(@Body() getProductsDTO: GetProductsDTO) {
    return await this.productService.getProducts(getProductsDTO);
  }

  @Put('product/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async updateProduct(@Param('id') id: string, @Body() createProductDTO: CreateProductDTO) {
    const product = await this.productService.updateProduct(id, createProductDTO);
    if (!product) throw new NotFoundException('Product does not exist!');
    return product;
  }

  @Delete('product/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async deleteProduct(@Param('id', IdValidationPipe) id: string) {
    const product = await this.productService.deleteProduct(id);
    if (!product) throw new NotFoundException('Product does not exist');
    return product;
  }
}
