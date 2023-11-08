class SeoImageAlt {
  imageName: string;
  imageAlt: string;
}

export class SeoDTO {
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  seoAuthor?: string;
  seoUrl?: string;
  seoImageAlt?: SeoImageAlt;
}
