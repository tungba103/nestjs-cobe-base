import { Injectable } from '@nestjs/common';
import { CreateVisitDto } from './dto/create-visit.dto';
import { PrismaService } from 'prisma/prisma.service';
import { FilterVisitDto } from './dto/filter-visit.dto';
import { Prisma } from '@prisma/client';
import { makePaginationResponse } from 'utils';
import { UpdateVisitDto } from './dto/update-visit.dto';

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
    };

    return this.prismaService.visit.findMany({
      where,
      select: {
        id: true,
        customer: true,
        status: true,
        totalAmount: true,
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
            PrescriptionItem: true,
          },
        },
        serviceUsage: {
          include: {
            ServiceUsageItem: true,
          },
        },
      },
    });
  }

  async updateVisitInfo(visitId: number, data: UpdateVisitDto) {
    const { prescription, serviceUsage, ...rest } = data;

    const { prescriptionItems, ...prescriptionData } = prescription;
    const { serviceUsageItems, ...serviceUsageData } = serviceUsage;

    const upsertPrescription = await this.upsertPrescription(
      visitId,
      {
        ...prescriptionData,
        visitId,
      },
      prescriptionItems,
    );
    const upsertServiceUsage = await this.upsertServiceUsage(
      visitId,
      {
        ...serviceUsageData,
        visitId,
      },
      serviceUsageItems,
    );

    return this.prismaService.visit.update({
      where: { id: visitId },
      data: {
        ...rest,
        prescriptionId: upsertPrescription.id,
        serviceUsageId: upsertServiceUsage.id,
      },
    });
  }

  updateVisit(id: number, data: Prisma.VisitUpdateInput) {
    return this.prismaService.visit.update({
      where: { id },
      data,
    });
  }

  upsertPrescription(
    visitId: number,
    prescription: Prisma.PrescriptionUncheckedCreateInput,
    prescriptionItems: Prisma.PrescriptionItemUncheckedCreateWithoutPrescriptionInput[],
  ) {
    return this.prismaService.prescription.upsert({
      where: { visitId },
      update: {
        ...prescription,
        PrescriptionItem: {
          deleteMany: {},
          createMany: { data: prescriptionItems },
        },
      },
      create: {
        visitId,
        ...prescription,
        PrescriptionItem: {
          createMany: { data: prescriptionItems },
        },
      },
    });
  }

  upsertServiceUsage(
    visitId: number,
    serviceUsage: Prisma.ServiceUsageUncheckedCreateInput,
    serviceUsageItems: Prisma.ServiceUsageItemUncheckedCreateWithoutServiceUsageInput[],
  ) {
    return this.prismaService.serviceUsage.upsert({
      where: { visitId },
      update: {
        ...serviceUsage,
        ServiceUsageItem: {
          deleteMany: {},
          createMany: { data: serviceUsageItems },
        },
      },
      create: {
        visitId,
        ...serviceUsage,
        ServiceUsageItem: {
          createMany: { data: serviceUsageItems },
        },
      },
    });
  }
}
