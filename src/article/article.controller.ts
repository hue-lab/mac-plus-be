import {Body, Controller, Delete, Get, NotFoundException, Param, Post, Put, Query, UseGuards} from '@nestjs/common';
import {JwtAuthGuard} from "../auth/guards/jwt.guard";
import {RolesGuard} from "../auth/guards/roles.guard";
import {Roles} from "../auth/decorators/roles.decorator";
import {Role} from "../auth/enums/role.enum";
import {IdValidationPipe} from "../helpers/pipes/idValidation.pipe";
import {ArticleService} from "./article.service";
import {Article} from "./schema/article.schema";
import {ArticleDTO} from "./dto/article.dto";
import {FilterArticleDTO} from "./dto/filterArticle.dto.";

@Controller('article')
export class ArticleController {
  constructor(private articleService: ArticleService) {
  }

  @Get()
  async getArticles(@Query() filterArticleDTO: FilterArticleDTO) {
    return this.articleService.getArticles(filterArticleDTO);
  }

  @Get(':id')
  async getArticle(@Param('id', IdValidationPipe) id: string): Promise<Article> {
    const article = await this.articleService.getArticle(id)
    if (!article) throw new NotFoundException('Article does not exist')
    return article
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async addBrand(@Body() articleDTO: ArticleDTO): Promise<Article> {
    return await this.articleService.addArticle(articleDTO)
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async updateArticle(@Param('id', IdValidationPipe) id: string, @Body() articleDTO: ArticleDTO): Promise<Article> {
    const article = await this.articleService.updateArticle(id, articleDTO);
    if (!article) throw new NotFoundException('Article does not exist!');
    return article;
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async deleteBrand(@Param('id', IdValidationPipe) id: string) {
    const article = await this.articleService.deleteArticle(id);
    if (!article) throw new NotFoundException('Article does not exist');
    return article;
  }
}
