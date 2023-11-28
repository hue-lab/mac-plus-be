import { FieldType } from '../enums/fieldType.enum';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class FieldDTO {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsEnum(FieldType)
  @IsNotEmpty()
  type: FieldType;

  @IsString()
  @IsNotEmpty()
  label: string;

  @IsNotEmpty()
  value: string | string[];
}
