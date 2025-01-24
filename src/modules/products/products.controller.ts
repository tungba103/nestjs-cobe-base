import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ApiTags } from '@nestjs/swagger';
import { AuthClaims } from '@n-decorators';
import { FilterProductDto } from './dto/filter-product.dto';
import { Permissions } from '@n-decorators';
import { PermissionNameType } from '@n-constants';

@Controller('products')
@ApiTags('Product')
@AuthClaims()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Permissions(PermissionNameType.CREATE_PRODUCT)
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @Permissions(PermissionNameType.GET_PRODUCTS)
  findAll(@Query() filter?: FilterProductDto) {
    return this.productsService.getListProducts(filter);
  }

  @Get(':id')
  @Permissions(PermissionNameType.GET_PRODUCT)
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

  @Patch(':id')
  @Permissions(PermissionNameType.UPDATE_PRODUCT)
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(+id, updateProductDto);
  }
}
