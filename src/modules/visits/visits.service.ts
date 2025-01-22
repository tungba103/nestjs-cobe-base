import { Injectable } from '@nestjs/common';
import { CreateVisitDto } from './dto/create-visit.dto';
import { UpdateVisitDto } from './dto/update-visit.dto';
import { PrismaService } from 'prisma/prisma.service';
import { FilterVisitDto } from './dto/filter-visit.dto';
import { Prisma } from '@prisma/client';
import { makePaginationResponse } from 'utils';

@Injectable()
export class VisitsService {
  constructor(private prismaService: PrismaService) {}

  create(
    creatorUser: { id: number; name: string },
    createVisitDto: CreateVisitDto,
  ) {
    return this.prismaService.visit.create({
      data: {
        ...createVisitDto,
        creatorId: creatorUser.id,
        creatorName: creatorUser.name,
      },
    });
  }

  async getListVisits(filter: FilterVisitDto) {
    const [visits, total] = await Promise.all([
      this.findAll(filter),
      this.count(filter),
    ]);

    return makePaginationResponse(visits, filter.page, filter.pageSize, total);
  }

  findAll(filter: FilterVisitDto) {
    const { page, pageSize, search } = filter;
    const where: Prisma.VisitWhereInput = {
      isActive: true,
      ...(!!search && {
        OR: [
          { customer: { name: { contains: search, mode: 'insensitive' } } },
          {
            customer: {
              parentPhone: { contains: search, mode: 'insensitive' },
            },
          },
        ],
      }),
    };

    return this.prismaService.visit.findMany({
      where,
      select: {
        id: true,
        customer: true,
        status: true,
        creatorId: true,
        creatorName: true,
        createdAt: true,
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  count(filter: FilterVisitDto) {
    const { search } = filter;
    const where: Prisma.VisitWhereInput = {
      isActive: true,
      ...(!!search && {
        OR: [
          { customer: { name: { contains: search, mode: 'insensitive' } } },
          {
            customer: {
              parentPhone: { contains: search, mode: 'insensitive' },
            },
          },
        ],
      }),
    };

    return this.prismaService.visit.count({ where });
  }

  findOne(id: number) {
    return this.prismaService.visit.findUnique({
      where: { id },
      include: {
        customer: true,
      },
    });
  }

  update(id: number, updateVisitDto: UpdateVisitDto) {
    return this.prismaService.visit.update({
      where: { id },
      data: updateVisitDto,
    });
  }
}
