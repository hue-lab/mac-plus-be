import { IsArray, IsEmail, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { Role } from '../../auth/enums/role.enum';

export class CreateUserDTO {
  @IsNotEmpty()
  readonly username: string;

  @IsOptional()
  @IsEmail()
  readonly email?: string;

  @IsNotEmpty()
  password: string;

  @IsOptional()
  @IsArray()
  @IsEnum(Role, { each: true })
  readonly roles?: Role[];
}
