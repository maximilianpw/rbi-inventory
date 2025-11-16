import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { ErrorResponseDto } from '../common/dto/error-response.dto';
import { MessageResponseDto } from '../common/dto/message-response.dto';
import { ClerkAuthGuard } from '../common/guards/clerk-auth.guard';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(ClerkAuthGuard)
@Controller('api/v1/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({
    summary: 'List all users',
    description: 'Retrieves all users in the system',
    operationId: 'listUsers',
  })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
    type: [UserResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: ErrorResponseDto,
  })
  findAll(): UserResponseDto[] {
    return this.usersService.findAll();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create user',
    description: 'Creates a new user in the system',
    operationId: 'createUser',
  })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request body',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: ErrorResponseDto,
  })
  create(@Body() createUserDto: CreateUserDto): UserResponseDto {
    return this.usersService.create(createUserDto);
  }

  @Get('search')
  @ApiOperation({
    summary: 'Search users by name',
    description: 'Searches for users by name (partial match)',
    operationId: 'searchUsers',
  })
  @ApiQuery({
    name: 'q',
    required: true,
    type: String,
    description: 'Search query',
  })
  @ApiResponse({
    status: 200,
    description: 'Search results',
    type: [UserResponseDto],
  })
  @ApiResponse({
    status: 400,
    description: 'Missing search query',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: ErrorResponseDto,
  })
  search(@Query('q') query: string): UserResponseDto[] {
    if (!query) {
      throw new BadRequestException('Search query is required');
    }
    return this.usersService.search(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get user by ID',
    description: 'Retrieves a specific user by UUID',
    operationId: 'getUser',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'User UUID',
  })
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid UUID format',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: ErrorResponseDto,
  })
  findOne(@Param('id') id: string): UserResponseDto {
    const user = this.usersService.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update user',
    description: 'Updates an existing user',
    operationId: 'updateUser',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'User UUID',
  })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: ErrorResponseDto,
  })
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): UserResponseDto {
    const user = this.usersService.update(id, updateUserDto);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete user',
    description: 'Deletes a user from the system',
    operationId: 'deleteUser',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'User UUID',
  })
  @ApiResponse({
    status: 200,
    description: 'User deleted successfully',
    type: MessageResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid UUID format',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: ErrorResponseDto,
  })
  remove(@Param('id') id: string): MessageResponseDto {
    const success = this.usersService.remove(id);
    if (!success) {
      throw new NotFoundException('User not found');
    }
    return { message: 'User deleted successfully' };
  }
}
