import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateProductCategoryDto } from './dto/create-product-category.dto';
import { UpdateProductCategoryDto } from './dto/update-product-category.dto';
import { PrismaService } from 'prisma/prisma.service';
import { FilterProductCategoryDto } from './dto/filter-product-category.dto';
import { Prisma } from '@prisma/client';
import { convertTextToCode, makePaginationResponse } from 'utils';

@Injectable()
export class ProductCategoriesService {
  constructor(private prismaService: PrismaService) {}

  async create(createProductCategoryDto: CreateProductCategoryDto) {
    const code = convertTextToCode(createProductCategoryDto.name);

    const existingCategory =
      await this.prismaService.productCategory.findUnique({
        where: { code },
      });

    if (existingCategory) {
      throw new BadRequestException('Product category code already exists');
    }

    return this.prismaService.productCategory.create({
      data: {
        ...createProductCategoryDto,
        code,
      },
    });
  }

  async getListProductCategories(filter: FilterProductCategoryDto) {
    const [categories, total] = await Promise.all([
      this.findAll(filter),
      this.count(filter),
    ]);

    return makePaginationResponse(
      categories,
      filter.page,
      filter.pageSize,
      total,
    );
  }

  findAll(filter: FilterProductCategoryDto) {
    const { page, pageSize, search } = filter;
    const where: Prisma.ProductCategoryWhereInput = {
      isActive: true,
      ...(!!search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { code: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    return this.prismaService.productCategory.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  count(filter: FilterProductCategoryDto) {
    const { search } = filter;
    const where: Prisma.ProductCategoryWhereInput = {
      isActive: true,
      ...(!!search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { code: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    return this.prismaService.productCategory.count({ where });
  }

  findOne(id: number) {
    return this.prismaService.productCategory.findUnique({
      where: { id },
    });
  }

  async update(id: number, updateProductCategoryDto: UpdateProductCategoryDto) {
    const code = convertTextToCode(updateProductCategoryDto.name);

    const existingCategory = await this.prismaService.productCategory.findFirst(
      {
        where: {
          code,
          id: { not: id },
        },
      },
    );

    if (existingCategory) {
      throw new BadRequestException('Product category code already exists');
    }

    return this.prismaService.productCategory.update({
      where: { id },
      data: {
        ...updateProductCategoryDto,
        code,
      },
    });
  }
}
