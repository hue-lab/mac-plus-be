import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from '../category/schema/category.schema';
import { ProductDocument } from './schema/product.schema';
import { ProductTypeDocument } from './productType/schema/productType.schema';
import { ProductTypePropertyDocument } from './productTypeProperty/schema/ProductTypeProperty.schema';

export interface CatalogueRoute {
  sourcePath: string;
  publicPath: string;
  canonicalPath: string;
  indexable: boolean;
}

type ProductRow = Pick<ProductDocument, '_id' | 'categoryId' | 'productTypeId' | 'productProps' | 'seo'>;
type TypeRow = Pick<ProductTypeDocument, 'canonicalColorProperty' | 'canonicalVariantProperties'> & {
  properties: unknown[];
};
type VariantRule = { color: string; required: string[] };

const INDEX_TTL = 5 * 60 * 1000;

function normalizedValue(value: unknown): string | undefined {
  if (typeof value === 'boolean' || typeof value === 'number') return String(value);
  if (typeof value === 'string') return value.normalize('NFKC').trim().toLowerCase() || undefined;
  if (Array.isArray(value) && value.length) {
    const values = value.map(normalizedValue);
    if (values.every(Boolean)) return JSON.stringify([...new Set(values)].sort());
  }
}

@Injectable()
export class CatalogueSeoService {
  private routes?: Map<string, CatalogueRoute>;
  private refresh?: Promise<Map<string, CatalogueRoute>>;
  private expires = 0;

  constructor(
    @InjectModel('Category') private readonly categories: Model<CategoryDocument>,
    @InjectModel('Product') private readonly products: Model<ProductDocument>,
    @InjectModel('ProductType') private readonly types: Model<ProductTypeDocument>,
    @InjectModel('ProductTypeProperty')
    private readonly properties: Model<ProductTypePropertyDocument>,
  ) {}

  async find(path: string) {
    const routes = await this.getRoutes();
    return routes.get(path) || routes.get(path.toLowerCase());
  }

  async indexablePaths() {
    const routes = await this.getRoutes();
    return [...new Set([...routes.values()].filter((route) =>
      route.indexable &&
      route.publicPath === route.canonicalPath &&
      route.publicPath === route.publicPath.toLowerCase(),
    ).map((route) => route.publicPath))].sort();
  }

  async publicTree(tree: Category): Promise<Category> {
    const routes = await this.getRoutes();
    const update = (category: Category): Category => ({
      ...category,
      handle: routes.get(category.handle)?.publicPath || category.handle,
      children: (category.children || []).map(update),
    });
    return update(tree);
  }

  private async getRoutes() {
    if (this.routes && Date.now() < this.expires) return this.routes;
    if (!this.refresh) {
      this.refresh = this.buildRoutes().then((routes) => {
        this.routes = routes;
        this.expires = Date.now() + INDEX_TTL;
        return routes;
      }).finally(() => { this.refresh = undefined; });
    }
    return this.refresh;
  }

