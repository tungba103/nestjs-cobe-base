import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
} from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { ApiTags } from '@nestjs/swagger';
import { AuthClaims } from '@n-decorators';
import { FilterCustomerDto } from './dto/filter-customer.dto';
import { Permissions } from '@n-decorators';
import { PermissionNameType } from '@n-constants';

@Controller('customers')
@ApiTags('Customer')
@AuthClaims()
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @Permissions(PermissionNameType.CREATE_CUSTOMER)
  create(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customersService.create(createCustomerDto);
  }

  @Get()
  @Permissions(PermissionNameType.GET_CUSTOMERS)
  findAll(@Query() filter?: FilterCustomerDto) {
    return this.customersService.getListCustomers(filter);
  }

  @Get(':id')
  @Permissions(PermissionNameType.GET_CUSTOMER)
  findOne(@Param('id') id: string) {
    return this.customersService.findOne(+id);
  }

  @Patch(':id')
  @Permissions(PermissionNameType.UPDATE_CUSTOMER)
  update(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    return this.customersService.update(+id, updateCustomerDto);
  }
}
