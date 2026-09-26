import { Model, UpdateWithAggregationPipeline } from 'mongoose';

// Whitespace and slashes around a slug end up in storefront URLs as
// "/category/slug/" vs "/category/slug" and break the slug lookup.
const SEO_URL_EDGE_CHARS = ' /\t\n\r';
const SEO_URL_EDGE_REGEX = /^[\s/]+|[\s/]+$/g;

export function normalizeSeoUrl(seoUrl?: string): string | undefined {
  return typeof seoUrl === 'string'
    ? seoUrl.replace(SEO_URL_EDGE_REGEX, '')
    : seoUrl;
}

export function normalizeSeo<T extends { seo?: { seoUrl?: string } }>(
  dto: T,
): T {
  if (dto?.seo && typeof dto.seo.seoUrl === 'string') {
    dto.seo.seoUrl = normalizeSeoUrl(dto.seo.seoUrl);
  }
  return dto;
}

// Idempotent cleanup of already stored slugs.
export async function normalizeStoredSeoUrls(
  model: Model<any>,
): Promise<number> {
  const update: UpdateWithAggregationPipeline = [
    {
      $set: {
        'seo.seoUrl': {
          $trim: { input: '$seo.seoUrl', chars: SEO_URL_EDGE_CHARS },
        },
      },
    },
  ];
  const result = await model.updateMany(
    { 'seo.seoUrl': { $regex: '^[\\s/]|[\\s/]$' } },
    update,
  );
  return result.modifiedCount;
}
