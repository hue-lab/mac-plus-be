import { SeoDTO } from '../../shared/dto/seo.dto';

export class FilterArticleDTO {
  search: string;
  tags: string;
  isSlide?: boolean;
  hidden?: boolean;
  sort: string;
  asc: number;
  preview: boolean;
  limit: number;
  page: number;
  seo?: SeoDTO;
}
