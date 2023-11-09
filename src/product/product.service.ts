import { Injectable, NotFoundException } from '@nestjs/common';
import mongoose, { Model, PipelineStage } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Product, ProductDocument } from './schema/product.schema';
import {
  GetProductsComparisonValue,
  GetProductsDTO,
} from './dto/filterProduct.dto';
import { CreateProductDTO } from './dto/createProduct.dto';
import { objectIdProperties } from './const/object-id-properties.const';
import { transliterate } from './transliteration.func';
import { paginate } from '../helpers/functions/paginate.func';
import { BasePropertyName, ComparisonOperator } from './enums/product.enum';
import { CategoryService } from '../category/category.service';
import { nestedCategoriesList } from '../shared/functions/nested-categories-list.func';
import { Category, CategoryDocument } from '../category/schema/category.schema';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel('Product')
    private readonly productModel: Model<ProductDocument>,
    private categoryService: CategoryService,
  ) {}

  async totalCount(options?) {
    return this.productModel.count(options).exec();
  }

  async getAllProducts(): Promise<Product[]> {
    return this.productModel
      .aggregate([
        {
          $lookup: {
            from: 'brands',
            localField: 'brand',
            foreignField: '_id',
            as: 'brand',
          },
        },
        { $unwind: { path: '$brand', preserveNullAndEmptyArrays: true } },
      ])
      .exec();
  }

  async getItemBySlug(slug: string): Promise<Product | Category> {
    const foundCategory = await this.categoryService.getCategoryBySlug(slug);
    if (!foundCategory) {
      const foundProduct = await this.getProduct(slug, true);
      if (!foundProduct) {
        throw new NotFoundException(`Item with slug ${slug} not found`);
      }
      return foundProduct;
    }
    return foundCategory;
  }

  async getProductsByIds(productIds: mongoose.Types.ObjectId[]) {
    return this.productModel
      .aggregate([
        { $match: { _id: { $in: productIds } } },
        {
          $project: {
            categoryId: 1,
            totalPrice: 1,
          },
        },
      ])
      .exec();
  }

  async getProductsByIdsFull(productIds: mongoose.Types.ObjectId[]) {
    return this.productModel.aggregate([
      { $match: { _id: { $in: productIds } } },
      {
        $lookup: {
          from: 'brands',
          localField: 'brand',
          foreignField: '_id',
          as: 'brand',
        },
      },
      { $unwind: { path: '$brand', preserveNullAndEmptyArrays: true } },
    ]);
  }

  async getProduct(id: string, slug = false): Promise<Product> {
    let slugChain: string[], slugProduct: string, slugCategory: string;
    const slugMatch: mongoose.PipelineStage[] = [];
    if (slug) {
      slugChain = id.split('/');
      slugProduct = slugChain.pop();
      slugCategory = slugChain.join('/');
      slugMatch.push({
        $match: { 'category.handle': slugCategory },
      });
    }
    const productId = slug ? slugProduct : new mongoose.Types.ObjectId(id);
    return await this.productModel
      .aggregate([
        { $match: { [slug ? 'seo.seoUrl' : '_id']: productId } },
        {
          $lookup: {
            from: 'categories',
            localField: 'categoryId',
            foreignField: '_id',
            as: 'category',
          },
        },
        ...slugMatch,
        {
          $lookup: {
            from: 'brands',
            localField: 'brand',
            foreignField: '_id',
            as: 'brand',
          },
        },
        { $unwind: { path: '$brand', preserveNullAndEmptyArrays: true } },
        { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
        {
          $addFields: {
            productProps: {
              $map: {
                input: '$productProps',
                in: {
                  $mergeObjects: [
                    '$$this',
                    {
                      productTypePropertyId: {
                        $toObjectId: '$$this.productTypePropertyId',
                      },
                    },
                  ],
                },
              },
            },
          },
        },
        {
          $lookup: {
            from: 'producttypeproperties',
            localField: 'productProps.productTypePropertyId',
            foreignField: '_id',
            as: 'propsCollection',
          },
        },
        {
          $addFields: {
            productProps: {
              $map: {
                input: {
                  $zip: { inputs: ['$productProps', '$propsCollection'] },
                },
                in: { $mergeObjects: '$$this' },
              },
            },
          },
        },
        { $unset: 'propsCollection' },
      ])
      .exec()
      .then((items) => items[0]);
  }

  async addProduct(createProductDTO: CreateProductDTO): Promise<Product> {
    const newProduct = await this.productModel.create(createProductDTO);
    return newProduct.save();
  }

  async updateProduct(
    id: string,
    createProductDTO: CreateProductDTO,
  ): Promise<Product> {
    return this.productModel.findByIdAndUpdate(id, createProductDTO, {
      new: true,
    });
  }

  async deleteProduct(id: string): Promise<any> {
    return this.productModel.findByIdAndRemove(id);
  }

  async autocomplete(search: string): Promise<any> {
    const aggregate: PipelineStage[] = [
      {
        $project: {
          name: 1,
          media: { $first: '$media' },
          categoryId: "$categoryId",
        },
      },
      {
        $match: {
          $or: [
            { name: new RegExp(search.toString(), 'i') },
            { description: new RegExp(search.toString(), 'i') },
            { name: new RegExp(transliterate(search.toString()), 'i') },
            { description: new RegExp(transliterate(search.toString()), 'i') },
          ],
        },
      },
      {$limit: 20},
      {
        $lookup: {
          from: 'categories',
          localField: 'categoryId',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
      { $unset: 'categoryId' },
    ];

    return this.productModel.aggregate([...aggregate]).exec();
  }

  async getProducts(getProductsDTO: GetProductsDTO): Promise<any> {
    const page: number = parseInt(getProductsDTO?.pagination?.page as any) || 1;
    const limit: number =
      parseInt(String(getProductsDTO?.pagination?.limit)) || 10;
    const matchQueryArr = [];

    if (getProductsDTO.search) {
      matchQueryArr.push({
        $or: [
          { name: new RegExp(getProductsDTO.search.toString(), 'i') },
          { description: new RegExp(getProductsDTO.search.toString(), 'i') },
          {
            name: new RegExp(
              transliterate(getProductsDTO.search.toString()),
              'i',
            ),
          },
          {
            description: new RegExp(
              transliterate(getProductsDTO.search.toString()),
              'i',
            ),
          },
        ],
      });
    }

    if (getProductsDTO.baseProperties) {
      let nestedCategoryList: ObjectId[] | undefined;
      if (
        getProductsDTO.baseProperties.categoryId &&
        getProductsDTO.baseProperties.categoryId.$eq
      ) {
        const comparisonValue = getProductsDTO.baseProperties.categoryId.$eq;
        const category: CategoryDocument =
          (await this.categoryService.getCategoryById(
            comparisonValue.toString(),
          )) as CategoryDocument;
        if (!category)
          throw new NotFoundException(
            `Category with id ${comparisonValue} not found`,
          );
        nestedCategoryList = nestedCategoriesList(category);
      }
      const basePropertiesMatchQuery = Object.entries(
        getProductsDTO.baseProperties,
      ).reduce((prev, curr) => {
        const basePropertyName = curr[0];
        Object.entries(curr[1]).forEach(
          async ([comparisonOperator, comparisonValue]) => {
            if (
              nestedCategoryList &&
              basePropertyName === BasePropertyName.Category &&
              comparisonOperator === ComparisonOperator.eq
            ) {
              prev.push({
                [basePropertyName]: {
                  [ComparisonOperator.in]: nestedCategoryList,
                },
              });
            } else {
              prev.push({
                [basePropertyName]: {
                  [comparisonOperator]: objectIdProperties.has(basePropertyName)
                    ? this.toObjectId(comparisonValue)
                    : comparisonValue,
                },
              });
            }
          },
        );
        return prev;
      }, []);
      if (basePropertiesMatchQuery.length) {
        matchQueryArr.push(
          basePropertiesMatchQuery.length > 1
            ? { $and: basePropertiesMatchQuery }
            : basePropertiesMatchQuery[0],
        );
      }
    }

    if (getProductsDTO.customProperties) {
      const customPropertiesMatchQuery = Object.entries(
        getProductsDTO.customProperties,
      ).reduce((prev, curr) => {
        const customPropertyId = curr[0];
        Object.entries(curr[1]).forEach(
          ([comparisonOperator, comparisonValue]) => {
            prev.push({
              productProps: {
                $elemMatch: {
                  $and: [
                    { productTypePropertyId: { $eq: customPropertyId } },
                    { value: { [comparisonOperator]: comparisonValue } },
                  ],
                },
              },
            });
          },
        );
        return prev;
      }, []);
      if (customPropertiesMatchQuery.length) {
        matchQueryArr.push(
          customPropertiesMatchQuery.length > 1
            ? { $and: customPropertiesMatchQuery }
            : customPropertiesMatchQuery[0],
        );
      }
    }

    const aggregate: PipelineStage[] = [];

    if (matchQueryArr.length) {
      aggregate.push({
        $match:
          matchQueryArr.length > 1 ? { $and: matchQueryArr } : matchQueryArr[0],
      });
    }

    aggregate.push(
      {
        $lookup: {
          from: 'brands',
          localField: 'brand',
          foreignField: '_id',
          as: 'brand',
        },
      },
      { $unwind: { path: '$brand', preserveNullAndEmptyArrays: true } },
    );

    if (getProductsDTO.sort) {
      const sortOperator = { $sort: {} },
        sort = getProductsDTO.sort.property;
      sortOperator['$sort'][sort] = getProductsDTO.sort.direction;
      aggregate.push(sortOperator);
    }

    if (getProductsDTO.preview) {
      aggregate.push(
        { $unset: ['productTypeId', 'productProps'] },
        {
          $lookup: {
            from: 'categories',
            localField: 'categoryId',
            foreignField: '_id',
            as: 'categoryId',
          },
        },
        {
          $addFields: {
            categoryName: '$categoryId.name',
            categoryHandle: '$categoryId.handle',
          },
        },
        {
          $unwind: { path: '$categoryName', preserveNullAndEmptyArrays: true },
        },
        {
          $unwind: {
            path: '$categoryHandle',
            preserveNullAndEmptyArrays: true,
          },
        },
        { $unset: 'categoryId' },
      );
    }

    paginate(aggregate, page, limit);

    return this.productModel
      .aggregate([...aggregate])
      .exec()
      .then((items) => items[0]);
  }

  private toObjectId(value: GetProductsComparisonValue): ObjectId | ObjectId[] {
    if (Array.isArray(value)) {
      return value.map((item) => new ObjectId(item));
    }
    value = value.toString();
    return new ObjectId(value);
  }
}
