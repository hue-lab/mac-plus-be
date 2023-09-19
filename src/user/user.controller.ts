import {Body, Controller, Delete, Get, Param, Put, UseGuards, HttpStatus, HttpException} from '@nestjs/common';
import {UserService} from "./user.service";
import {JwtAuthGuard} from "../auth/guards/jwt.guard";
import {User} from "./schema/user.schema";
import {Roles} from "../auth/decorators/roles.decorator";
import {Role} from "../auth/enums/role.enum";
import {CurrentUser} from "./decorators/user.decorator";
import {CreateUserDTO} from "./dto/create-user-dto";
import {RolesGuard} from "../auth/guards/roles.guard";

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async getAllUsers(): Promise<User[]> {
    return await this.userService.getAllUsers()
  }

  @Get('/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async getUserById(@Param('id') id: string): Promise<User> {
    return this.userService.getUserById(id)
  }

  @Put('/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.User)
  async updateUser(
    @Param('id') id: string,
    @CurrentUser() currentUser,
    @Body() createUserDTO: CreateUserDTO): Promise<User> {
    if (!currentUser.roles.includes(Role.Admin) && currentUser.userId !== id)
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    return this.userService.updateUser(id, currentUser, createUserDTO)
  }

  @Delete('/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.User)
  async deleteUser(
    @Param('id') id: string,
    @CurrentUser() currentUser): Promise<User> {
    if (!currentUser.roles.includes(Role.Admin) && currentUser.userId !== id)
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    return this.userService.deleteUser(id)
  }
}
