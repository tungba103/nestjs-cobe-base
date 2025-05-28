import { PrismaClient, ProductStatus, ServiceStatus } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

function convertTextToCode(text) {
  return text
    .normalize('NFD') // Chuyển đổi ký tự tiếng Việt thành ký tự cơ bản
    .replace(/[\u0300-\u036f]/g, '') // Loại bỏ dấu
    .replace(/\s+/g, '') // Loại bỏ khoảng trắng
    .replace(/[^a-zA-Z0-9]/g, ''); // Loại bỏ các ký tự không phải chữ cái, chữ số
}

// Định nghĩa các danh mục thật cho thuốc và dịch vụ của phòng khám nhi
const realisticProductCategories = [
  { name: 'Thuốc hạ sốt', description: 'Thuốc hạ sốt dành cho trẻ em' },
  { name: 'Thuốc ho', description: 'Thuốc giảm ho và dịu cổ họng cho trẻ' },
  { name: 'Thuốc kháng sinh', description: 'Thuốc kháng sinh dành cho trẻ em' },
  {
    name: 'Vitamin và khoáng chất',
    description: 'Bổ sung vitamin và khoáng chất cho trẻ',
  },
  {
    name: 'Dinh dưỡng',
    description: 'Thực phẩm và bổ sung dinh dưỡng cho trẻ',
  },
];

const realisticServiceCategories = [
  { name: 'Khám bệnh', description: 'Dịch vụ khám bệnh cho trẻ' },
  { name: 'Tiêm chủng', description: 'Dịch vụ tiêm chủng cho trẻ' },
  {
    name: 'Tư vấn dinh dưỡng',
    description: 'Tư vấn dinh dưỡng và sức khỏe cho trẻ',
  },
  {
    name: 'Xét nghiệm',
    description: 'Dịch vụ xét nghiệm và chẩn đoán cho trẻ',
  },
  {
    name: 'Chăm sóc trẻ sơ sinh',
    description: 'Dịch vụ chăm sóc đặc biệt cho trẻ sơ sinh',
  },
];

// Cấu hình số lượng dữ liệu seed cho mỗi danh mục
const SEED_CONFIG = {
  PRODUCT_CATEGORIES: realisticProductCategories.length,
  PRODUCTS_PER_CATEGORY: 10,
  SERVICE_CATEGORIES: realisticServiceCategories.length,
  SERVICES_PER_CATEGORY: 10,
};

// Map tên danh mục thuốc với các tên thuốc điển hình
const medicationMap: Record<string, string[]> = {
  'Thuốc hạ sốt': [
    'Paracetamol 120mg/5ml',
    'Ibuprofen 100mg/5ml',
    'Acetaminophen 100mg/5ml',
    'Calpol Suspension',
    'Tempra Suspension',
  ],
  'Thuốc ho': [
    'Dextromethorphan Syrup',
    'Honey Cough Syrup',
    'Ambroxol Syrup',
    'Guaifenesin Syrup',
    'Bronchicum Elixir',
  ],
  'Thuốc kháng sinh': [
    'Amoxicillin Suspension',
    'Cefuroxime Suspension',
    'Azithromycin Suspension',
    'Erythromycin Suspension',
    'Clarithromycin Suspension',
  ],
  'Vitamin và khoáng chất': [
    'Vitamin D Drops',
    'Multivitamin Drops',
    'Calcium Supplement',
    'Iron Supplement',
    'Zinc Supplement',
  ],
  'Dinh dưỡng': [
    'Pediatric Nutritional Supplement',
    'Growth Formula',
    'Infant Milk Powder',
    'Toddler Milk',
    'Nutrient-rich Porridge',
  ],
};

