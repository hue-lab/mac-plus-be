class SeoImage {
  imageName: string;
  imageAlt: string;
}

export class SeoDTO {
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  seoAuthor?: string;
  seoImageAlt?: string;
  seoUrl?: string;
  seoImage?: SeoImage[];
}
