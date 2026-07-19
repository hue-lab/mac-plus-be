import { Body, Controller, Delete, Get, NotFoundException, Param, Post, Query, UseGuards, UseInterceptors } from "@nestjs/common";
import { FieldService } from "./field.service";
import { FieldDocument } from "./schema/field.schema";
import { JwtAuthGuard } from "../auth/guards/jwt.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { Role } from "../auth/enums/role.enum";
import { FieldDTO } from "./dto/field.dto";
import { IdValidationPipe } from "../helpers/pipes/idValidation.pipe";
import { GetFieldsDto } from "./dto/getFields.dto";
import { FieldsResponseDTO } from "./dto/foeldsResponse.dto";
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';

@Controller('field')
export class FieldController {
  constructor(private fieldService: FieldService) { }

  @Get()
  async getAllFields(): Promise<FieldsResponseDTO | FieldDocument[]> {
    return this.fieldService.getFields();
  }

  @Get('object')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60_000)
  async getFields(@Query() getFieldsDTO: GetFieldsDto): Promise<FieldsResponseDTO> {
    return this.fieldService.getFieldsObject(getFieldsDTO);
  }

  @Get(':code')
  async getField(@Param('code') code: string): Promise<FieldDocument | unknown> {
    return this.fieldService.getField(code);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async addField(@Body() fieldDTO: FieldDTO): Promise<FieldDocument> {
    return await this.fieldService.setField(fieldDTO);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async deleteField(@Param('id', IdValidationPipe) id: string): Promise<FieldDocument> {
    const field = await this.fieldService.deleteField(id);
    if (!field) throw new NotFoundException('Field does not exist');
    return field;
  }
}
