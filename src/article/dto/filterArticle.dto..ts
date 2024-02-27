import { SeoDTO } from '../../shared/dto/seo.dto';

export class FilterArticleDTO {
  search: string;
  tags: string;
  isSlide?: string;
  hidden?: string;
  sort: string;
  asc: number;
  preview: boolean;
  limit: number;
  page: number;
  seo?: SeoDTO;
}
