import { db, ProductAttribute, ProductAttributeValue } from '@dealflow360/db';

export class AttributeRepository {
  async findAll(): Promise<(ProductAttribute & { values: ProductAttributeValue[] })[]> {
    return db.productAttribute.findMany({
      include: {
        values: {
          orderBy: { value: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string): Promise<(ProductAttribute & { values: ProductAttributeValue[] }) | null> {
    return db.productAttribute.findUnique({
      where: { id },
      include: {
        values: {
          orderBy: { value: 'asc' },
        },
      },
    });
  }

  async findByName(name: string): Promise<ProductAttribute | null> {
    return db.productAttribute.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
    });
  }

  async createAttribute(name: string, values: string[] = []): Promise<ProductAttribute & { values: ProductAttributeValue[] }> {
    return db.productAttribute.create({
      data: {
        name,
        values: values.length > 0
          ? {
              create: values.map((val) => ({ value: val })),
            }
          : undefined,
      },
      include: { values: true },
    });
  }

  async addValue(attributeId: string, value: string): Promise<ProductAttributeValue> {
    return db.productAttributeValue.create({
      data: {
        attributeId,
        value,
      },
    });
  }

  async deleteValue(valueId: string): Promise<void> {
    await db.productAttributeValue.delete({
      where: { id: valueId },
    });
  }
}

export const attributeRepository = new AttributeRepository();
