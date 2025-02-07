import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateVisitDto } from './dto/create-visit.dto';
import { PrismaService } from 'prisma/prisma.service';
import { FilterVisitDto } from './dto/filter-visit.dto';
import { Prisma, VisitStatus } from '@prisma/client';
import { makePaginationResponse } from 'utils';
import { UpdateVisitDto } from './dto/update-visit.dto';

@Injectable()
export class VisitsService {
  constructor(private prismaService: PrismaService) {}

  async create(
    creatorUser: { id: number; name: string },
    createVisitDto: CreateVisitDto,
  ) {
    const existingVisit = await this.findLastVisitByCustomerId(
      createVisitDto.customerId,
    );

    const countByCustomer = existingVisit
      ? existingVisit.countByCustomer + 1
      : 1;

    return this.prismaService.visit.create({
      data: {
        ...createVisitDto,
        creatorId: creatorUser.id,
        creatorName: creatorUser.name,
        countByCustomer,
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
    const { page, pageSize, search, customerId } = filter;
    const where: Prisma.VisitWhereInput = {
      isActive: true,
      ...(!!customerId && { customerId }),
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
      createdAt: {
        gte: new Date(new Date().setHours(0, 0, 0, 0)),
        lte: new Date(new Date().setHours(23, 59, 59, 999)),
      },
    };

    return this.prismaService.visit.findMany({
      where,
      select: {
        id: true,
        customer: true,
        status: true,
        totalAmount: true,
        countByCustomer: true,
        creatorId: true,
        creatorName: true,
        createdAt: true,
      },
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
    });
  }

  count(filter: FilterVisitDto) {
    const { search, customerId } = filter;
    const where: Prisma.VisitWhereInput = {
      isActive: true,
      ...(!!customerId && { customerId }),
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
      createdAt: {
        gte: new Date(new Date().setHours(0, 0, 0, 0)),
        lte: new Date(new Date().setHours(23, 59, 59, 999)),
      },
    };

    return this.prismaService.visit.count({ where });
  }

  findOne(id: number) {
    return this.prismaService.visit.findUnique({
      where: { id },
      include: {
        customer: true,
        prescription: {
          include: {
            prescriptionItems: true,
          },
        },
        serviceUsage: {
          include: {
            serviceUsageItems: true,
          },
        },
      },
    });
  }

  async findLastVisitByCustomerId(customerId: number) {
    const result = await this.prismaService.visit.findFirst({
      where: { customerId },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return result;
  }

  async updateVisitInfo(visitId: number, data: UpdateVisitDto) {
    const { prescription, serviceUsage, ...rest } = data;

    const { prescriptionItems, ...prescriptionData } = prescription;
    const { serviceUsageItems, ...serviceUsageData } = serviceUsage;

    console.log('prescriptionItems', prescriptionItems);

    try {
      const updatedVisit = await this.prismaService.$transaction(async (tx) => {
        const updatePrescription = await tx.prescription.upsert({
          where: { visitId },
          update: {
            totalAmount: prescriptionData.totalAmount,
            totalDiscount: prescriptionData.totalDiscount,
            prescriptionItems: {
              deleteMany: {},
              ...(prescriptionItems?.length > 0 && {
                createMany: { data: prescriptionItems },
              }),
            },
          },
          create: {
            visitId,
            totalAmount: prescriptionData.totalAmount,
            totalDiscount: prescriptionData.totalDiscount,
            prescriptionItems: {
              ...(prescriptionItems?.length > 0 && {
                createMany: { data: prescriptionItems },
              }),
            },
          },
        });

        const updateServiceUsage = await tx.serviceUsage.upsert({
          where: { visitId },
          update: {
            totalAmount: serviceUsageData.totalAmount,
            totalDiscount: serviceUsageData.totalDiscount,
            serviceUsageItems: {
              deleteMany: {},
              ...(serviceUsageItems?.length > 0 && {
                createMany: { data: serviceUsageItems },
              }),
            },
          },
          create: {
            visitId,
            totalAmount: serviceUsageData.totalAmount,
            totalDiscount: serviceUsageData.totalDiscount,
            serviceUsageItems: {
              ...(serviceUsageItems?.length > 0 && {
                createMany: { data: serviceUsageItems },
              }),
            },
          },
        });

        const updateVisit = await tx.visit.update({
          where: { id: visitId },
          data: {
            ...rest,
            prescriptionId: updatePrescription.id,
            serviceUsageId: updateServiceUsage.id,
            status: rest.status,
            totalAmount:
              updatePrescription.totalAmount + updateServiceUsage.totalAmount,
            totalDiscount:
              updatePrescription.totalDiscount +
              updateServiceUsage.totalDiscount,
          },
          include: {
            prescription: {
              include: {
                prescriptionItems: true,
              },
            },
            serviceUsage: {
              include: {
                serviceUsageItems: true,
              },
            },
          },
        });

        return updateVisit;
      });

      return updatedVisit;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  cancelVisit(visitId: number) {
    return this.prismaService.visit.update({
      where: { id: visitId },
      data: { status: VisitStatus.CANCELLED },
    });
  }
}
