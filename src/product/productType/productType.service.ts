import {Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {ProductType, ProductTypeDocument} from "./schema/productType.schema";
import {ProductTypeDTO} from "./dto/productType.dto";
import {GetProductsComparisonValue} from "../dto/filterProduct.dto";
import {ObjectId} from "mongodb";
import {ProductTypePropertyType} from "../enums/productTypePropertyType.enum.";


@Injectable()
export class ProductTypeService {
  constructor(
    @InjectModel('ProductType') private readonly productTypeModel: Model<ProductTypeDocument>
  ) { }

  async getProductTypes(): Promise<ProductType[]> {
    return this.productTypeModel.aggregate([
      {
        "$lookup" : { from: 'producttypeproperties', localField: "properties", foreignField: "_id", as: "properties" }
      }
    ])
  }

  async getProductTypePreviews(): Promise<ProductType[]> {
    return this.productTypeModel.aggregate([
      { $addFields: {
          propertiesLength: { $cond: { if: { $isArray: "$properties" }, then: { $size: "$properties" }, else: "NA"} }
        }},
      { $unset: 'properties'}
    ]).exec()
  }

  async getProductTypesFilters(typesArr: string[]): Promise<ProductType[]> {
    const propertiesMatrix = [];
    return this.productTypeModel.aggregate([
      { $match: { _id: { $in : this.toObjectId(typesArr) } } },
      { $lookup : { from: 'producttypeproperties', localField: "properties", foreignField: "_id", as: "properties" } },
    ]).then(res => {
      return res.reduce((prev, curr) => {
        propertiesMatrix.push(curr.properties.map(prop => prop._id.toString()));
        prev = [...new Map([...prev, ...curr.properties].map(prop => [prop._id.toString(), prop])).values()];
        return prev;
      }, []).filter(item => {
        return propertiesMatrix.every(matrixItem => matrixItem.includes(item._id.toString())) && item.showFilter &&  item.type !== ProductTypePropertyType.StringInput;
      });
    });
  }

  async getProductType(id: string): Promise<ProductType>{
    return this.productTypeModel.findById(id).populate('properties').exec()
  }

  async addProductType(productTypeDTO: ProductTypeDTO): Promise<ProductType>{
    const productType = await this.productTypeModel.create(productTypeDTO)
    return productType.save()
  }

  async updateProductType(id: string, productTypeDTO: ProductTypeDTO): Promise<ProductType> {
    return this.productTypeModel.findByIdAndUpdate(id, productTypeDTO)
  }

  async deleteProductType(id: string): Promise<ProductType>{
   return this.productTypeModel.findByIdAndRemove(id)
  }

  private toObjectId(value: GetProductsComparisonValue): ObjectId | ObjectId[] {
    if (Array.isArray(value)) {
      return value.map(item => new ObjectId(item));
    }
    value = value.toString();
    return new ObjectId(value);
  }
}
