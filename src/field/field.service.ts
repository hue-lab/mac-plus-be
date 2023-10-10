import { InjectModel } from "@nestjs/mongoose";
import { FieldDocument } from "./schema/field.schema";
import { Model } from "mongoose";
import { FieldDTO } from "./dto/field.dto";
import { GetFieldsDto } from "./dto/getFields.dto";
import { FieldsResponseDTO } from "./dto/foeldsResponse.dto";

export class FieldService {
  constructor(
    @InjectModel('Field') private readonly fieldModel: Model<FieldDocument>
  ) { }

  async getFields(): Promise<FieldDocument[]> {
    return this.fieldModel.find().exec();
  }

  async getFieldsObject(getFieldsDTO: GetFieldsDto): Promise<FieldsResponseDTO> {
    const fieldsCodes: string[] = getFieldsDTO.code.split(',');
    const fields: FieldDocument[] = await this.fieldModel.aggregate([
      { $match: { "code": { $in: fieldsCodes } } }
    ]);
    return fields.reduce((acc, curr) => {
      acc[curr.code] = curr.value;
      return acc;
    }, {});
  }

  async getField(code: string): Promise<FieldDocument | unknown> {
    return this.fieldModel.findOne({ code }).exec();
  }

  async setField(fieldDto: FieldDTO): Promise<FieldDocument> {
    const foundField = await this.fieldModel.findOne({code: fieldDto.code}).exec();
    if (foundField) {
      return  this.fieldModel.findByIdAndUpdate(foundField._id.toString(), fieldDto, { new: true });
    }
    const newField = await this.fieldModel.create(fieldDto);
    return newField.save();
  }

  async deleteField(id: string): Promise<FieldDocument> {
    return this.fieldModel.findByIdAndDelete(id);
  }
}
