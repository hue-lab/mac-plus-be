import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SeoDto } from './dto/seo.dto';
import { SeoDocument } from './schema/seo.schema';

export class SeoService {
  constructor(
    @InjectModel('Seo') private readonly seoModel: Model<SeoDocument>,
  ) {}

  async getAllSeo(): Promise<SeoDocument[]> {
    return this.seoModel.find().exec();
  }

  async getSeoByUrl(url: string): Promise<SeoDocument | unknown> {
    return this.seoModel.findOne({ url }).exec();
  }

  async createSeo(seoDto: SeoDto): Promise<SeoDocument> {
    const newSeo = await this.seoModel.create(seoDto);
    return newSeo.save();
  }

  async updateSeo(seoDto: SeoDto): Promise<SeoDocument> {
    return this.seoModel.findByIdAndUpdate(seoDto.id, seoDto, {
      new: true,
    });
  }

  async deleteSeo(id: string): Promise<SeoDocument> {
    return this.seoModel.findByIdAndDelete(id);
  }
}
