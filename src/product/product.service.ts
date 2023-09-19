import {Injectable} from '@nestjs/common';
import mongoose, {Model, PipelineStage} from 'mongoose';
import {InjectModel} from '@nestjs/mongoose';
import {ObjectId} from 'mongodb';
import {Product, ProductDocument} from './schema/product.schema';
import {GetProductsComparisonValue, GetProductsDTO} from "./dto/filterProduct.dto";
import {CreateProductDTO} from "./dto/createProduct.dto";
import {objectIdProperties} from "./const/object-id-properties.const";
import {transliterate} from "./transliteration.func";
import {paginate} from "../helpers/functions/paginate.func";

@Injectable()
export class ProductService {
  constructor(@InjectModel('Product') private readonly productModel: Model<ProductDocument>) {}

  async totalCount(options?) {
    return this.productModel.count(options).exec()
  }

  async getAllProducts(): Promise<Product[]> {
    return this.productModel.aggregate([
      { $lookup: { from: 'brands', localField: 'brand', foreignField: '_id', as: 'brand' }},
      { $unwind: { path: '$brand', preserveNullAndEmptyArrays: true }},
    ]).exec()
  }

  async getProductsByIds(productIds: mongoose.Types.ObjectId[]) {
    return this.productModel.aggregate([
      { $match: { "_id": {$in: productIds}} },
      { $project: {
          categoryId: 1,
          totalPrice: 1}}
    ]).exec()
  }

  async getProductsByIdsFull(productIds: mongoose.Types.ObjectId[]) {
    return this.productModel.aggregate([
      { $match: { "_id": {$in: productIds}} },
      { $lookup: { from: 'brands', localField: 'brand', foreignField: '_id', as: 'brand' }},
      { $unwind: { path: '$brand', preserveNullAndEmptyArrays: true }},
    ])
  }

  async getProduct(id: string): Promise<Product> {
    const productId = new mongoose.Types.ObjectId(id)
    return await this.productModel.aggregate([
      { $match: { "_id": productId }},
      { $lookup: { from: 'brands', localField: 'brand', foreignField: '_id', as: 'brand' }},
      { $lookup: { from: 'categories', localField: 'categoryId', foreignField: '_id', as: 'category' }},
      { $unwind: { path: '$brand', preserveNullAndEmptyArrays: true }},
      { $unwind: { path: '$category', preserveNullAndEmptyArrays: true }},
      {
        $addFields: {
          productProps: {
            $map: {
              input: "$productProps",
              in: {
                $mergeObjects: ["$$this", { productTypePropertyId: { $toObjectId: "$$this.productTypePropertyId" } }]
              }
            }
          }
        }
      },
      {
        $lookup: {
          from: "producttypeproperties",
          localField: "productProps.productTypePropertyId",
          foreignField: "_id",
          as: "propsCollection"
        }
      },
      {
        $addFields: {
          productProps: {
            $map: {
              input: { $zip: { inputs: ["$productProps", "$propsCollection"] } },
              in: { $mergeObjects: "$$this" },
            },
          },
        },
      },
      { $unset: "propsCollection" },
    ]).exec().then(items => items[0])
  }

  async addProduct(createProductDTO: CreateProductDTO): Promise<Product> {
    const newProduct = await this.productModel.create(createProductDTO)
    return newProduct.save()
  }

  async updateProduct(id: string, createProductDTO: CreateProductDTO): Promise<Product> {
    return this.productModel.findByIdAndUpdate(id, createProductDTO, {new: true})
  }

  async deleteProduct(id: string): Promise<any> {
    return this.productModel.findByIdAndRemove(id)
  }

  async autocomplete(search: string): Promise<any> {
    const aggregate: PipelineStage[] = [
      {
        $project: {
          name: 1,
          media: { $first: "$media" },
        }
      },
      {
        $match: {
          $or: [
            {name: new RegExp(search.toString(), 'i')},
            {description: new RegExp(search.toString(), 'i')},
            {name: new RegExp(transliterate(search.toString()), 'i')},
            {description: new RegExp(transliterate(search.toString()), 'i')}
          ]
        }
      }
    ]

    return this.productModel.aggregate([...aggregate]).exec()
  }

