import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { PrismaService } from 'prisma/prisma.service';
import { FilterServiceDto } from './dto/filter-service.dto';
import { Prisma } from '@prisma/client';
import { convertTextToCode, makePaginationResponse } from 'utils';

@Injectable()
export class ServicesService {
  constructor(private prismaService: PrismaService) {}

  async create(createServiceDto: CreateServiceDto) {
    const code = convertTextToCode(createServiceDto.name);

    const existingService = await this.prismaService.service.findUnique({
      where: { code },
    });

    if (existingService) {
      throw new BadRequestException('Service code already exists');
    }

    return this.prismaService.service.create({
      data: {
        ...createServiceDto,
        code,
      },
    });
  }

  async getListServices(filter: FilterServiceDto) {
    const [services, total] = await Promise.all([
      this.findAll(filter),
      this.count(filter),
    ]);

    return makePaginationResponse(
      services,
      filter.page,
      filter.pageSize,
      total,
    );
  }

  findAll(filter: FilterServiceDto) {
    const { page, pageSize, search } = filter;
    const where: Prisma.ServiceWhereInput = {
      isActive: true,
      ...(!!search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { code: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    return this.prismaService.service.findMany({
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
        serviceCategory: true,
      },
    });
  }

  count(filter: FilterServiceDto) {
    const { search } = filter;
    const where: Prisma.ServiceWhereInput = {
      isActive: true,
      ...(!!search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { code: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    return this.prismaService.service.count({ where });
  }

  findOne(id: number) {
    return this.prismaService.service.findUnique({
      where: { id },
      include: {
        serviceCategory: true,
      },
    });
  }

  async update(id: number, updateServiceDto: UpdateServiceDto) {
    const code = convertTextToCode(updateServiceDto.name);

    const existingService = await this.prismaService.service.findFirst({
      where: {
        code,
        id: { not: id },
      },
    });

    if (existingService) {
      throw new BadRequestException('Service code already exists');
    }

    return this.prismaService.service.update({
      where: { id },
      data: updateServiceDto,
    });
  }
}
