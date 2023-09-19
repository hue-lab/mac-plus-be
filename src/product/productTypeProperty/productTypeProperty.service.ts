import {Injectable} from '@nestjs/common';
import {Model} from 'mongoose';
import {InjectModel} from '@nestjs/mongoose';
import {ProductTypeProperty, ProductTypePropertyDocument} from "./schema/ProductTypeProperty.schema";
import {ProductTypePropertyDTO} from "./dto/productTypeProperty.dto";

@Injectable()
export class ProductTypePropertyService {
  constructor(
    @InjectModel('ProductTypeProperty') private readonly productTypePropertyModel: Model<ProductTypePropertyDocument>
  ) { }

  async getProductTypeProperties(): Promise<ProductTypeProperty[]> {
    return this.productTypePropertyModel.find().exec()
  }

  async getProductTypeProperty(id: string): Promise<ProductTypeProperty>{
    return this.productTypePropertyModel.findById(id)
  }

  async addProductTypeProperty(productTypePropertyDTO: ProductTypePropertyDTO): Promise<ProductTypeProperty>{
    const productTypeProperty = await this.productTypePropertyModel.create(productTypePropertyDTO)
    return productTypeProperty.save()
  }

  async updateProductTypeProperty(id: string, productTypePropertyDTO: ProductTypePropertyDTO): Promise<ProductTypeProperty> {
    return this.productTypePropertyModel.findByIdAndUpdate(id, productTypePropertyDTO)
  }

  async deleteProductTypeProperty(id: string): Promise<ProductTypeProperty>{
    return this.productTypePropertyModel.findByIdAndRemove(id)
  }
}
