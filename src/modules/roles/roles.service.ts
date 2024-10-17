import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { convertTextToCode, makePaginationResponse } from 'utils';
import { FilterRoleDto } from './dto/filter-role.dto';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class RolesService {
  constructor(private prismaService: PrismaService) {}
  async create(createRoleDto: CreateRoleDto) {
    const createdCode = convertTextToCode(createRoleDto.name);

    const existed = await this.findByCode(createdCode);

    if (existed) {
      throw new BadRequestException('Role existed');
    }

    const result = await this.prismaService.role.create({
      data: {
        ...createRoleDto,
        code: createdCode,
      },
    });

    return result;
  }

  async getListRoles(filter: FilterRoleDto) {
    const [roles, total] = await Promise.all([
      this.findAll(filter),
      this.count(filter),
    ]);

    return makePaginationResponse(roles, filter.page, filter.pageSize, total);
  }

  async findOne(id: number) {
    return this.findById(id);
  }

  async update(id: number, updateRoleDto: UpdateRoleDto) {
    const existed = await this.findById(id);

    if (!existed) {
      throw new BadRequestException('Role not found');
    }

    const { name, ...rest } = updateRoleDto;

    const updatedCode = convertTextToCode(name);

    const result = await this.prismaService.role.update({
      where: { id },
      data: {
        ...rest,
        code: updatedCode,
      },
    });

    return result;
  }

  // Repository methods
  async findById(id: number) {
    return this.prismaService.role.findUnique({
      where: { id },
    });
  }

  async findByCode(code: string) {
    return this.prismaService.role.findUnique({
      where: { code },
    });
  }

  private whereCondition(filter: FilterRoleDto): Prisma.RoleWhereInput {
    const { search } = filter;
    const code = search ? convertTextToCode(search) : null;

    if (!code) {
      return {};
    }

    return {
      OR: [
        {
          code: {
            contains: code,
            mode: 'insensitive',
          },
        },
      ],
    };
  }

  async findAll(filter: FilterRoleDto) {
    const { page, pageSize } = filter;
    const whereCondition = this.whereCondition(filter);

    const roles = await this.prismaService.role.findMany({
      where: whereCondition,
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    return roles;
  }

  async count(filter: FilterRoleDto) {
    const whereCondition = this.whereCondition(filter);
    const count = await this.prismaService.role.count({
      where: whereCondition,
    });
    return count;
  }
}
