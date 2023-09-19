import { Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post, Put, UseGuards } from '@nestjs/common';
import { CategoryService } from "./category.service";
import { JwtAuthGuard } from "../auth/guards/jwt.guard";
import { Category } from "./schema/category.schema";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Role } from "../auth/enums/role.enum";
import { Roles } from "../auth/decorators/roles.decorator";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { IdValidationPipe } from "../helpers/pipes/idValidation.pipe";
import { MoveCategoryDto } from "./dto/move-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";

@Controller('store/category')
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @Get('/')
  async getCategories(): Promise<Category[]> {
    return await this.categoryService.getCategories()
  }

  @Get('/tree')
  async getCategoriesTree(): Promise<Category> {
    const categoriesTree = await this.categoryService.getCategoriesTree()
    if (!categoriesTree) throw new NotFoundException('Root category not found')
    return categoriesTree
  }

  @Post('/')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async createCategory(@Body() createCategoryDto: CreateCategoryDto): Promise<Category> {
    return this.categoryService.createCategory(createCategoryDto);
  }

  @Put('/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async updateCategory(@Param('id', IdValidationPipe) id: string, @Body() updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    const category = await this.categoryService.updateCategory(id, updateCategoryDto)
    if (!category) throw new NotFoundException('Category does not exist!')
    return category;
  }

  @Patch('/move')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async moveCategory(@Body() moveCategoryDto: MoveCategoryDto): Promise<Category[]> {
    return await this.categoryService.moveCategory(
        moveCategoryDto.categoryId,
        moveCategoryDto.toId,
    );
  }

  @Delete('/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async deleteCategory(@Param('id', IdValidationPipe) id: string): Promise<Category> {
    const category = await this.categoryService.deleteCategory(id)
    if (!category) throw new NotFoundException('Category does not exist!')
    return category
  }
}
