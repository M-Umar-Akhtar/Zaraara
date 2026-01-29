import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { prisma } from '../src/prisma.js';

async function seedCountriesAndCategories() {
  let mock;
  try {
    mock = await import('../../frontend/src/data/mockData.js');
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('Could not import frontend mockData.js; seeding minimal data only.');
    mock = { COUNTRIES: [], CATEGORIES: [], PRODUCTS: [] };
  }

  const countries = mock.COUNTRIES ?? [];
  const categories = mock.CATEGORIES ?? [];
  const products = mock.PRODUCTS ?? [];

  for (const c of countries) {
    // eslint-disable-next-line no-await-in-loop
    await prisma.country.upsert({
      where: { code: c.code },
      update: { name: c.name, flag: c.flag ?? null },
      create: { code: c.code, name: c.name, flag: c.flag ?? null },
    });
  }

  for (const cat of categories) {
    // eslint-disable-next-line no-await-in-loop
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, image: cat.image ?? null },
      create: { slug: cat.slug, name: cat.name, image: cat.image ?? null },
    });
  }

  for (const p of products) {
    const images = p.images ?? [p.image];
    const colors = p.colors ?? [];
    const sizes = p.sizes ?? [];
    // eslint-disable-next-line no-await-in-loop
    await prisma.product.upsert({
      where: { id: p.id },
      update: {
        name: p.name,
        categorySlug: p.category,
        price: p.price,
        originalPrice: p.originalPrice ?? null,
        image: p.image,
        imagesJson: JSON.stringify(images),
        sale: Boolean(p.sale),
        discount: p.discount ?? 0,
        colorsJson: JSON.stringify(colors),
        sizesJson: JSON.stringify(sizes),
        fabric: p.fabric ?? null,
        description: p.description ?? null,
      },
      create: {
        id: p.id,
        name: p.name,
        categorySlug: p.category,
        price: p.price,
        originalPrice: p.originalPrice ?? null,
        image: p.image,
        imagesJson: JSON.stringify(images),
        sale: Boolean(p.sale),
        discount: p.discount ?? 0,
        colorsJson: JSON.stringify(colors),
        sizesJson: JSON.stringify(sizes),
        fabric: p.fabric ?? null,
        description: p.description ?? null,
      },
    });
  }
}

async function seedUsers() {
  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@techfy.local';
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'Admin123!';
  const supportEmail = process.env.SUPPORT_EMAIL ?? 'support@techfy.local';
  const supportPassword = process.env.SUPPORT_PASSWORD ?? 'Support123!';

  const adminHash = await bcrypt.hash(adminPassword, 10);
  const supportHash = await bcrypt.hash(supportPassword, 10);

  await prisma.user.upsert({
    where: { email: adminEmail.toLowerCase() },
    update: { name: 'Admin', passwordHash: adminHash, role: 'ADMIN' },
    create: { name: 'Admin', email: adminEmail.toLowerCase(), passwordHash: adminHash, role: 'ADMIN' },
  });

  await prisma.user.upsert({
    where: { email: supportEmail.toLowerCase() },
    update: { name: 'Support', passwordHash: supportHash, role: 'SUPPORT' },
    create: { name: 'Support', email: supportEmail.toLowerCase(), passwordHash: supportHash, role: 'SUPPORT' },
  });
}

async function main() {
  await seedCountriesAndCategories();
  await seedUsers();
}

main()
  .then(async () => {
    await prisma.$disconnect();
    // eslint-disable-next-line no-console
    console.log('Seed complete');
  })
  .catch(async (e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
