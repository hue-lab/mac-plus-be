import {Body, Controller, Get, Post, Request, UseGuards, UsePipes, ValidationPipe} from '@nestjs/common';
import {UserService} from 'src/user/user.service';
import {AuthService} from './auth.service';
import {Roles} from './decorators/roles.decorator';
import {Role} from './enums/role.enum';
import {RolesGuard} from './guards/roles.guard';
import {CreateUserDTO} from "../user/dto/create-user-dto";
import {LocalAuthGuard} from "./guards/local.guard";
import {JwtAuthGuard} from "./guards/jwt.guard";
import {CurrentUser} from "../user/decorators/user.decorator";

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService, private userService: UserService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @UsePipes(new ValidationPipe())
  @Post('/register')
  async register(@Body() createUserDTO: CreateUserDTO) {
    return await this.userService.addUser(createUserDTO);
  }

  @UseGuards(LocalAuthGuard)
  @UsePipes(new ValidationPipe())
  @Post('/login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.User)
  @Get('/user')
  getProfile(@Request() req) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Get('/admin')
  getDashboard(@Request() req) {
    return req.user;
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.User)
  async getCurrentUser(
    @CurrentUser() currentUser) {
    return this.authService.getCurrentUser(currentUser)
  }
}
