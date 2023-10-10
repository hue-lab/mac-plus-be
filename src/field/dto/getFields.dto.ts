import { IsNotEmpty, IsString } from "class-validator";

export class GetFieldsDto {
  @IsNotEmpty()
  @IsString()
  code: string;
}
