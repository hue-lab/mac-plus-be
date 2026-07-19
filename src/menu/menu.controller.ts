import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { MenuService } from './menu.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../auth/enums/role.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { IdValidationPipe } from '../helpers/pipes/idValidation.pipe';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { Menu } from './schema/menu.schema';
import { CreateMenuDto } from './dto/create-menu.dto';
import { MoveMenuDto } from './dto/move-menu.dto';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';

@Controller('store/menu')
export class MenuController {
  constructor(private menuService: MenuService) {}

  @Get('/')
  async getMenus(): Promise<Menu[]> {
    return await this.menuService.getMenus();
  }

  @Get('/tree')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60_000)
  async getMenusTree(): Promise<Menu> {
    const menusTree = await this.menuService.getMenusTree();
    if (!menusTree) throw new NotFoundException('Root menu not found');
    return menusTree;
  }

  @Post('/')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async createMenu(@Body() createMenuDto: CreateMenuDto): Promise<Menu> {
    return this.menuService.createMenu(createMenuDto);
  }

  @Get('/:code')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60_000)
  async getMenuByCode(@Param('code') code: string): Promise<Menu> {
    const menu = await this.menuService.getMenuByCode(code);
    if (!menu) throw new NotFoundException('Menu does not exist!');
    return menu;
  }

  @Get('/by/:id')
  async getMenuById(@Param('id', IdValidationPipe) id: string): Promise<Menu> {
    const menu = await this.menuService.getMenuById(id);
    if (!menu) throw new NotFoundException('Menu does not exist!');
    return menu;
  }

  @Post('/initial')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async initialMenu(): Promise<Menu> {
    return this.menuService.initialMenu();
  }

  @Put('/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async updateMenu(
    @Param('id', IdValidationPipe) id: string,
    @Body() updateMenuDto: UpdateMenuDto,
  ): Promise<Menu> {
    const menu = await this.menuService.updateMenu(id, updateMenuDto);
    if (!menu) throw new NotFoundException('Menu does not exist!');
    return menu;
  }

  @Patch('/move')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async moveMenu(@Body() moveMenuDto: MoveMenuDto): Promise<Menu[]> {
    return await this.menuService.moveMenu(
      moveMenuDto.menuId,
      moveMenuDto.toId,
    );
  }

  @Delete('/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async deleteMenu(@Param('id', IdValidationPipe) id: string): Promise<Menu> {
    const menu = await this.menuService.deleteMenu(id);
    if (!menu) throw new NotFoundException('Menu does not exist!');
    return menu;
  }
}
