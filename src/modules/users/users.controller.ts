import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags } from '@nestjs/swagger';
import { Permissions } from '@n-decorators';
import { PermissionNameType } from '@n-constants';
import { AuthClaims } from '@n-decorators';
import { FilterUserDto } from './dto/filter-user.dto';

@Controller('users')
@ApiTags('User')
@AuthClaims()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Permissions(PermissionNameType.CREATE_USER)
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Permissions(PermissionNameType.GET_USERS)
  findAll(@Query() filter?: FilterUserDto) {
    return this.usersService.getListUsers(filter);
  }

  @Get(':id')
  @Permissions(PermissionNameType.GET_USER)
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  @Permissions(PermissionNameType.UPDATE_USER)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }
}
