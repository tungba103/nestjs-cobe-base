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
    const existingCustomer = await this.prismaService.customer.findFirst({
      where: {
        parentPhone: createCustomerDto.parentPhone,
        name: createCustomerDto.name,
      },
    });

    if (existingCustomer) {
      throw new BadRequestException(
        'Name And Parent phone number already exists',
      );
    }

    const existingCustomer2 = await this.prismaService.customer.findFirst({
      where: {
        name: createCustomerDto.name,
        birthDate: createCustomerDto.birthDate,
      },
    });

    if (existingCustomer2) {
      throw new BadRequestException('Name And Birth Date already exists');
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

  async findAll(filter: FilterCustomerDto) {
    const { page, pageSize, search } = filter;
    const searchCondition = search
      ? `AND (LOWER(c.name) LIKE LOWER('%${search}%') OR LOWER(c.parent_phone) LIKE LOWER('%${search}%'))`
      : '';

    const query = `
      SELECT
        c.*,
        MAX(v.created_at) as latest_visit
      FROM "customers" c
      LEFT JOIN "visits" v ON c.id = v."customer_id"
      WHERE c.is_active = true ${searchCondition}
      GROUP BY c.id
      ORDER BY latest_visit DESC NULLS LAST
      LIMIT ${pageSize}
      OFFSET ${(page - 1) * pageSize}
    `;

    return this.prismaService.$queryRaw`${Prisma.raw(query)}`;
  }

  count(filter: FilterCustomerDto) {
    const { search } = filter;
    const where: Prisma.CustomerWhereInput = {
      isActive: true,
      ...(!!search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { parentPhone: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    return this.prismaService.customer.count({ where });
  }

  findOne(id: number) {
    return this.prismaService.customer.findUnique({
      where: { id },
      include: {
        visits: true,
      },
    });
  }

  async update(id: number, updateCustomerDto: UpdateCustomerDto) {
    const existingCustomer = await this.prismaService.customer.findFirst({
      where: {
        id,
      },
    });

    if (!existingCustomer) {
      throw new BadRequestException('Customer not found');
    }

    if (
      updateCustomerDto.parentPhone !== existingCustomer.parentPhone ||
      updateCustomerDto.name !== existingCustomer.name
    ) {
      const uniqueOne = await this.prismaService.customer.findFirst({
        where: {
          parentPhone:
            updateCustomerDto.parentPhone ?? existingCustomer.parentPhone,
          name: updateCustomerDto.name ?? existingCustomer.name,
        },
      });

      if (uniqueOne) {
        throw new BadRequestException(
          'Name And Parent phone number already exists',
        );
      }

      if (
        updateCustomerDto.name !== existingCustomer.name ||
        updateCustomerDto.birthDate !== existingCustomer.birthDate
      ) {
        const uniqueTwo = await this.prismaService.customer.findFirst({
          where: {
            name: updateCustomerDto.name ?? existingCustomer.name,
            birthDate:
              updateCustomerDto.birthDate ?? existingCustomer.birthDate,
          },
        });

        if (uniqueTwo) {
          throw new BadRequestException('Name And Birth Date already exists');
        }
      }
    }

    return this.prismaService.customer.update({
      where: { id },
      data: updateCustomerDto,
    });
  }
}
