import { Body, Controller, Delete, Get, NotFoundException, Param, Post, Put, Query, UseGuards, } from '@nestjs/common';
import { ProductService } from './product.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../auth/enums/role.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateProductDTO } from './dto/createProduct.dto';
import { IdValidationPipe } from '../helpers/pipes/idValidation.pipe';
import { Product } from './schema/product.schema';
import { GetProductsDTO } from './dto/filterProduct.dto';
import { Category } from "../category/schema/category.schema";
import { CatalogueSeoService } from './catalogue-seo.service';

@Controller('store/')
export class ProductController {
  constructor(
    private productService: ProductService,
    private catalogueSeo: CatalogueSeoService,
  ) {}

  @Get('product/:id')
  async getProduct(@Param('id') id: string): Promise<Product> {
    const product = await this.productService.getProduct(id);
    if (!product) throw new NotFoundException('Product does not exist!');
    return product;
  }

  @Get('item')
  async getItem(@Query('slug') slug: string) {
    if (!slug || typeof slug !== 'string') throw new NotFoundException();
    const route = await this.catalogueSeo.find(slug);
    const item = await this.productService.getItemBySlug(route?.sourcePath || slug);
    if (!route) return item;
    const product = item as Product & { category?: Category };
    const category = product.category && await this.catalogueSeo.find(product.category.handle);
    const data = 'toObject' in item ? (item.toObject as () => object)() : item;
    return { ...data, catalogueRoute: route, categoryPublicPath: category?.publicPath };
  }

  @Get('catalogue/seo-paths')
  async getCatalogueSeoPaths() {
    return this.catalogueSeo.indexablePaths();
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
    const result = await this.productService.getProducts(getProductsDTO);
    if (getProductsDTO.storefrontListing || getProductsDTO.preview) {
      await Promise.all(result.data.map(async (product) => {
        const path = [product.categoryHandle, product.seo?.seoUrl].filter(Boolean).join('/');
        const route = await this.catalogueSeo.find(path);
        if (route) product.publicPath = route.publicPath;
      }));
    }
    return result;
  }

  @Put('product/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async updateProduct(
    @Param('id') id: string,
    @Body() createProductDTO: CreateProductDTO,
  ) {
    const product = await this.productService.updateProduct(
      id,
      createProductDTO,
    );
    if (!product) throw new NotFoundException('Product does not exist!');
    return product;
  }

  @Put('product/partial/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async updateProductPartial(
    @Param('id') id: string,
    @Body() updateProductDTO: Partial<CreateProductDTO>,
  ) {
    const product = await this.productService.updateProductPartial(
      id,
      updateProductDTO,
    );
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
