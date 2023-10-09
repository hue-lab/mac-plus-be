import { InjectModel } from "@nestjs/mongoose";
import { FieldDocument } from "./schema/field.schema";
import { Model } from "mongoose";
import { FieldDTO } from "./dto/field.dto";

export class FieldService {
  constructor(
    @InjectModel('Field') private readonly fieldModel: Model<FieldDocument>
  ) { }

  async getField(code: string) {
    return this.fieldModel.find({ code }).exec();
  }

  async addField(fieldDto: FieldDTO) {
    const newField = await this.fieldModel.create(fieldDto);
    return newField.save();
  }
}
