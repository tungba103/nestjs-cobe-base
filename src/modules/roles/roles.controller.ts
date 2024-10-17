import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { ApiTags } from '@nestjs/swagger';
import { AuthClaims } from 'src/decorators/claims-auth.decorator';
import { Permissions } from 'src/decorators/permissions.decorator';
import { PermissionNameType } from 'src/constants/permissions/permission-name-type.enum';
import { FilterRoleDto } from './dto/filter-role.dto';

@Controller('roles')
@ApiTags('Role')
@AuthClaims()
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @Permissions(PermissionNameType.CREATE_ROLE)
  async create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @Get()
  @Permissions(PermissionNameType.GET_ROLES)
  findAll(@Query() filter?: FilterRoleDto) {
    return this.rolesService.getListRoles(filter);
  }

  @Get(':id')
  @Permissions(PermissionNameType.GET_ROLE)
  async findOne(@Param('id') id: string) {
    return this.rolesService.findOne(+id);
  }

  @Patch(':id')
  @Permissions(PermissionNameType.UPDATE_ROLE)
  async update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.rolesService.update(+id, updateRoleDto);
  }
}