  private async buildRoutes() {
    const [categories, products, types, properties] = await Promise.all([
      this.categories.find({}, 'handle root isHidden children variantCanonicals', { autopopulate: false }).lean().exec(),
      this.products.find({}, 'categoryId productTypeId productProps seo.seoUrl').sort({ _id: 1 }).lean().exec(),
      this.types.find({},
        'canonicalColorProperty canonicalVariantProperties properties').lean().exec(),
      this.properties.find({
        $or: [{ groupVariants: true }, { code: { $in: ['color', 'memory'] } }],
      }, 'code groupVariants').lean().exec(),
    ]);
    const byCategory = new Map<string, ProductRow[]>();
    for (const product of products) {
      const category = String(product.categoryId);
      const group = byCategory.get(category) || [];
      group.push(product);
      byCategory.set(category, group);
    }
    const propertiesById = new Map(properties.map(({ _id, ...property }) => [String(_id), property]));
    const rulesByType = new Map(types.map((type) => [String(type._id), this.variantRule(type, propertiesById)]));
    const routes = new Map<string, CatalogueRoute>();
    const categoriesById = new Map(categories.map((category) => [String(category._id), category]));
    const parents = new Map<string, string | null>();
    for (const category of categories) {
      if (category.root || !category.handle) continue;
      for (const child of category.children || []) {
        const id = String(child);
        if (id === String(category._id)) continue;
        parents.set(id, parents.has(id) ? null : category.handle);
      }
    }

    const hasProducts = (id: string, visited = new Set<string>()): boolean => {
      const category = categoriesById.get(id);
      if (!category || category.isHidden || visited.has(id)) return false;
      visited.add(id);
      return !!byCategory.get(id)?.length ||
        (category.children || []).some((child) => hasProducts(String(child), visited));
    };
    const publicCandidates = new Map<CatalogueRoute, { path: string; category?: CatalogueRoute }>();
    const addRoute = (path: string, publicPath: string, indexable: boolean, category?: CatalogueRoute) => {
      if (!path || routes.has(path)) return;
      const route = { sourcePath: path, publicPath: path, canonicalPath: path, indexable };
      routes.set(path, route);
      publicCandidates.set(route, { path: publicPath.toLowerCase(), category });
    };
    const categoryPaths = new Map<string, string>();
    for (const category of categories) {
      if (category.root || !category.handle) continue;
      const id = String(category._id);
      const parent = parents.get(id);
      const path = parent && !category.handle.includes('/')
        ? `${parent}/${category.handle}`
        : category.handle;
      categoryPaths.set(id, path);
      addRoute(category.handle, path, hasProducts(id));
    }
    for (const category of categories) {
      const id = String(category._id);
      for (const product of byCategory.get(id) || []) {
        if (product.seo?.seoUrl) addRoute(
          [category.handle, product.seo.seoUrl].filter(Boolean).join('/'),
          [categoryPaths.get(id) || category.handle, product.seo.seoUrl].filter(Boolean).join('/'),
          !category.isHidden,
          routes.get(category.handle),
        );
      }
    }

    const byLowercase = new Map<string, CatalogueRoute[]>();
    for (const [route, { path }] of publicCandidates) {
      for (const key of new Set([route.sourcePath.toLowerCase(), path])) {
        const matches = byLowercase.get(key) || [];
        matches.push(route);
        byLowercase.set(key, matches);
      }
    }
    for (const [route, candidate] of publicCandidates) {
      const legacy = route.sourcePath.toLowerCase();
      const path = candidate.category &&
        candidate.category.publicPath !== publicCandidates.get(candidate.category)?.path
        ? legacy
        : candidate.path;
      if (byLowercase.get(path)?.length !== 1) continue;
      route.publicPath = path;
      route.canonicalPath = path;
      routes.set(path, route);
      if (byLowercase.get(legacy)?.length === 1) routes.set(legacy, route);
    }
    for (const category of categories) {
      const categoryRoute = routes.get(category.handle);
      const siblings = byCategory.get(String(category._id));
      const enabled = category.variantCanonicals ?? Boolean(parents.get(String(category._id)));
      if (!enabled || !categoryRoute?.indexable || !siblings || siblings.length < 2) continue;
      const productTypeId = siblings[0].productTypeId;
      if (!productTypeId || siblings.some((product) => product.productTypeId !== productTypeId)) continue;
      const rule = rulesByType.get(productTypeId);
      if (rule) this.applyVariantCanonicals(categoryRoute, siblings, rule, routes);
    }
    return routes;
  }

  private variantRule(
    type: TypeRow,
    properties: Map<string, { code?: string; groupVariants?: boolean }>,
  ): VariantRule | undefined {
    const ids = [...new Set((type.properties || []).map(String))];
    const detected = ids.filter((id) => properties.get(id)?.code === 'color');
    const color = type.canonicalColorProperty || (detected.length === 1 ? detected[0] : undefined);
    if (!color || !ids.includes(color)) return;
    const required = [...new Set([
      ...(type.canonicalVariantProperties || []).filter((id) => ids.includes(id) && id !== color),
      ...ids.filter((id) => id !== color &&
        (properties.get(id)?.groupVariants || properties.get(id)?.code === 'memory')),
    ])];
    return { color, required };
  }

  private applyVariantCanonicals(
    category: CatalogueRoute,
    products: ProductRow[],
    { color, required }: VariantRule,
    routes: Map<string, CatalogueRoute>,
  ) {
    const groups = new Map<string, { color: string; route: CatalogueRoute }[]>();
    const known = new Set(products.flatMap((product) => (product.productProps || [])
      .map((prop) => String(prop.productTypePropertyId))));
    const requiredValues = required.filter((id) => known.has(id));
    const slugs = new Map<string, number>();
    for (const product of products) {
      const slug = product.seo?.seoUrl?.toLowerCase();
      if (slug) slugs.set(slug, (slugs.get(slug) || 0) + 1);
    }
    for (const product of products) {
      const slug = product.seo?.seoUrl;
      if (!slug || slugs.get(slug.toLowerCase()) !== 1) continue;
      const route = routes.get(`${category.sourcePath}/${slug}`);
      const values = new Map((product.productProps || []).map((prop) => [
        String(prop.productTypePropertyId), normalizedValue(prop.value),
      ]));
      const colorValue = values.get(color);
      if (!route || !colorValue || requiredValues.some((id) => values.get(id) === undefined)) continue;
      values.delete(color);
      const signature = [...values].sort(([a], [b]) => a.localeCompare(b));
      const key = JSON.stringify(signature);
      const group = groups.get(key) || [];
      group.push({ color: colorValue, route });
      groups.set(key, group);
    }
    const keepConfiguration = groups.size > 1 || [...groups.values()].flat().length !== products.length;
    for (const group of groups.values()) {
      if (new Set(group.map((entry) => entry.color)).size < 2) continue;
      const variants = keepConfiguration ? group.slice(1) : group;
      for (const entry of variants) entry.route.canonicalPath = category.publicPath;
    }
  }
}
