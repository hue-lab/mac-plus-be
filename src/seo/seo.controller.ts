import { Body, Controller, Delete, Get, NotFoundException, Param, Post, Query, UseGuards } from "@nestjs/common";
import { SeoService } from './seo.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { SeoByUrlDto, SeoDto } from './dto/seo.dto';
import { IdValidationPipe } from '../helpers/pipes/idValidation.pipe';
import { SeoResponseDTO } from './dto/seoResponse.dto';
import { SeoDocument } from './schema/seo.schema';

@Controller('seo')
export class SeoController {
  constructor(private seoService: SeoService) {}

  @Get()
  async getAllSeo(): Promise<SeoResponseDTO | SeoDocument[]> {
    return this.seoService.getAllSeo();
  }

  @Get('item')
  async getSeoByUrl(@Query() seoByUrlDto: SeoByUrlDto): Promise<SeoDocument | unknown> {
    return this.seoService.getSeoByUrl(seoByUrlDto.url);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async setSeo(@Body() seoDTO: SeoDto): Promise<SeoDocument> {
    if (!seoDTO.id) {
      return await this.seoService.createSeo(seoDTO);
    }
    return await this.seoService.updateSeo(seoDTO);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async deleteSeo(@Param('id', IdValidationPipe) id: string): Promise<SeoDocument> {
    const seo = await this.seoService.deleteSeo(id);
    if (!seo) throw new NotFoundException('Seo does not exist');
    return seo;
  }
}
