import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { FieldSchema } from "./schema/field.schema";
import { FieldController } from "./field.controller";
import { FieldService } from "./field.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      {name: 'Field', schema: FieldSchema}
    ])
  ],
  providers: [FieldService],
  controllers: [FieldController]
})
export class FieldModule {}
