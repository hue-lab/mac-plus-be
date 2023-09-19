import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {Model} from 'mongoose';
import {InjectModel} from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import {User, UserDocument} from "./schema/user.schema";
import {CreateUserDTO} from "./dto/create-user-dto";

@Injectable()
export class UserService {
  constructor(@InjectModel('User') private readonly userModel: Model<UserDocument>) { }

  async addUser(createUserDTO: CreateUserDTO): Promise<User> {
    const checkUsername = await this.getUserByName(createUserDTO.username)
    const checkEmail = createUserDTO.email ? await this.getUserByEmail(createUserDTO.email) : null

    if (checkUsername || checkEmail) {
      throw new HttpException('email or username are already taken, please choose another one', HttpStatus.UNPROCESSABLE_ENTITY);
    }

    const newUser = await this.userModel.create(createUserDTO);
    newUser.password = await bcrypt.hash(newUser.password, 10);
    return newUser.save();
  }

  async getAllUsers(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async getUserByName(username: string): Promise<User | undefined> {
    return this.userModel.findOne({username});
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.userModel.findOne({email});
  }

  async getUserById(id: string): Promise<User> {
    return this.userModel.findOne({_id: id});
  }

  async updateUser(id: string, currentUser: User, createUserDTO: CreateUserDTO): Promise<User> {
    createUserDTO.password = await bcrypt.hash(String(createUserDTO.password), 10);
    return this.userModel.findByIdAndUpdate(id, createUserDTO, {new: true});
  }

  async deleteUser(id: string): Promise<User> {
    return this.userModel.findByIdAndRemove(id)
  }
}
