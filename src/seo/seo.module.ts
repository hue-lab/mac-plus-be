import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { SeoService } from "./seo.service";
import { SeoSchema } from "./schema/seo.schema";
import { SeoController } from "./seo.controller";

@Module({
  imports: [
    MongooseModule.forFeature([
      {name: 'Seo', schema: SeoSchema}
    ])
  ],
  providers: [SeoService],
  controllers: [SeoController],
})
export class SeoModule {}
