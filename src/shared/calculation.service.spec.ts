import { BadRequestException } from '@nestjs/common';
import { CalculationService } from './calculation.service';

describe('CalculationService cart normalization', () => {
  const service = new CalculationService(null as any, null as any, null as any);
  const productId = '64f0b3d9b9c9a8a2b7d7e001';

  it('sums duplicate product ids', () => {
    expect(
      service.normalizeCartItems([
        { productId, count: 1 },
        { productId, count: 2 },
      ]),
    ).toEqual([{ productId, count: 3 }]);
  });

  it('rejects an empty cart', () => {
    expect(() => service.normalizeCartItems([])).toThrow(BadRequestException);
  });

  it('rejects invalid counts', () => {
    expect(() =>
      service.normalizeCartItems([{ productId, count: 0 }]),
    ).toThrow(BadRequestException);
    expect(() =>
      service.normalizeCartItems([{ productId, count: 1.5 }]),
    ).toThrow(BadRequestException);
  });
});
