import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Read JSON data files
  const dataDir = path.join(process.cwd(), 'data');

  const readJsonFile = (filename: string) => {
    const filePath = path.join(dataDir, filename);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    }
    return [];
  };

  const brands = readJsonFile('brands.json');
  const vehicles = readJsonFile('vehicles.json');
  const faqs = readJsonFile('faqs.json');
  const settings = readJsonFile('settings.json');
  const admins = readJsonFile('admins.json');
  const banners = readJsonFile('banners.json');
  const partners = readJsonFile('partners.json');
  const colors = readJsonFile('colors.json');
  const trims = readJsonFile('trims.json');
  const options = readJsonFile('options.json');
  const companyInfoRaw = readJsonFile('company-info.json');

  // Seed Brands
  console.log('📦 Seeding brands...');
  for (const brand of brands) {
    const brandData = {
      id: brand.id,
      name: brand.nameEn || brand.nameKr,
      nameKr: brand.nameKr,
      nameEn: brand.nameEn || null,
      logo: brand.logo || null,
      isDomestic: brand.isDomestic ?? true,
      sortOrder: brand.sortOrder ?? 0,
      isActive: brand.isActive ?? true,
    };
    await prisma.brand.upsert({
      where: { id: brand.id },
      update: brandData,
      create: brandData,
    });
  }
  console.log(`✅ Created ${brands.length} brands`);

  // Seed Vehicles (without relations first)
  console.log('🚗 Seeding vehicles...');
  for (const vehicle of vehicles) {
    const vehicleData = {
      id: vehicle.id,
      brandId: vehicle.brandId,
      name: vehicle.name,
      category: vehicle.category,
      fuelTypes: vehicle.fuelTypes || [],
      driveTypes: vehicle.driveTypes || [],
      seatingCapacityMin: vehicle.seatingCapacityMin || null,
      seatingCapacityMax: vehicle.seatingCapacityMax || null,
      basePrice: vehicle.basePrice || 0,
      rentPrice60_0: vehicle.rentPrice60_0 || null,
      rentPrice48_0: vehicle.rentPrice48_0 || null,
      rentPrice36_0: vehicle.rentPrice36_0 || null,
      rentPrice24_0: vehicle.rentPrice24_0 || null,
      rentPrice60_25: vehicle.rentPrice60_25 || null,
      rentPrice48_25: vehicle.rentPrice48_25 || null,
      rentPrice36_25: vehicle.rentPrice36_25 || null,
      rentPrice24_25: vehicle.rentPrice24_25 || null,
      rentPrice60_50: vehicle.rentPrice60_50 || null,
      rentPrice48_50: vehicle.rentPrice48_50 || null,
      rentPrice36_50: vehicle.rentPrice36_50 || null,
      rentPrice24_50: vehicle.rentPrice24_50 || null,
      thumbnail: vehicle.thumbnail || null,
      images: vehicle.images || [],
      isPopular: vehicle.isPopular ?? false,
      isNew: vehicle.isNew ?? false,
      isActive: vehicle.isActive ?? true,
      sortOrder: vehicle.sortOrder ?? 0,
    };
    await prisma.vehicle.upsert({
      where: { id: vehicle.id },
      update: vehicleData,
      create: vehicleData,
    });
  }
  console.log(`✅ Created ${vehicles.length} vehicles`);

  // Seed Colors
  console.log('🎨 Seeding colors...');
  for (const color of colors) {
    const colorData = {
      id: color.id,
      vehicleId: color.vehicleId,
      type: color.type,
      name: color.name || '',
      hexCode: color.hexCode,
      price: color.price || 0,
      sortOrder: color.sortOrder ?? 0,
    };
    await prisma.color.upsert({
      where: { id: color.id },
      update: colorData,
      create: colorData,
    });
  }
  console.log(`✅ Created ${colors.length} colors`);

  // Seed Trims
  console.log('🔧 Seeding trims...');
  for (const trim of trims) {
    const trimData = {
      id: trim.id,
      vehicleId: trim.vehicleId,
      name: trim.name,
      description: trim.description || null,
      price: trim.price || 0,
      sortOrder: trim.sortOrder ?? 0,
    };
    await prisma.trim.upsert({
      where: { id: trim.id },
      update: trimData,
      create: trimData,
    });
  }
  console.log(`✅ Created ${trims.length} trims`);

  // Seed Options
  console.log('⚙️ Seeding options...');
  for (const option of options) {
    const optionData = {
      id: option.id,
      vehicleId: option.vehicleId,
      name: option.name,
      description: option.description || null,
      price: option.price || 0,
      category: option.category || null,
      sortOrder: option.sortOrder ?? 0,
    };
    await prisma.option.upsert({
      where: { id: option.id },
      update: optionData,
      create: optionData,
    });
  }
  console.log(`✅ Created ${options.length} options`);

  // Seed FAQs
  console.log('❓ Seeding FAQs...');
  for (const faq of faqs) {
    const faqData = {
      id: faq.id,
      question: faq.question,
      answer: faq.answer,
      sortOrder: faq.sortOrder ?? 0,
      isActive: faq.isActive ?? true,
    };
    await prisma.fAQ.upsert({
      where: { id: faq.id },
      update: faqData,
      create: faqData,
    });
  }
  console.log(`✅ Created ${faqs.length} FAQs`);

  // Seed Settings
  console.log('⚙️ Seeding settings...');
  if (typeof settings === 'object' && !Array.isArray(settings)) {
    for (const [key, value] of Object.entries(settings)) {
      await prisma.setting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      });
    }
    console.log(`✅ Created ${Object.keys(settings).length} settings`);
  }

  // Seed Banners
  console.log('🎯 Seeding banners...');
  for (const banner of banners) {
    const bannerData = {
      id: banner.id,
      title: banner.title,
      subtitle: banner.subtitle || null,
      description: banner.description || null,
      image: banner.image || null,
      mobileImage: banner.mobileImage || null,
      link: banner.link || null,
      linkText: banner.linkText || null,
      backgroundColor: banner.backgroundColor || null,
      textColor: banner.textColor || null,
      startDate: banner.startDate ? new Date(banner.startDate) : null,
      endDate: banner.endDate ? new Date(banner.endDate) : null,
      sortOrder: banner.sortOrder ?? 0,
      isActive: banner.isActive ?? true,
    };
    await prisma.banner.upsert({
      where: { id: banner.id },
      update: bannerData,
      create: bannerData,
    });
  }
  console.log(`✅ Created ${banners.length} banners`);

  // Seed Partners
  console.log('🤝 Seeding partners...');
  if (Array.isArray(partners) && partners.length > 0) {
    for (const partner of partners) {
      const partnerData = {
        id: partner.id,
        name: partner.name,
        logo: partner.logo || null,
        link: partner.link || null,
        category: partner.category || null,
        sortOrder: partner.sortOrder ?? 0,
        isActive: partner.isActive ?? true,
      };
      await prisma.partner.upsert({
        where: { id: partner.id },
        update: partnerData,
        create: partnerData,
      });
    }
    console.log(`✅ Created ${partners.length} partners`);
  } else {
    console.log('⏭️ No partners to seed');
  }

  // Seed Company Info
  console.log('🏢 Seeding company info...');
  if (typeof companyInfoRaw === 'object' && !Array.isArray(companyInfoRaw)) {
    for (const [key, value] of Object.entries(companyInfoRaw)) {
      if (value !== null && value !== undefined) {
        await prisma.companyInfo.upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value) },
        });
      }
    }
    console.log(`✅ Created ${Object.keys(companyInfoRaw).length} company info entries`);
  }

  // Seed Admins
  console.log('👤 Seeding admin users...');
  for (const admin of admins) {
    await prisma.admin.upsert({
      where: { email: admin.email },
      update: {
        name: admin.name,
        password: admin.password,
      },
      create: {
        id: admin.id,
        email: admin.email,
        password: admin.password,
        name: admin.name,
      },
    });
  }
  console.log(`✅ Created ${admins.length} admin users`);

  console.log('🎉 Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
