import { db, Category } from '@dealflow360/db';

export class CategoryRepository {
  async findAll(): Promise<Category[]> {
    return db.category.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string): Promise<Category | null> {
    return db.category.findUnique({
      where: { id },
    });
  }

  async findByCode(code: string): Promise<Category | null> {
    return db.category.findUnique({
      where: { code },
    });
  }

  async create(data: { name: string; code: string }): Promise<Category> {
    return db.category.create({
      data,
    });
  }

  async ensureDefaultCategories(): Promise<void> {
    const defaults = [
      { name: 'Hardware', code: 'HARDWARE' },
      { name: 'Software License', code: 'SOFTWARE_LICENSE' },
      { name: 'Subscription', code: 'SUBSCRIPTION' },
      { name: 'Professional Services', code: 'PROFESSIONAL_SERVICES' },
      { name: 'Support', code: 'SUPPORT' },
    ];

    for (const cat of defaults) {
      await db.category.upsert({
        where: { code: cat.code },
        update: {},
        create: cat,
      });
    }
  }
}

export const categoryRepository = new CategoryRepository();
