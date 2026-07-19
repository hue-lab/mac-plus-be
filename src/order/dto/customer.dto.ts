import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CustomerDTO {
  @IsString()
  @IsNotEmpty()
  @MinLength(7)
  @MaxLength(16)
  @Matches(/^\+\d{7,15}$/)
  phone: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  email?: string;
}
