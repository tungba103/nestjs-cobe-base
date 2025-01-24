import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
} from '@nestjs/common';
import { ServiceCategoriesService } from './service-categories.service';
import { CreateServiceCategoryDto } from './dto/create-service-category.dto';
import { UpdateServiceCategoryDto } from './dto/update-service-category.dto';
import { ApiTags } from '@nestjs/swagger';
import { AuthClaims, Permissions } from '@n-decorators';
import { FilterServiceCategoryDto } from './dto/filter-service-category.dto';
import { PermissionNameType } from '@n-constants';

@Controller('service-categories')
@ApiTags('Service Category')
@AuthClaims()
export class ServiceCategoriesController {
  constructor(
    private readonly serviceCategoriesService: ServiceCategoriesService,
  ) {}

  @Post()
  @Permissions(PermissionNameType.CREATE_SERVICE)
  create(@Body() createServiceCategoryDto: CreateServiceCategoryDto) {
    return this.serviceCategoriesService.create(createServiceCategoryDto);
  }

  @Get()
  @Permissions(PermissionNameType.GET_SERVICES)
  findAll(@Query() filter?: FilterServiceCategoryDto) {
    return this.serviceCategoriesService.getListServiceCategories(filter);
  }

  @Get(':id')
  @Permissions(PermissionNameType.GET_SERVICE)
  findOne(@Param('id') id: string) {
    return this.serviceCategoriesService.findOne(+id);
  }

  @Patch(':id')
  @Permissions(PermissionNameType.UPDATE_SERVICE)
  update(
    @Param('id') id: string,
    @Body() updateServiceCategoryDto: UpdateServiceCategoryDto,
  ) {
    return this.serviceCategoriesService.update(+id, updateServiceCategoryDto);
  }
}
