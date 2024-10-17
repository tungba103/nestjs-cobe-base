import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'prisma/prisma.service';
import { FilterUserDto } from './dto/filter-user.dto';
import { Prisma } from '@prisma/client';
import { makePaginationResponse } from 'utils';
@Injectable()
export class UsersService {
  constructor(private prismaService: PrismaService) {}
  async create(createUserDto: CreateUserDto) {
    const { roleIds, ...userInfo } = createUserDto;
    const existed = await this.findByUsername(createUserDto.username);

    if (existed) {
      throw new BadRequestException('Username existed');
    }

    const result = await this.prismaService.user.create({
      data: {
        ...userInfo,
        UsersOnRoles: {
          connect: roleIds?.map((id) => ({ id })),
        },
      },
    });

    return result;
  }

  async getListUsers(filter: FilterUserDto) {
    const [users, total] = await Promise.all([
      this.findAll(filter),
      this.count(filter),
    ]);

    return makePaginationResponse(users, filter.page, filter.pageSize, total);
  }

  async findOne(id: number) {
    return this.findById(id);
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const existed = await this.findById(id);

    if (!existed) {
      throw new BadRequestException('User not found');
    }

    const { roleIds, ...userInfo } = updateUserDto;

    const result = await this.prismaService.user.update({
      where: { id },
      data: {
        ...userInfo,
        UsersOnRoles: {
          set: roleIds?.map((id) => ({ id })),
        },
      },
    });

    return result;
  }

  // Repository methods
  async findById(id: number) {
    return this.prismaService.user.findUnique({
      where: { id },
    });
  }

  async findByUsername(username: string, included?: { userRoles?: boolean }) {
    const isIncludedData =
      included && Object.values(included).some((value) => value === true);

    return this.prismaService.user.findUnique({
      where: { username },
      ...(isIncludedData && {
        include: {
          ...(included.userRoles && {
            UsersOnRoles: {
              include: {
                role: {
                  include: {
                    rolePermissions: {
                      include: {
                        permission: true,
                      },
                    },
                  },
                },
              },
            },
          }),
        },
      }),
    });
  }

  private whereCondition(filter: FilterUserDto): Prisma.UserWhereInput {
    const { search } = filter;

    if (!search) {
      return {};
    }

    return {
      OR: [
        {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ],
    };
  }

  async findAll(filter: FilterUserDto) {
    const { page, pageSize } = filter;
    const whereCondition = this.whereCondition(filter);

    const users = await this.prismaService.user.findMany({
      where: whereCondition,
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    return users;
  }

  async count(filter: FilterUserDto) {
    const whereCondition = this.whereCondition(filter);
    const count = await this.prismaService.user.count({
      where: whereCondition,
    });
    return count;
  }
}
