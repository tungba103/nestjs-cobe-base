import { PrismaClient, VisitStatus } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

const SEED_CONFIG = {
  VISITS_COUNT: 1000,
  MAX_PRESCRIPTION_ITEMS: 4,
  MAX_SERVICE_ITEMS: 3,
};

const COMMON_SYMPTOMS = [
  'Sốt cao, ho',
  'Ho, sổ mũi',
  'Đau bụng, tiêu chảy',
  'Nôn mửa, chán ăn',
  'Phát ban, ngứa',
  'Khó thở, thở khò khè',
  'Đau họng, sốt nhẹ',
  'Ho khan kéo dài',
  'Chảy nước mũi, hắt hơi',
  'Sốt phát ban',
];

const COMMON_DIAGNOSES = [
  'Viêm đường hô hấp trên',
  'Viêm phế quản',
  'Viêm dạ dày ruột cấp',
  'Viêm amidan',
  'Viêm da dị ứng',
  'Hen phế quản',
  'Viêm tai giữa',
  'Viêm phổi',
  'Viêm mũi dị ứng',
  'Sởi',
];

const COMMON_ADVICE = [
  'Uống nhiều nước, nghỉ ngơi đầy đủ',
  'Giữ ấm cơ thể, tránh gió lạnh',
  'Vệ sinh mũi họng thường xuyên',
  'Tái khám nếu sốt cao trở lại',
  'Tránh các thức ăn cay nóng',
  'Hạn chế tiếp xúc với khói bụi',
  'Theo dõi phát ban và nhiệt độ',
  'Ăn thức ăn lỏng dễ tiêu',
  'Tránh đồ ăn đóng hộp',
  'Hạn chế ra ngoài trời lạnh',
];

async function getRandomActiveCustomer() {
  const customers = await prisma.customer.findMany({
    where: { isActive: true },
    select: { id: true },
  });
  return faker.helpers.arrayElement(customers);
}

async function getRandomActiveProducts(count: number) {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: { id: true, name: true, price: true },
  });
  return faker.helpers.arrayElements(products, count);
}

async function getRandomActiveServices(count: number) {
  const services = await prisma.service.findMany({
    where: { isActive: true },
    select: { id: true, name: true, price: true },
  });
  return faker.helpers.arrayElements(services, count);
}

async function createPrescription(visitId: number) {
  const prescriptionItemsCount = faker.number.int({
    min: 1,
    max: SEED_CONFIG.MAX_PRESCRIPTION_ITEMS,
  });
  const products = await getRandomActiveProducts(prescriptionItemsCount);

  const prescription = await prisma.prescription.create({
    data: {
      visitId,
      totalAmount: 0, // Will update after creating items
      totalDiscount: 0,
    },
  });

  let totalAmount = 0;
  let totalDiscount = 0;

  for (const product of products) {
    const quantity = faker.number.int({ min: 1, max: 3 });
    const discount = faker.number.int({ min: 0, max: 10 }) * 1000;
    const amount = product.price * quantity;

    totalAmount += amount;
    totalDiscount += discount;

    await prisma.prescriptionItem.create({
      data: {
        prescriptionId: prescription.id,
        productId: product.id,
        productName: product.name,
        quantity,
        price: product.price,
        discount,
        morningDosage: faker.number.int({ min: 0, max: 2 }),
        noonDosage: faker.number.int({ min: 0, max: 2 }),
        afternoonDosage: faker.number.int({ min: 0, max: 2 }),
        eveningDosage: faker.number.int({ min: 0, max: 2 }),
        usageInstructions: 'Uống thuốc sau khi ăn',
        doctorNotes: faker.helpers.arrayElement([
          'Uống đủ liều',
          'Có thể gây buồn ngủ',
          'Uống với nhiều nước',
          null,
        ]),
      },
    });
  }

  await prisma.prescription.update({
    where: { id: prescription.id },
    data: { totalAmount, totalDiscount },
  });

  return prescription;
}

async function createServiceUsage(visitId: number) {
  const serviceItemsCount = faker.number.int({
    min: 1,
    max: SEED_CONFIG.MAX_SERVICE_ITEMS,
  });
  const services = await getRandomActiveServices(serviceItemsCount);

  const serviceUsage = await prisma.serviceUsage.create({
    data: {
      visitId,
      totalAmount: 0, // Will update after creating items
      totalDiscount: 0,
    },
  });

  let totalAmount = 0;
  let totalDiscount = 0;

  for (const service of services) {
    const quantity = 1;
    const discount = faker.number.int({ min: 0, max: 50 }) * 1000;
    const amount = service.price * quantity;

    totalAmount += amount;
    totalDiscount += discount;

    await prisma.serviceUsageItem.create({
      data: {
        serviceUsageId: serviceUsage.id,
        serviceId: service.id,
        serviceName: service.name,
        quantity,
        price: service.price,
        discount,
        usageInstructions: faker.helpers.arrayElement([
          'Thực hiện tại phòng khám',
          'Theo dõi sau khi thực hiện',
          null,
        ]),
        doctorNotes: faker.helpers.arrayElement([
          'Cần theo dõi thêm',
          'Tái khám sau 3 ngày',
          null,
        ]),
      },
    });
  }

  await prisma.serviceUsage.update({
    where: { id: serviceUsage.id },
    data: { totalAmount, totalDiscount },
  });

  return serviceUsage;
}

async function seedVisits() {
  for (let i = 0; i < SEED_CONFIG.VISITS_COUNT; i++) {
    const customer = await getRandomActiveCustomer();

    // Create prescription and service usage first
    const prescription = await createPrescription(i + 1);
    const serviceUsage = await createServiceUsage(i + 1);

    // Calculate total amount
    const totalAmount =
      (prescription?.totalAmount || 0) + (serviceUsage?.totalAmount || 0);

    await prisma.visit.create({
      data: {
        customerId: customer.id,
        creatorId: 1, // Assuming default admin/doctor ID
        creatorName: 'Bác sĩ Nguyễn Văn A',
        totalAmount,
        diagnosis: faker.helpers.arrayElement(COMMON_DIAGNOSES),
        symptoms: faker.helpers.arrayElement(COMMON_SYMPTOMS),
        personalMedicalHistory: faker.helpers.arrayElement([
          'Tiền sử hen suyễn',
          'Dị ứng với đạm sữa bò',
          'Tiền sử viêm phế quản',
          null,
        ]),
        familyMedicalHistory: faker.helpers.arrayElement([
          'Gia đình có người bị hen suyễn',
          'Gia đình có người bị dị ứng',
          null,
        ]),
        prescriptionId: prescription.id,
        serviceUsageId: serviceUsage.id,
        reExaminationTime: faker.helpers.arrayElement([
          faker.date.future({ years: 1 }),
          faker.date.future({ years: 2 }),
          faker.date.future({ years: 3 }),
          null,
        ]),
        advice: faker.helpers.arrayElement(COMMON_ADVICE),
        // status: faker.helpers.arrayElement(['NEW', 'IN_PROGRESS', 'COMPLETED']),
        status: VisitStatus.COMPLETED,
        createdAt: faker.date.past({ years: 1 }), // Visits within last 30 days
      },
    });
  }

  console.log(`Seeded ${SEED_CONFIG.VISITS_COUNT} visits`);
}

async function main() {
  try {
    // Check if data already exists
    const existingVisits = await prisma.visit.findMany();

    if (existingVisits.length > 0) {
      console.log('Visits already seeded');
      return;
    }

    await seedVisits();
    console.log('Visit seeding completed successfully');
  } catch (error) {
    console.error('Error seeding visits:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
