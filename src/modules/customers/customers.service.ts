import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { PrismaService } from 'prisma/prisma.service';
import { FilterCustomerDto } from './dto/filter-customer.dto';
import { Prisma } from '@prisma/client';
import { makePaginationResponse } from 'utils';

@Injectable()
export class CustomersService {
  constructor(private prismaService: PrismaService) {}

  async create(createCustomerDto: CreateCustomerDto) {
    const existingCustomer = await this.prismaService.customer.findUnique({
      where: { parentPhone: createCustomerDto.parentPhone },
    });

    if (existingCustomer) {
      throw new BadRequestException('Parent phone number already exists');
    }

    return this.prismaService.customer.create({
      data: createCustomerDto,
    });
  }

  async getListCustomers(filter: FilterCustomerDto) {
    const [customers, total] = await Promise.all([
      this.findAll(filter),
      this.count(filter),
    ]);

    return makePaginationResponse(
      customers,
      filter.page,
      filter.pageSize,
      total,
    );
  }

  findAll(filter: FilterCustomerDto) {
    const { page, pageSize, ...rest } = filter;
    const where: Prisma.CustomerWhereInput = {
      isActive: true,
      ...rest,
    };

    return this.prismaService.customer.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  count(filter: FilterCustomerDto) {
    const { page, pageSize, ...rest } = filter;
    const where: Prisma.CustomerWhereInput = {
      isActive: true,
      ...rest,
    };

    return this.prismaService.customer.count({ where });
  }

  findOne(id: number) {
    return this.prismaService.customer.findUnique({
      where: { id },
      include: {
        Visit: true,
      },
    });
  }

  async update(id: number, updateCustomerDto: UpdateCustomerDto) {
    if (updateCustomerDto.parentPhone) {
      const existingCustomer = await this.prismaService.customer.findFirst({
        where: {
          parentPhone: updateCustomerDto.parentPhone,
          id: { not: id },
        },
      });

      if (existingCustomer) {
        throw new BadRequestException('Parent phone number already exists');
      }
    }

    return this.prismaService.customer.update({
      where: { id },
      data: updateCustomerDto,
    });
  }
}