// Map tên danh mục dịch vụ với các dịch vụ điển hình
const serviceMap: Record<string, string[]> = {
  'Khám bệnh': [
    'Khám tổng quát',
    'Khám chuyên khoa nhi',
    'Khám tai mũi họng',
    'Khám hô hấp',
    'Khám tiêu hóa',
  ],
  'Tiêm chủng': [
    'Tiêm chủng phòng cúm',
    'Tiêm chủng sởi',
    'Tiêm chủng bạch hầu',
    'Tiêm chủng uốn ván',
    'Tiêm chủng viêm gan B',
  ],
  'Tư vấn dinh dưỡng': [
    'Tư vấn dinh dưỡng cho trẻ',
    'Tư vấn cân nặng & chiều cao',
    'Tư vấn dinh dưỡng sơ sinh',
    'Tư vấn ăn uống lành mạnh',
    'Tư vấn chế độ dinh dưỡng đặc biệt',
  ],
  'Xét nghiệm': [
    'Xét nghiệm máu',
    'Xét nghiệm nước tiểu',
    'Xét nghiệm dị ứng',
    'Xét nghiệm vi sinh',
    'Xét nghiệm chức năng gan',
  ],
  'Chăm sóc trẻ sơ sinh': [
    'Chăm sóc sau sinh',
    'Tư vấn nuôi con',
    'Hỗ trợ cho mẹ và bé',
    'Kiểm tra phát triển sơ sinh',
    'Chăm sóc định kỳ cho trẻ sơ sinh',
  ],
};

async function seedProductCategories() {
  // Dữ liệu danh mục thuốc dựa trên realisticProductCategories
  const categories = realisticProductCategories.map((item) => ({
    code: convertTextToCode(item.name),
    name: item.name,
    description: item.description,
  }));

  const createdCategories = await prisma.productCategory.createMany({
    data: categories,
    skipDuplicates: true,
  });

  console.log('Seeded product categories:', createdCategories);
  return prisma.productCategory.findMany();
}

async function seedServiceCategories() {
  // Dữ liệu danh mục dịch vụ dựa trên realisticServiceCategories
  const categories = realisticServiceCategories.map((item) => ({
    code: convertTextToCode(item.name),
    name: item.name,
    description: item.description,
  }));

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
    // Lấy mảng tên thuốc ứng với danh mục; nếu không tìm thấy, dùng faker
    const namesArray = medicationMap[category.name] || [
      faker.commerce.productName(),
    ];
    for (let i = 1; i <= SEED_CONFIG.PRODUCTS_PER_CATEGORY; i++) {
      // Chọn ngẫu nhiên 1 tên thuốc từ mảng (có thể ghép thêm chỉ số để tạo sự đa dạng)
      const baseName = faker.helpers.arrayElement(namesArray);
      products.push({
        code: convertTextToCode(`${category.name} ${productCounter}`),
        name: `${baseName} ${productCounter}`,
        productCategoryId: category.id,
        // Giá thuốc thường rơi vào khoảng 50,000 đến 200,000 VND (bạn có thể điều chỉnh)
        price: parseFloat(
          faker.commerce.price({
            min: 50000,
            max: 200000,
          }),
        ),
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
    // Lấy mảng tên dịch vụ ứng với danh mục; nếu không có, dùng faker
    const namesArray = serviceMap[category.name] || [faker.lorem.words(2)];
    for (let i = 1; i <= SEED_CONFIG.SERVICES_PER_CATEGORY; i++) {
      const baseName = faker.helpers.arrayElement(namesArray);
      services.push({
        code: convertTextToCode(`${category.name} ${serviceCounter}`),
        name: `${baseName} ${serviceCounter}`,
        serviceCategoryId: category.id,
        // Giá dịch vụ có thể từ 100,000 đến 500,000 VND (điều chỉnh theo thực tế)
        price: parseFloat(
          faker.commerce.price({
            min: 100000,
            max: 500000,
          }),
        ),
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
    // Kiểm tra nếu đã có dữ liệu thì không seed lại
    const existingProducts = await prisma.product.findMany();
    const existingServices = await prisma.service.findMany();

    if (existingProducts.length > 0 || existingServices.length > 0) {
      console.log('Products or Services already seeded');
      return;
    }

    // Seed danh mục trước
    const productCategories = await seedProductCategories();
    const serviceCategories = await seedServiceCategories();

    // Sau đó seed sản phẩm (thuốc) và dịch vụ
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
