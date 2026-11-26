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
type VariantRule = { color?: string; dimensions: string[] };

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
        $or: [{ groupVariants: true }, { code: 'memory' }],
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

    const hasProducts = (id: string, visited = new Set<string>()): boolean => {
      const category = categoriesById.get(id);
      if (!category || category.isHidden || visited.has(id)) return false;
      visited.add(id);
      return !!byCategory.get(id)?.length ||
        (category.children || []).some((child) => hasProducts(String(child), visited));
    };
    const addRoute = (path: string, indexable: boolean) => {
      if (!path || routes.has(path)) return;
      routes.set(path, { sourcePath: path, publicPath: path, canonicalPath: path, indexable });
    };
    for (const category of categories) {
      if (!category.root) addRoute(category.handle, hasProducts(String(category._id)));
    }
    for (const category of categories) {
      for (const product of byCategory.get(String(category._id)) || []) {
        if (product.seo?.seoUrl) addRoute(
          [category.handle, product.seo.seoUrl].filter(Boolean).join('/'),
          !category.isHidden,
        );
      }
    }

    const byLowercase = new Map<string, CatalogueRoute[]>();
    for (const route of routes.values()) {
      const lowercase = route.sourcePath.toLowerCase();
      const matches = byLowercase.get(lowercase) || [];
      matches.push(route);
      byLowercase.set(lowercase, matches);
    }
    for (const [lowercase, matches] of byLowercase) {
      if (matches.length !== 1) continue;
      matches[0].publicPath = lowercase;
      matches[0].canonicalPath = lowercase;
      routes.set(lowercase, matches[0]);
    }
    for (const category of categories) {
      const categoryRoute = routes.get(category.handle);
      const siblings = byCategory.get(String(category._id));
      if (!category.variantCanonicals || !categoryRoute?.indexable || !siblings || siblings.length < 2) continue;
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
    const marked = ids.filter((id) => properties.get(id)?.groupVariants);

    const color = type.canonicalColorProperty;
    if (!marked.length && color) {
      const dimensions = type.canonicalVariantProperties || [];
      if (ids.includes(color) && dimensions.every((id) => id !== color && ids.includes(id))) {
        return { color, dimensions };
      }
      return;
    }

    const memory = ids.filter((id) => properties.get(id)?.code === 'memory');
    if (memory.length === 1 && properties.get(memory[0])?.groupVariants === undefined) {
      marked.push(memory[0]);
    }
    return marked.length ? { dimensions: marked } : undefined;
  }

  private applyVariantCanonicals(
    category: CatalogueRoute,
    products: ProductRow[],
    { color, dimensions }: VariantRule,
    routes: Map<string, CatalogueRoute>,
  ) {
    const groups = new Map<string, { color?: string; route: CatalogueRoute }[]>();
    const seen = new Set<CatalogueRoute>();
    for (const product of products) {
      const slug = product.seo?.seoUrl;
      const route = slug && routes.get(`${category.sourcePath}/${slug}`);
      const values = new Map((product.productProps || []).map((prop) => [
        String(prop.productTypePropertyId), normalizedValue(prop.value),
      ]));
      const colorValue = color ? values.get(color) : undefined;
      const signature = dimensions.map((id) => values.get(id));
      if (!route || (color && !colorValue) || signature.some((value) => value === undefined) || seen.has(route)) return;
      seen.add(route);
      const key = JSON.stringify(signature);
      const group = groups.get(key) || [];
      group.push({ color: colorValue, route });
      groups.set(key, group);
    }
    for (const group of groups.values()) {
      const variants = color ? new Set(group.map((entry) => entry.color)).size : group.length;
      if (variants < 2) continue;
      const target = groups.size === 1 ? category.publicPath : group[0].route.publicPath;
      for (const entry of group) entry.route.canonicalPath = target;
    }
  }
}
