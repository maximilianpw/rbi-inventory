import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

@Injectable()
export class UsersService {
  private users: UserResponseDto[] = [];

  findAll(): UserResponseDto[] {
    return this.users;
  }

  findOne(id: string): UserResponseDto | undefined {
    return this.users.find((user) => user.id === id);
  }

  search(query: string): UserResponseDto[] {
    return this.users.filter((user) =>
      user.name.toLowerCase().includes(query.toLowerCase()),
    );
  }

  create(createUserDto: CreateUserDto): UserResponseDto {
    const user: UserResponseDto = {
      id: uuidv4(),
      ...createUserDto,
      is_active: true,
      last_login: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.users.push(user);
    return user;
  }

  update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): UserResponseDto | undefined {
    const index = this.users.findIndex((user) => user.id === id);
    if (index === -1) return undefined;

    this.users[index] = {
      ...this.users[index],
      ...updateUserDto,
      updated_at: new Date().toISOString(),
    };
    return this.users[index];
  }

  remove(id: string): boolean {
    const index = this.users.findIndex((user) => user.id === id);
    if (index === -1) return false;
    this.users.splice(index, 1);
    return true;
  }
}
