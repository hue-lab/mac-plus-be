import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage } from 'mongoose';
import { Article, ArticleDocument } from './schema/article.schema';
import { ArticleDTO } from './dto/article.dto';
import { FilterArticleDTO } from './dto/filterArticle.dto.';
import { paginate } from '../helpers/functions/paginate.func';

@Injectable()
export class ArticleService {
  constructor(
    @InjectModel('Article')
    private readonly articleModel: Model<ArticleDocument>,
  ) {}

  async getArticles(filterArticleDTO: FilterArticleDTO) {
    const page: number = parseInt(filterArticleDTO.page as any) || 1;
    const limit: number = parseInt(String(filterArticleDTO.limit)) || 10;

    if (!filterArticleDTO) {
      return this.articleModel.find().exec();
    }
    const aggregate: PipelineStage[] = [];
    if (filterArticleDTO.search && filterArticleDTO.search !== '') {
      aggregate.push({
        $match: {
          $or: [
            { title: new RegExp(filterArticleDTO.search.toString(), 'i') },
            {
              description: new RegExp(filterArticleDTO.search.toString(), 'i'),
            },
            { content: new RegExp(filterArticleDTO.search.toString(), 'i') },
            { tags: new RegExp(filterArticleDTO.search.toString(), 'i') },
            {
              seo: {
                seoTitle: new RegExp(filterArticleDTO.search.toString(), 'i'),
                seoDescription: new RegExp(
                  filterArticleDTO.search.toString(),
                  'i',
                ),
                seoKeywords: new RegExp(
                  filterArticleDTO.search.toString(),
                  'i',
                ),
                seoAuthor: new RegExp(filterArticleDTO.search.toString(), 'i'),
              },
            },
          ],
        },
      });
    }

    aggregate.push({ $sort: { createdAt: -1 } });

    if (filterArticleDTO.preview) {
      aggregate.push({ $unset: ['content'] });
    }

    if (filterArticleDTO.tags) {
      const tags = filterArticleDTO.tags.split(',');
      aggregate.push({
        $match: {
          tags: { $all: tags },
        },
      });
    }

    if (filterArticleDTO.seo) {
      if (filterArticleDTO.seo.seoTitle) {
        const seoTitle: string[] = filterArticleDTO.seo.seoTitle.split(' ');
        aggregate.push({
          $match: {
            seo: {
              seoTitle: { $all: seoTitle },
            },
          },
        });
      }
      if (filterArticleDTO.seo.seoDescription) {
        const seoDescription: string[] =
          filterArticleDTO.seo.seoDescription.split(',');
        aggregate.push({
          $match: {
            seo: {
              seoDescription: { $all: seoDescription },
            },
          },
        });
      }
      if (filterArticleDTO.seo.seoKeywords) {
        const seoKeywords: string[] = filterArticleDTO.seo.seoKeywords;
        aggregate.push({
          $match: {
            seo: {
              seoKeywords: { $all: seoKeywords },
            },
          },
        });
      }
      if (filterArticleDTO.seo.seoAuthor) {
        const seoAuthor: string[] = filterArticleDTO.seo.seoAuthor.split(' ');
        aggregate.push({
          $match: {
            seo: {
              seoAuthor: { $all: seoAuthor },
            },
          },
        });
      }
    }

    paginate(aggregate, page, limit);

    return this.articleModel
      .aggregate([...aggregate])
      .exec()
      .then((items) => items[0]);
  }

  async getArticle(id: string, slug = false): Promise<Article> {
    if (slug) {
      console.log(id);
      return this.articleModel.findOne({ "seo.seoUrl": id }).exec();
    }
    return this.articleModel.findById(id);
  }

  async addArticle(articleDto: ArticleDTO): Promise<Article> {
    const newArticle = await this.articleModel.create(articleDto);
    return newArticle.save();
  }

  async updateArticle(id: string, articleDto: ArticleDTO): Promise<Article> {
    return this.articleModel.findByIdAndUpdate(id, articleDto, { new: true });
  }

  async deleteArticle(id: string) {
    return this.articleModel.findByIdAndRemove(id);
  }
}