  async getProducts(getProductsDTO: GetProductsDTO): Promise<any> {
    const page: number = parseInt(getProductsDTO?.pagination?.page as any) || 1
    const limit: number = parseInt(String(getProductsDTO?.pagination?.limit)) || 10
    const matchQueryArr = [];

    if (getProductsDTO.search) {
      matchQueryArr.push({
        $or: [
          {name: new RegExp(getProductsDTO.search.toString(), 'i')},
          {description: new RegExp(getProductsDTO.search.toString(), 'i')},
          {name: new RegExp(transliterate(getProductsDTO.search.toString()), 'i')},
          {description: new RegExp(transliterate(getProductsDTO.search.toString()), 'i')}
        ]
      });
    }

    if (getProductsDTO.baseProperties) {
      const basePropertiesMatchQuery = Object.entries(getProductsDTO.baseProperties).reduce((prev, curr) => {
        const basePropertyName = curr[0];
        Object.entries(curr[1]).forEach(([comparisonOperator, comparisonValue]) => {
          prev.push({[basePropertyName]: { [comparisonOperator]: objectIdProperties.has(basePropertyName) ? this.toObjectId(comparisonValue) : comparisonValue } });
        });
        return prev;
      }, []);
      if (basePropertiesMatchQuery.length) {
        matchQueryArr.push(basePropertiesMatchQuery.length > 1 ? { $and: basePropertiesMatchQuery } : basePropertiesMatchQuery[0]);
      }
    }

    if (getProductsDTO.customProperties) {
      const customPropertiesMatchQuery = Object.entries(getProductsDTO.customProperties).reduce((prev, curr) => {
        const customPropertyId = curr[0];
        Object.entries(curr[1]).forEach(([comparisonOperator, comparisonValue]) => {
          prev.push({productProps: {
              $elemMatch: {
                  $and: [
                    { productTypePropertyId: { $eq: customPropertyId } },
                    { value: { [comparisonOperator]: comparisonValue } },
                  ]
              }
            }});
        });
        return prev;
      }, []);
      if (customPropertiesMatchQuery.length) {
        matchQueryArr.push(customPropertiesMatchQuery.length > 1 ? { $and: customPropertiesMatchQuery } : customPropertiesMatchQuery[0]);
      }
    }

    const aggregate: PipelineStage[] = [];

    if (matchQueryArr.length) {
      aggregate.push({ $match: matchQueryArr.length > 1 ? { $and: matchQueryArr } : matchQueryArr[0] });
    }

    aggregate.push(
        { $lookup: { from: 'brands', localField: 'brand', foreignField: '_id', as: 'brand' } },
        { $unwind: { path: '$brand', preserveNullAndEmptyArrays: true } },
    );

    if (getProductsDTO.sort) {
      const sortOperator = { $sort: { } }, sort = getProductsDTO.sort.property;
      sortOperator["$sort"][sort] = getProductsDTO.sort.direction;
      aggregate.push(sortOperator);
    }

    if (getProductsDTO.preview) {
      aggregate.push(
          { $unset: ['productTypeId', 'productProps'] },
          { $lookup: {from: 'categories', localField: 'categoryId', foreignField: '_id', as: 'categoryId'} },
          { $addFields: {'categoryName': '$categoryId.name' }},
          { $unwind: { path: '$categoryName', preserveNullAndEmptyArrays: true }},
          { $unset: 'categoryId' }
      )
    }

    paginate(aggregate, page, limit);

    return this.productModel.aggregate([...aggregate]).exec().then(items => items[0])
  }

  private toObjectId(value: GetProductsComparisonValue): ObjectId | ObjectId[] {
    if (Array.isArray(value)) {
      return value.map(item => new ObjectId(item));
    }
    value = value.toString();
    return new ObjectId(value);
  }
}
