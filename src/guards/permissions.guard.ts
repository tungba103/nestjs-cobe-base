// guards/permissions.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionNameType } from '../constants/permissions/permission-name-type.enum';
import { PrismaService } from 'src/prisma/prisma.service';
import { ROLES_KEY } from 'src/decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<
      PermissionNameType[]
    >(ROLES_KEY, [context.getHandler(), context.getClass()]);

    if (!requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not found');
    }

    const userPermissions = await this.prisma.permission.findMany({
      where: {
        permissionRoles: {
          some: {
            role: {
              roleUsers: {
                some: {
                  userId: user.id,
                },
              },
            },
          },
        },
      },
      select: {
        code: true,
      },
    });

    const userPermissionCodes = userPermissions.map((perm) => perm.code);

    const hasPermission = requiredPermissions.some((perm) =>
      userPermissionCodes.includes(perm),
    );

    if (!hasPermission) {
      throw new ForbiddenException('You do not have the required permissions');
    }

    return true;
  }
}
