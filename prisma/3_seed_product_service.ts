import { PrismaClient, ProductStatus, ServiceStatus } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

const SEED_CONFIG = {
  PRODUCT_CATEGORIES: 5,
  PRODUCTS_PER_CATEGORY: 10,
  SERVICE_CATEGORIES: 5,
  SERVICES_PER_CATEGORY: 10,
};

async function seedProductCategories() {
  const categories = [];
  for (let i = 1; i <= SEED_CONFIG.PRODUCT_CATEGORIES; i++) {
    const name = `Danh mục thuốc ${i}`;
    categories.push({
      code: `PRODUCT_CAT_${i}`,
      name,
      description: `Mô tả cho ${name.toLowerCase()}`,
    });
  }

  const createdCategories = await prisma.productCategory.createMany({
    data: categories,
    skipDuplicates: true,
  });

  console.log('Seeded product categories:', createdCategories);
  return prisma.productCategory.findMany();
}

async function seedServiceCategories() {
  const categories = [];
  for (let i = 1; i <= SEED_CONFIG.SERVICE_CATEGORIES; i++) {
    const name = `Danh mục dịch vụ ${i}`;
    categories.push({
      code: `SERVICE_CAT_${i}`,
      name,
      description: `Mô tả cho ${name.toLowerCase()}`,
    });
  }

  const createdCategories = await prisma.serviceCategory.createMany({
    data: categories,
    skipDuplicates: true,
  });

  console.log('Seeded service categories:', createdCategories);
  return prisma.serviceCategory.findMany();
}

async function seedProducts(productCategories: any[]) {
  const products = [];
  let productCounter = 1;

  for (const category of productCategories) {
    for (let i = 1; i <= SEED_CONFIG.PRODUCTS_PER_CATEGORY; i++) {
      const productCode = `PRD${String(productCounter).padStart(4, '0')}`;
      products.push({
        code: productCode,
        name: `${faker.commerce.productName()} ${productCounter}`,
        productCategoryId: category.id,
        price: parseFloat(faker.commerce.price({ min: 50000, max: 1000000 })),
        status: faker.helpers.arrayElement([
          ProductStatus.ACTIVE,
          ProductStatus.INACTIVE,
        ]),
      });
      productCounter++;
    }
  }

  const createdProducts = await prisma.product.createMany({
    data: products,
    skipDuplicates: true,
  });

  console.log('Seeded products:', createdProducts);
}

async function seedServices(serviceCategories: any[]) {
  const services = [];
  let serviceCounter = 1;

  for (const category of serviceCategories) {
    for (let i = 1; i <= SEED_CONFIG.SERVICES_PER_CATEGORY; i++) {
      const serviceCode = `SRV${String(serviceCounter).padStart(4, '0')}`;
      services.push({
        code: serviceCode,
        name: `${faker.commerce.productName()} ${serviceCounter}`,
        serviceCategoryId: category.id,
        price: parseFloat(faker.commerce.price({ min: 100000, max: 2000000 })),
        status: faker.helpers.arrayElement([
          ServiceStatus.ACTIVE,
          ServiceStatus.INACTIVE,
        ]),
      });
      serviceCounter++;
    }
  }

  const createdServices = await prisma.service.createMany({
    data: services,
    skipDuplicates: true,
  });

  console.log('Seeded services:', createdServices);
}

async function main() {
  try {
    // Check if data already exists
    const existingProducts = await prisma.product.findMany();
    const existingServices = await prisma.service.findMany();

    if (existingProducts.length > 0 || existingServices.length > 0) {
      console.log('Products or Services already seeded');
      return;
    }

    // Seed categories first
    const productCategories = await seedProductCategories();
    const serviceCategories = await seedServiceCategories();

    // Then seed products and services
    await seedProducts(productCategories);
    await seedServices(serviceCategories);

    console.log('Seeding completed successfully');
  } catch (error) {
    console.error('Error seeding data:', error);
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
