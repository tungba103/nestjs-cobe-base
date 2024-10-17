import { PermissionNameType, PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash1 = await bcrypt.hash('123456', 10);
  const passwordHash2 = await bcrypt.hash('thaonhi', 10);

  const user1 = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      name: 'Admin',
      password: passwordHash1,
    },
  });

  const user2 = await prisma.user.upsert({
    where: { username: 'thaonhi' },
    update: {},
    create: {
      username: 'thaonhi',
      name: 'Phòng khám Thảo Nhi',
      password: passwordHash2,
    },
  });

  const permissions: PermissionNameType[] = Object.values(PermissionNameType);

  const permissionRecords = await Promise.all(
    permissions.map((code) =>
      prisma.permission.upsert({
        where: { code },
        update: {},
        create: {
          code,
          name: code,
          description: `Permission for ${code}`,
        },
      }),
    ),
  );

  const adminRole = await prisma.role.upsert({
    where: { code: 'ADMIN' },
    update: {},
    create: {
      code: 'ADMIN',
      name: 'Administrator',
      description: 'Admin role with full permissions',
    },
  });

  const userRole = await prisma.role.upsert({
    where: { code: 'USER' },
    update: {},
    create: {
      code: 'USER',
      name: 'User',
      description: 'User role with limited permissions',
    },
  });

  await prisma.rolesOnPermissions.createMany({
    data: permissionRecords.map((perm) => ({
      roleId: adminRole.id,
      permissionId: perm.id,
    })),
    skipDuplicates: true, // Bỏ qua nếu đã tồn tại
  });

  const limitedPermissions = permissionRecords.filter((perm) =>
    ['GET_USER', 'GET_USERS', 'GET_ROLE', 'GET_ROLES'].includes(perm.code),
  );

  await prisma.rolesOnPermissions.createMany({
    data: limitedPermissions.map((perm) => ({
      roleId: userRole.id,
      permissionId: perm.id,
    })),
    skipDuplicates: true,
  });

  await prisma.usersOnRoles.createMany({
    data: [
      {
        userId: user1.id,
        roleId: adminRole.id,
      },
      {
        userId: user2.id,
        roleId: adminRole.id,
        // roleId: userRole.id,
      },
    ],
    skipDuplicates: true,
  });

  console.log({
    user1,
    user2,
    adminRole,
    userRole,
    permissions: permissionRecords,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
