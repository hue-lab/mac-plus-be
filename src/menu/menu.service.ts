import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Menu } from './schema/menu.schema';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';

@Injectable()
export class MenuService {
  constructor(@InjectModel('Menu') private readonly menuModel: Model<Menu>) {}

  async getMenus(): Promise<Menu[]> {
    return await this.menuModel.find().exec();
  }

  async getMenusTree(): Promise<Menu> {
    return await this.menuModel.findOne({ root: true }).exec();
  }

  async getMenuById(menuId: string): Promise<Menu> {
    return await this.menuModel.findById(menuId).exec();
  }

  async initialMenu(): Promise<Menu> {
    const initialMenu = await this.menuModel.create({
      name: 'Меню',
      handle: 'root',
      description: null,
      media: [],
      children: [],
      productTypeId: null,
      root: true,
    });
    return initialMenu.save();
  }

  async createMenu(createMenuDto: CreateMenuDto): Promise<Menu> {
    const rootMenu = await this.menuModel.findOne({ root: true });
    if (createMenuDto.root && rootMenu) {
      throw new HttpException(
        'Root menu already exists',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!createMenuDto.root && !rootMenu) {
      throw new HttpException('Root menu not found', HttpStatus.NOT_FOUND);
    }
    const newMenu = await this.menuModel.create(createMenuDto);
    return newMenu.save().then(async (res) => {
      if (!createMenuDto.root) {
        const parentId = createMenuDto.parent
          ? createMenuDto.parent
          : rootMenu._id.toString();
        const parentMenu = await this.menuModel.findById(parentId);
        if (!parentMenu) {
          throw new HttpException(
            'Parent menu not found',
            HttpStatus.NOT_FOUND,
          );
        }
        const parentMenuUpdateDto = this.getUpdateMenuDto(parentMenu);
        parentMenuUpdateDto.children.push(res._id.toString());
        await this.updateMenu(parentId, parentMenuUpdateDto);
      }
      return res;
    });
  }

  async moveMenu(menuId: string, toId: string): Promise<Menu[]> {
    const fromMenu = await this.menuModel.findOne({
      children: {
        $elemMatch: {
          $eq: menuId,
        },
      },
    });
    const toMenu = await this.menuModel.findById(toId);
    if (!fromMenu || !toMenu) {
      throw new HttpException(
        'From menu or to menu not found',
        HttpStatus.NOT_FOUND,
      );
    }
    const fromMenuUpdateDto = this.getUpdateMenuDto(fromMenu);
    const toMenuUpdateDto = this.getUpdateMenuDto(toMenu);
    const fromMenuChildIndex = fromMenuUpdateDto.children.indexOf(menuId);
    if (fromMenuChildIndex === -1) {
      throw new HttpException(
        `Menu with id ${menuId} not found in menu with id ${fromMenu._id.toString()}`,
        HttpStatus.NOT_FOUND,
      );
    }
    fromMenuUpdateDto.children.splice(fromMenuChildIndex, 1);
    toMenuUpdateDto.children.push(menuId);
    return Promise.all([
      this.updateMenu(fromMenu._id.toString(), fromMenuUpdateDto),
      this.updateMenu(toId, toMenuUpdateDto),
    ]);
  }

  async updateMenu(id: string, updateMenuDto: UpdateMenuDto): Promise<Menu> {
    const menu = await this.menuModel.findById(id);
    const newMenu = Object.assign(menu, updateMenuDto);
    return this.menuModel.findByIdAndUpdate(id, newMenu, { new: true });
  }

  async deleteMenu(id: string): Promise<Menu> {
    const parentMenu = await this.menuModel.findOne({
      children: {
        $elemMatch: {
          $eq: id,
        },
      },
    });
    if (parentMenu) {
      const parentMenuUpdateDto = this.getUpdateMenuDto(parentMenu);
      const parentMenuChildIndex = parentMenuUpdateDto.children.indexOf(id);
      parentMenuUpdateDto.children.splice(parentMenuChildIndex, 1);
      return this.updateMenu(
        parentMenu._id.toString(),
        parentMenuUpdateDto,
      ).then(() => {
        return this.menuModel.findByIdAndRemove(id);
      });
    } else {
      return this.menuModel.findByIdAndRemove(id);
    }
  }

  private getUpdateMenuDto({
    name,
    handle,
    description,
    media,
    children,
    productTypeId,
  }: any): UpdateMenuDto {
    return {
      name,
      handle,
      description,
      media,
      productTypeId,
      children: children.map((item) => item._id.toString()),
    };
  }
}
