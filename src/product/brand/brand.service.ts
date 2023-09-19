import {Injectable} from '@nestjs/common';
import {Model} from 'mongoose';
import {InjectModel} from '@nestjs/mongoose';
import {Brand, BrandDocument} from "./schema/brand.schema";
import {BrandDTO} from "./dto/brand.dto";

@Injectable()
export class BrandService {
  constructor(
    @InjectModel('Brand') private readonly brandModel: Model<BrandDocument>
  ) { }

  async getBrands() {
    return this.brandModel.find();
  }

  async getBrand(id: string): Promise<Brand> {
    return this.brandModel.findById(id)
  }

  async addBrand(brandDto: BrandDTO): Promise<Brand> {
    const newBrand = await this.brandModel.create(brandDto)
    return newBrand.save()
  }

  async updateBrand(id: string, brandDto: BrandDTO): Promise<Brand> {
    return this.brandModel.findByIdAndUpdate(id, brandDto, {new: true});
  }

  async deleteBrand(id: string) {
    return this.brandModel.findByIdAndRemove(id)
  }
}
