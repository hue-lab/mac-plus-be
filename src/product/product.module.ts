import {Module} from '@nestjs/common';
import {MongooseModule} from "@nestjs/mongoose";
import {ProductSchema} from "./schema/product.schema";
import {ProductService} from "./product.service";
import {ProductController} from "./product.controller";
import {BrandSchema} from "./brand/schema/brand.schema";
import {ProductTypePropertyOptionSchema} from "./schema/productTypePropertyOption.schema";
import {ProductTypeSchema} from "./productType/schema/productType.schema";
import {ProductTypePropertySchema} from "./productTypeProperty/schema/ProductTypeProperty.schema";
import {ProductPropsSchema} from "./schema/productProps.schema";
import {BrandService} from "./brand/brand.service";
import {BrandController} from "./brand/brand.controller";
import {ProductTypeService} from "./productType/productType.service";
import {ProductTypeController} from "./productType/productType.controller";
import {ProductTypePropertyController} from "./productTypeProperty/productTypeProperty.controller";
import {ProductTypePropertyService} from "./productTypeProperty/productTypeProperty.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      {name: 'Product', schema: ProductSchema},
      {name: 'Brand', schema: BrandSchema},
      {name: 'ProductTypePropertyOption', schema: ProductTypePropertyOptionSchema},
      {name: 'ProductType', schema: ProductTypeSchema},
      {name: 'ProductTypeProperty', schema: ProductTypePropertySchema},
      {name: 'ProductProps', schema: ProductPropsSchema}
    ])
  ],
  providers: [
    ProductService,
    BrandService,
    ProductTypeService,
    ProductTypePropertyService
  ],
  controllers: [
    ProductController,
    BrandController,
    ProductTypeController,
    ProductTypePropertyController
  ],
  exports: [ProductService]
})
export class ProductModule {}
