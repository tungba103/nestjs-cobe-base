import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'prisma/prisma.service';
import { FilterProductDto } from './dto/filter-product.dto';
import { Prisma } from '@prisma/client';
import { convertTextToCode, makePaginationResponse } from 'utils';

@Injectable()
export class ProductsService {
  constructor(private prismaService: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    const code = convertTextToCode(createProductDto.name);

    const existingProduct = await this.prismaService.product.findUnique({
      where: { code },
    });

    if (existingProduct) {
      throw new BadRequestException('Product code already exists');
    }

    return this.prismaService.product.create({
      data: {
        ...createProductDto,
        code,
      },
    });
  }

  async getListProducts(filter: FilterProductDto) {
    const [products, total] = await Promise.all([
      this.findAll(filter),
      this.count(filter),
    ]);

    return makePaginationResponse(
      products,
      filter.page,
      filter.pageSize,
      total,
    );
  }

  findAll(filter: FilterProductDto) {
    const { page, pageSize, search } = filter;
    const where: Prisma.ProductWhereInput = {
      isActive: true,
      ...(!!search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { code: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    return this.prismaService.product.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: [
        {
          status: 'asc',
        },
        {
          createdAt: 'desc',
        },
      ],
      include: {
        productCategory: true,
      },
    });
  }

  count(filter: FilterProductDto) {
    const { search } = filter;
    const where: Prisma.ProductWhereInput = {
      isActive: true,
      ...(!!search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { code: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    return this.prismaService.product.count({ where });
  }

  findOne(id: number) {
    return this.prismaService.product.findUnique({
      where: { id },
      include: {
        productCategory: true,
      },
    });
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const code = convertTextToCode(updateProductDto.name);

    const existingProduct = await this.prismaService.product.findFirst({
      where: {
        code,
        id: { not: id },
      },
    });

    if (existingProduct) {
      throw new BadRequestException('Product code already exists');
    }

    return this.prismaService.product.update({
      where: { id },
      data: updateProductDto,
    });
  }
}
