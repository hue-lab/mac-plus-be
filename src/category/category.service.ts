import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {Category} from "./schema/category.schema";
import {CreateCategoryDto} from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";

@Injectable()
export class CategoryService {
  constructor(@InjectModel('Category') private readonly categoryModel: Model<Category>) {}

  async getCategories(): Promise<Category[]> {
    return await this.categoryModel.find().exec()
  }

  async getCategoriesTree(): Promise<Category> {
    return await this.categoryModel.findOne({ root: true }).exec()
  }

  async createCategory(createCategoryDto: CreateCategoryDto): Promise<Category>{
    const rootCategory = await this.categoryModel.findOne({ root: true })
    if (createCategoryDto.root && rootCategory) {
      throw new HttpException('Root category already exists', HttpStatus.BAD_REQUEST)
    }
    if (!createCategoryDto.root && !rootCategory) {
      throw new HttpException('Root category not found', HttpStatus.NOT_FOUND)
    }
    const newCategory = await this.categoryModel.create(createCategoryDto)
    return newCategory.save().then( async (res) => {
      if (!createCategoryDto.root) {
        const parentId = createCategoryDto.parent ? createCategoryDto.parent : rootCategory._id.toString()
        const parentCategory = await this.categoryModel.findById(parentId)
        if (!parentCategory) {
          throw new HttpException('Parent category not found', HttpStatus.NOT_FOUND)
        }
        const parentCategoryUpdateDto = this.getUpdateCategoryDto(parentCategory)
        parentCategoryUpdateDto.children.push(res._id.toString())
        await  this.updateCategory(parentId, parentCategoryUpdateDto)
      }
      return res
    })
  }

  async moveCategory(categoryId: string, toId: string): Promise<Category[]> {
    const fromCategory = await this.categoryModel.findOne({
      children: {
        $elemMatch: {
          $eq: categoryId
        }
      }
    });
    const toCategory = await  this.categoryModel.findById(toId);
    if (!fromCategory || !toCategory) {
      throw new HttpException('From category or to category not found', HttpStatus.NOT_FOUND)
    }
    const fromCategoryUpdateDto = this.getUpdateCategoryDto(fromCategory)
    const toCategoryUpdateDto = this.getUpdateCategoryDto(toCategory)
    const fromCategoryChildIndex = fromCategoryUpdateDto.children.indexOf(categoryId)
    if (fromCategoryChildIndex === -1) {
      throw new HttpException(`Category with id ${categoryId} not found in category with id ${fromCategory._id.toString()}`, HttpStatus.NOT_FOUND)
    }
    fromCategoryUpdateDto.children.splice(fromCategoryChildIndex, 1)
    toCategoryUpdateDto.children.push(categoryId)
    return Promise.all([
      this.updateCategory(fromCategory._id.toString(), fromCategoryUpdateDto),
      this.updateCategory(toId, toCategoryUpdateDto),
    ])
  }

  async updateCategory(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    const category = await this.categoryModel.findById(id)
    const newCategory = Object.assign(category, updateCategoryDto)
    return this.categoryModel.findByIdAndUpdate(id, newCategory, {new: true})
  }

  async deleteCategory(id: string): Promise<Category> {
    const parentCategory = await this.categoryModel.findOne({
      children: {
        $elemMatch: {
          $eq: id
        }
      }
    })
    if (parentCategory) {
      const parentCategoryUpdateDto = this.getUpdateCategoryDto(parentCategory)
      const parentCategoryChildIndex = parentCategoryUpdateDto.children.indexOf(id)
      parentCategoryUpdateDto.children.splice(parentCategoryChildIndex, 1)
      return this.updateCategory(parentCategory._id.toString(), parentCategoryUpdateDto).then(() => {
        return this.categoryModel.findByIdAndRemove(id)
      });
    } else {
      return this.categoryModel.findByIdAndRemove(id)
    }
  }

  private getUpdateCategoryDto({name, handle, description, media, children, productTypeId}: any): UpdateCategoryDto {
    return {
      name,
      handle,
      description,
      media,
      productTypeId,
      children: children.map(item => item._id.toString()),
    }
  }
 }
