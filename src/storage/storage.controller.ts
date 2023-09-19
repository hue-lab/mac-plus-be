import {
  Controller, Delete, Get,
  HttpException, HttpStatus, Param,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import {JwtAuthGuard} from "../auth/guards/jwt.guard";
import {RolesGuard} from "../auth/guards/roles.guard";
import {Roles} from "../auth/decorators/roles.decorator";
import {Role} from "../auth/enums/role.enum";
import {FilesInterceptor} from "@nestjs/platform-express";
import {StorageService} from "./storage.service";
import {DeleteDTO} from "./dto/delete.dto";

@Controller('storage')
export class StorageController {
  constructor(private storageService: StorageService) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @UseInterceptors(FilesInterceptor('image'))
  async uploadFile(@UploadedFiles() files: Express.Multer.File[]) {
    const isImages = files.every(i => i.mimetype.includes('image'))
    if (isImages) return this.storageService.convertAndSave(files)
    throw new HttpException('Only image allow', HttpStatus.FORBIDDEN)
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async getStorage() {
    return this.storageService.getStorage()
  }

  @Delete(':folder/:name')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async deleteFile(@Param() deleteDTO: DeleteDTO) {
    return this.storageService.deleteFile(deleteDTO)
  }
}
