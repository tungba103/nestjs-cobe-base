import { Gender, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const NUMBER_OF_RECORDS = 100;

const MOCK_CUSTOMERS = [
  ...Array.from({ length: NUMBER_OF_RECORDS }, (_, i) => ({
    name: `${['Nguyễn', 'Trần', 'Phạm', 'Lê', 'Hoàng', 'Đặng', 'Bùi', 'Ngô', 'Đỗ', 'Vũ', 'Cao', 'Lý', 'Trương', 'Hồ', 'Lương', 'Phùng'][Math.floor(Math.random() * 16)]} ${['Văn', 'Thị'][Math.floor(Math.random() * 2)]} ${['An', 'Bình', 'Hòa', 'Lợi', 'Đức', 'Tài', 'Hiệp', 'Tuấn', 'Thắng', 'Nam', 'Khánh', 'Hùng', 'Huy', 'Thành', 'Hoàng', 'Hà', 'Bảo', 'Lâm', 'Mai', 'Hương'][Math.floor(Math.random() * 20)]}`,
    gender: Math.random() > 0.5 ? Gender.MALE : Gender.FEMALE,
    birthDate: new Date(
      new Date().setFullYear(
        Math.floor(Math.random() * 20) + 2000,
        Math.floor(Math.random() * 12),
        Math.floor(Math.random() * 28) + 1,
      ),
    ),
    parentName: `${['Nguyễn', 'Trần', 'Phạm', 'Lê', 'Hoàng', 'Đặng', 'Bùi', 'Ngô', 'Đỗ', 'Vũ', 'Cao', 'Lý', 'Trương', 'Hồ', 'Lương', 'Phùng'][Math.floor(Math.random() * 16)]} ${['Văn', 'Thị'][Math.floor(Math.random() * 2)]} ${['An', 'Bình', 'Hòa', 'Lợi', 'Đức', 'Tài', 'Hiệp', 'Tuấn', 'Thắng', 'Nam', 'Khánh', 'Hùng', 'Huy', 'Thành', 'Hoàng', 'Hà', 'Bảo', 'Lâm', 'Mai', 'Hương'][Math.floor(Math.random() * 20)]}`,
    parentPhone: `09${Math.floor(10000000 + Math.random() * 90000000)}`,
    address: `Số ${Math.floor(Math.random() * 100)}, Đường ${['Lê Lợi', 'Hùng Vương', 'Quang Trung', 'Trần Phú', 'Nguyễn Huệ', 'Lý Thường Kiệt', 'Hòa Bình', 'Phan Chu Trinh', 'Đinh Tiên Hoàng', 'Hoàng Văn Thụ', 'Trường Chinh', 'Kim Đồng', 'Nguyễn Chí Thanh', 'Tô Hiệu', 'Trần Hưng Đạo', 'Lạc Long Quân', 'Đinh Công Tráng', 'Trần Quốc Toản', 'Phạm Ngũ Lão', 'Trưng Trắc'][Math.floor(Math.random() * 20)]}, ${['Thành phố Sơn La', 'Huyện Mộc Châu', 'Huyện Thuận Châu', 'Huyện Sông Mã', 'Huyện Phù Yên', 'Huyện Quỳnh Nhai', 'Huyện Yên Châu', 'Huyện Mai Sơn', 'Huyện Mường La', 'Huyện Bắc Yên'][Math.floor(Math.random() * 10)]}, Sơn La, Việt Nam`,
  })),
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
