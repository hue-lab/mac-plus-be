import { CatalogueSeoService } from './catalogue-seo.service';

type CategoryFixture = {
  _id: string;
  handle: string;
  children?: string[];
  variantCanonicals?: boolean;
};
const category: CategoryFixture = { _id: 'model', handle: 'iPhone-duo', variantCanonicals: true };
const type = {
  _id: 'phone',
  properties: ['colour', 'memory', 'sim'],
  canonicalColorProperty: 'colour',
  canonicalVariantProperties: ['memory', 'sim'],
};

function sku(id: string, colour: string, memory: string, sim?: string) {
  return {
    _id: id,
    categoryId: category._id,
    productTypeId: type._id,
    seo: { seoUrl: id },
    productProps: [
      { productTypePropertyId: 'colour', value: colour },
      { productTypePropertyId: 'memory', value: memory },
      ...(sim ? [{ productTypePropertyId: 'sim', value: sim }] : []),
    ],
  };
}

const catalogueProperties: { _id: string; code?: string; groupVariants?: boolean }[] = [
  { _id: 'colour', code: 'color' },
  { _id: 'memory', code: 'memory' },
];
const automaticType = { _id: type._id, properties: type.properties };

function makeService(
  products: ReturnType<typeof sku>[],
  categories = [category],
  typeConfig: typeof automaticType = type,
  properties = catalogueProperties,
) {
  const model = (data: object[]) => {
    const query = { sort: jest.fn(), lean: jest.fn(), exec: jest.fn().mockResolvedValue(data) };
    query.sort.mockReturnValue(query);
    query.lean.mockReturnValue(query);
    return { find: jest.fn().mockReturnValue(query) };
  };
  return new CatalogueSeoService(
    model(categories) as never,
    model(products) as never,
    model([typeConfig]) as never,
    model(properties) as never,
  );
}

