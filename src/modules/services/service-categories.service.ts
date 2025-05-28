import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateServiceCategoryDto } from './dto/create-service-category.dto';
import { UpdateServiceCategoryDto } from './dto/update-service-category.dto';
import { PrismaService } from 'prisma/prisma.service';
import { FilterServiceCategoryDto } from './dto/filter-service-category.dto';
import { Prisma } from '@prisma/client';
import { convertTextToCode, makePaginationResponse } from 'utils';

@Injectable()
export class ServiceCategoriesService {
  constructor(private prismaService: PrismaService) {}

  async create(createServiceCategoryDto: CreateServiceCategoryDto) {
    const code = convertTextToCode(createServiceCategoryDto.name);

    const existingCategory =
      await this.prismaService.serviceCategory.findUnique({
        where: { code },
      });

    if (existingCategory) {
      throw new BadRequestException('Service category code already exists');
    }

    return this.prismaService.serviceCategory.create({
      data: {
        ...createServiceCategoryDto,
        code,
      },
    });
  }

  async getListServiceCategories(filter: FilterServiceCategoryDto) {
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

  findAll(filter: FilterServiceCategoryDto) {
    const { page, pageSize, search } = filter;
    const where: Prisma.ServiceCategoryWhereInput = {
      isActive: true,
      ...(!!search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { code: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    return this.prismaService.serviceCategory.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  count(filter: FilterServiceCategoryDto) {
    const { search } = filter;
    const where: Prisma.ServiceCategoryWhereInput = {
      isActive: true,
      ...(!!search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { code: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    return this.prismaService.serviceCategory.count({ where });
  }

  findOne(id: number) {
    return this.prismaService.serviceCategory.findUnique({
      where: { id },
    });
  }

  async update(id: number, updateServiceCategoryDto: UpdateServiceCategoryDto) {
    const code = convertTextToCode(updateServiceCategoryDto.name);

    const existingCategory = await this.prismaService.serviceCategory.findFirst(
      {
        where: {
          code,
          id: { not: id },
        },
      },
    );

    if (existingCategory) {
      throw new BadRequestException('Service category code already exists');
    }

    return this.prismaService.serviceCategory.update({
      where: { id },
      data: {
        ...updateServiceCategoryDto,
        code,
      },
    });
  }
}
