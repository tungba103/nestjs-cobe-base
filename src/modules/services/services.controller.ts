import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
} from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ApiTags } from '@nestjs/swagger';
import { AuthClaims } from '@n-decorators';
import { FilterServiceDto } from './dto/filter-service.dto';
import { Permissions } from '@n-decorators';
import { PermissionNameType } from '@n-constants';

@Controller('services')
@ApiTags('Service')
@AuthClaims()
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  @Permissions(PermissionNameType.CREATE_SERVICE)
  create(@Body() createServiceDto: CreateServiceDto) {
    return this.servicesService.create(createServiceDto);
  }

  @Get()
  @Permissions(PermissionNameType.GET_SERVICES)
  findAll(@Query() filter?: FilterServiceDto) {
    return this.servicesService.getListServices(filter);
  }

  @Get(':id')
  @Permissions(PermissionNameType.GET_SERVICE)
  findOne(@Param('id') id: string) {
    return this.servicesService.findOne(+id);
  }

  @Patch(':id')
  @Permissions(PermissionNameType.UPDATE_SERVICE)
  update(@Param('id') id: string, @Body() updateServiceDto: UpdateServiceDto) {
    return this.servicesService.update(+id, updateServiceDto);
  }
}
