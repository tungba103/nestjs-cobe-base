import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
} from '@nestjs/common';
import { ProductCategoriesService } from './product-categories.service';
import { CreateProductCategoryDto } from './dto/create-product-category.dto';
import { UpdateProductCategoryDto } from './dto/update-product-category.dto';
import { ApiTags } from '@nestjs/swagger';
import { AuthClaims, Permissions } from '@n-decorators';
import { FilterProductCategoryDto } from './dto/filter-product-category.dto';
import { PermissionNameType } from '@n-constants';

@Controller('product-categories')
@ApiTags('Product Category')
@AuthClaims()
export class ProductCategoriesController {
  constructor(
    private readonly productCategoriesService: ProductCategoriesService,
  ) {}

  @Post()
  @Permissions(PermissionNameType.CREATE_PRODUCT)
  create(@Body() createProductCategoryDto: CreateProductCategoryDto) {
    return this.productCategoriesService.create(createProductCategoryDto);
  }

  @Get()
  @Permissions(PermissionNameType.GET_PRODUCTS)
  findAll(@Query() filter?: FilterProductCategoryDto) {
    return this.productCategoriesService.getListProductCategories(filter);
  }

  @Get(':id')
  @Permissions(PermissionNameType.GET_PRODUCT)
  findOne(@Param('id') id: string) {
    return this.productCategoriesService.findOne(+id);
  }

  @Patch(':id')
  @Permissions(PermissionNameType.UPDATE_PRODUCT)
  update(
    @Param('id') id: string,
    @Body() updateProductCategoryDto: UpdateProductCategoryDto,
  ) {
    return this.productCategoriesService.update(+id, updateProductCategoryDto);
  }
}
