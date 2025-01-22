import { Gender, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const MOCK_CUSTOMERS = [
  {
    name: 'Nguyễn Văn Nam',
    gender: Gender.MALE,
    birthDate: new Date('2010-05-14'),
    parentName: 'Nguyễn Văn An',
    parentPhone: '0987654321',
    address: 'Số 12, Đường Lê Lợi, Thành phố Sơn La, Sơn La, Việt Nam',
  },
  {
    name: 'Trần Thị Hoa',
    gender: Gender.FEMALE,
    birthDate: new Date('2005-07-21'),
    parentName: 'Trần Văn Bình',
    parentPhone: '0912345678',
    address: 'Số 56, Đường Hùng Vương, Thành phố Sơn La, Sơn La, Việt Nam',
  },
  {
    name: 'Phạm Quốc Hưng',
    gender: Gender.MALE,
    birthDate: new Date('2012-03-11'),
    parentName: 'Phạm Văn Hòa',
    parentPhone: '0909876543',
    address: 'Số 23, Đường Quang Trung, Huyện Mộc Châu, Sơn La, Việt Nam',
  },
  {
    name: 'Lê Thị Minh',
    gender: Gender.FEMALE,
    birthDate: new Date('2008-08-19'),
    parentName: 'Lê Văn Lợi',
    parentPhone: '0921345678',
    address: 'Số 45, Đường Trần Phú, Huyện Thuận Châu, Sơn La, Việt Nam',
  },
  {
    name: 'Hoàng Văn Kiên',
    gender: Gender.MALE,
    birthDate: new Date('2003-09-02'),
    parentName: 'Hoàng Văn Đức',
    parentPhone: '0967654321',
    address: 'Số 78, Đường Nguyễn Huệ, Thành phố Sơn La, Sơn La, Việt Nam',
  },
  {
    name: 'Đặng Thị Lan',
    gender: Gender.FEMALE,
    birthDate: new Date('2007-01-15'),
    parentName: 'Đặng Văn Tài',
    parentPhone: '0975432109',
    address: 'Số 34, Đường Lý Thường Kiệt, Huyện Sông Mã, Sơn La, Việt Nam',
  },
  {
    name: 'Bùi Văn Long',
    gender: Gender.MALE,
    birthDate: new Date('2011-12-24'),
    parentName: 'Bùi Văn Hiệp',
    parentPhone: '0932165478',
    address: 'Số 89, Đường Hòa Bình, Huyện Phù Yên, Sơn La, Việt Nam',
  },
  {
    name: 'Ngô Thị Cúc',
    gender: Gender.FEMALE,
    birthDate: new Date('2009-04-05'),
    parentName: 'Ngô Văn Tuấn',
    parentPhone: '0943216789',
    address: 'Số 67, Đường Phan Chu Trinh, Huyện Quỳnh Nhai, Sơn La, Việt Nam',
  },
  {
    name: 'Đỗ Văn Hải',
    gender: Gender.MALE,
    birthDate: new Date('2006-06-17'),
    parentName: 'Đỗ Văn Thắng',
    parentPhone: '0954321678',
    address: 'Số 12, Đường Đinh Tiên Hoàng, Thành phố Sơn La, Sơn La, Việt Nam',
  },
  {
    name: 'Vũ Thị Hằng',
    gender: Gender.FEMALE,
    birthDate: new Date('2002-11-30'),
    parentName: 'Vũ Văn Bình',
    parentPhone: '0912340987',
    address: 'Số 21, Đường Hoàng Văn Thụ, Huyện Yên Châu, Sơn La, Việt Nam',
  },
  {
    name: 'Cao Văn Đức',
    gender: Gender.MALE,
    birthDate: new Date('2013-02-28'),
    parentName: 'Cao Văn Nam',
    parentPhone: '0932154876',
    address: 'Số 33, Đường Trường Chinh, Huyện Mai Sơn, Sơn La, Việt Nam',
  },
  {
    name: 'Lý Thị Thu',
    gender: Gender.FEMALE,
    birthDate: new Date('2004-10-09'),
    parentName: 'Lý Văn Khánh',
    parentPhone: '0943126589',
    address: 'Số 19, Đường Kim Đồng, Huyện Mường La, Sơn La, Việt Nam',
  },
  {
    name: 'Trương Văn Lâm',
    gender: Gender.MALE,
    birthDate: new Date('2001-01-01'),
    parentName: 'Trương Văn Tuấn',
    parentPhone: '0967543210',
    address:
      'Số 55, Đường Nguyễn Chí Thanh, Thành phố Sơn La, Sơn La, Việt Nam',
  },
  {
    name: 'Hồ Thị Ngọc',
    gender: Gender.FEMALE,
    birthDate: new Date('2010-07-14'),
    parentName: 'Hồ Văn Hùng',
    parentPhone: '0976423158',
    address: 'Số 76, Đường Tô Hiệu, Huyện Bắc Yên, Sơn La, Việt Nam',
  },
  {
    name: 'Lương Văn Sơn',
    gender: Gender.MALE,
    birthDate: new Date('2000-12-18'),
    parentName: 'Lương Văn Huy',
    parentPhone: '0912345671',
    address: 'Số 87, Đường Trần Hưng Đạo, Thành phố Sơn La, Sơn La, Việt Nam',
  },
  {
    name: 'Phùng Thị Hà',
    gender: Gender.FEMALE,
    birthDate: new Date('2003-05-29'),
    parentName: 'Phùng Văn Thành',
    parentPhone: '0921346754',
    address: 'Số 42, Đường Lạc Long Quân, Huyện Mộc Châu, Sơn La, Việt Nam',
  },
  {
    name: 'Nguyễn Văn Khoa',
    gender: Gender.MALE,
    birthDate: new Date('2012-03-12'),
    parentName: 'Nguyễn Văn Hoàng',
    parentPhone: '0943216743',
    address: 'Số 11, Đường Đinh Công Tráng, Huyện Mai Sơn, Sơn La, Việt Nam',
  },
  {
    name: 'Trần Thị Nguyệt',
    gender: Gender.FEMALE,
    birthDate: new Date('2009-09-21'),
    parentName: 'Trần Văn Hà',
    parentPhone: '0912349876',
    address: 'Số 78, Đường Trần Quốc Toản, Huyện Thuận Châu, Sơn La, Việt Nam',
  },
  {
    name: 'Lê Văn Bảo',
    gender: Gender.MALE,
    birthDate: new Date('2007-06-10'),
    parentName: 'Lê Văn Dũng',
    parentPhone: '0932175643',
    address: 'Số 67, Đường Phạm Ngũ Lão, Thành phố Sơn La, Sơn La, Việt Nam',
  },
  {
    name: 'Hoàng Thị Mai',
    gender: Gender.FEMALE,
    birthDate: new Date('2011-08-16'),
    parentName: 'Hoàng Văn Lâm',
    parentPhone: '0921346578',
    address: 'Số 56, Đường Trưng Trắc, Huyện Yên Châu, Sơn La, Việt Nam',
  },
];
async function main() {
  const customers = await prisma.customer.findMany();

  if (customers.length > 0) {
    console.log('Customers already seeded');
    return;
  }

  const createdCustomers = await prisma.customer.createMany({
    data: MOCK_CUSTOMERS,
  });

  console.log('Seed customers successfully:', createdCustomers);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