describe('catalogue SEO routes', () => {
  it('automatically groups by the existing memory property without a SIM setting', async () => {
    const service = makeService([
      sku('001', 'Black', '256 GB'),
      sku('002', 'Blue', '256 GB'),
      sku('003', 'Black', '512 GB'),
      sku('004', 'Blue', '512 GB'),
    ], [category], automaticType);
    expect(await service.find('iphone-duo/002')).toMatchObject({ canonicalPath: 'iphone-duo' });
    expect(await service.find('iphone-duo/004')).toMatchObject({ canonicalPath: 'iphone-duo' });
    expect(await service.indexablePaths()).toEqual(['iphone-duo', 'iphone-duo/001', 'iphone-duo/003']);
  });

  it('combines marked characteristics and groups only the enabled category', async () => {
    const products = [
      sku('001', 'Black', '256 GB', 'M5'),
      sku('002', 'Blue', '256 GB', 'M5'),
      sku('003', 'Black', '256 GB', 'M5 Pro'),
      sku('004', 'Blue', '256 GB', 'M5 Pro'),
    ];
    const service = makeService([
      ...products,
      ...products.map((product) => ({ ...product, categoryId: 'accessories' })),
    ], [
      category,
      { _id: 'accessories', handle: 'accessories', variantCanonicals: false },
    ], automaticType, [
      { _id: 'colour', code: 'color' },
      { _id: 'memory', code: 'memory', groupVariants: true },
      { _id: 'sim', groupVariants: true },
    ]);

    expect(await service.find('iphone-duo/002')).toMatchObject({ canonicalPath: 'iphone-duo' });
    expect(await service.find('iphone-duo/004')).toMatchObject({ canonicalPath: 'iphone-duo' });
    expect(await service.find('accessories/002')).toMatchObject({ canonicalPath: 'accessories/002' });
  });

  it('does not guess an automatic rule if the product type has no color code', async () => {
    const service = makeService([
      sku('001', 'Black', '256 GB'),
      sku('002', 'Blue', '256 GB'),
    ], [category], automaticType, [{ _id: 'memory', code: 'memory' }]);
    expect(await service.find('iphone-duo/002')).toMatchObject({ canonicalPath: 'iphone-duo/002' });
  });

  it('uses one stable SKU per configuration and gives the sitemap the same URLs', async () => {
    const service = makeService([
      sku('001', 'Black', '256 GB', 'eSIM'),
      sku('002', 'Blue', '256 GB', ' esim '),
      sku('003', 'Blue', '512 GB', 'eSIM'),
      sku('004', 'Black', '256 GB', 'Dual SIM'),
    ]);
    expect(await service.find('iPhone-duo/002')).toMatchObject({
      publicPath: 'iphone-duo/002',
      canonicalPath: 'iphone-duo',
    });
    expect(await service.indexablePaths()).toEqual([
      'iphone-duo', 'iphone-duo/001', 'iphone-duo/003', 'iphone-duo/004',
    ]);
  });

  it('points SKUs at the model when color is the only difference', async () => {
    const service = makeService([
      sku('001', 'Black', '256 GB', 'eSIM'),
      sku('002', 'Blue', '256 GB', 'eSIM'),
    ]);
    expect(await service.indexablePaths()).toEqual(['iphone-duo']);
    expect(await service.find('iphone-duo/001')).toMatchObject({ canonicalPath: 'iphone-duo' });
  });

  it('keeps SKU pages independent when data is incomplete or grouping is disabled', async () => {
    const complete = sku('001', 'Black', '256 GB', 'eSIM');
    const incomplete = sku('002', 'Blue', '256 GB');
    const service = makeService([complete, incomplete]);
    expect(await service.find('iphone-duo/001')).toMatchObject({ canonicalPath: 'iphone-duo/001' });

    const disabled = makeService([complete, sku('002', 'Blue', '256 GB', 'eSIM')], [
      { ...category, variantCanonicals: false },
    ]);
    expect(await disabled.find('iphone-duo/002')).toMatchObject({ canonicalPath: 'iphone-duo/002' });
  });

  it('keeps case-sensitive routes distinct if their lowercase paths collide', async () => {
    const service = makeService([sku('001', 'Black', '256 GB', 'eSIM')], [
      category, { _id: 'other', handle: 'iphone-duo', variantCanonicals: false },
    ]);
    expect(await service.find('iPhone-duo')).toMatchObject({ publicPath: 'iPhone-duo' });
    expect(await service.find('iphone-duo')).toMatchObject({ publicPath: 'iphone-duo' });
  });

  it('moves model and SKU paths together and exposes the new addresses throughout the catalogue', async () => {
    const model = { _id: 'model', handle: 'iPhone-duo' };
    const section = { _id: 'section', handle: 'iphone', children: ['model'] };
    const service = makeService([
      sku('001', 'Black', '256 GB'),
      sku('002', 'Blue', '256 GB'),
    ], [model, section], automaticType);
    expect(await service.find('iPhone-duo')).toMatchObject({
      sourcePath: 'iPhone-duo', publicPath: 'iphone/iphone-duo',
    });
    expect(await service.find('iPhone-duo/001')).toMatchObject({
      sourcePath: 'iPhone-duo/001', publicPath: 'iphone/iphone-duo/001',
    });
    expect(await service.find('iphone/iphone-duo/002')).toMatchObject({
      sourcePath: 'iPhone-duo/002', canonicalPath: 'iphone/iphone-duo',
    });
    expect(await service.indexablePaths()).toEqual(['iphone', 'iphone/iphone-duo']);
    expect(await service.publicTree({ ...section, children: [model] } as never))
      .toMatchObject({ children: [{ handle: 'iphone/iphone-duo' }] });
  });

  it('preserves a model at its old address if the new path already belongs to another model', async () => {
    const model = { _id: 'model', handle: 'iphone-duo' };
    const service = makeService([sku('001', 'Black', '256 GB')], [
      model,
      { _id: 'section', handle: 'iphone', children: ['model'] },
      { _id: 'other', handle: 'iphone/iphone-duo' },
    ]);
    expect(await service.find('iphone-duo')).toMatchObject({ publicPath: 'iphone-duo' });
    expect(await service.find('iphone/iphone-duo')).toMatchObject({ sourcePath: 'iphone/iphone-duo' });
  });
});
