import {IsEmail, IsNotEmpty, IsOptional} from "class-validator";

export class CreateUserDTO {
  @IsNotEmpty()
  readonly username: string;

  @IsOptional()
  @IsEmail()
  readonly email?: string;

  @IsNotEmpty()
  password: string;

  readonly roles: string[];
}
