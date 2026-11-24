import { CatalogueSeoService } from './catalogue-seo.service';

const category = { _id: 'model', handle: 'iPhone-duo', variantCanonicals: true };
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

function makeService(products: ReturnType<typeof sku>[], categories = [category]) {
  const model = (data: object[]) => {
    const query = { sort: jest.fn(), lean: jest.fn(), exec: jest.fn().mockResolvedValue(data) };
    query.sort.mockReturnValue(query);
    query.lean.mockReturnValue(query);
    return { find: jest.fn().mockReturnValue(query) };
  };
  return new CatalogueSeoService(model(categories) as never, model(products) as never, model([type]) as never);
}

describe('catalogue SEO routes', () => {
  it('uses one stable SKU per configuration and gives the sitemap the same URLs', async () => {
    const service = makeService([
      sku('001', 'Black', '256 GB', 'eSIM'),
      sku('002', 'Blue', '256 GB', ' esim '),
      sku('003', 'Blue', '512 GB', 'eSIM'),
      sku('004', 'Black', '256 GB', 'Dual SIM'),
    ]);
    expect(await service.find('iPhone-duo/002')).toMatchObject({
      publicPath: 'iphone-duo/002',
      canonicalPath: 'iphone-duo/001',
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
});
