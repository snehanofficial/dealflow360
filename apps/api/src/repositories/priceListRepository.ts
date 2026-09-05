import { db, PriceList, PriceListEntry, CustomerTier } from '@dealflow360/db';
import { CreatePriceListRequest } from '@dealflow360/contracts';

const defaultEntriesInclude = {
  entries: {
    include: {
      product: true,
    },
  },
};

export class PriceListRepository {
  async findMany(): Promise<any[]> {
    return db.priceList.findMany({
      include: defaultEntriesInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string): Promise<any | null> {
    return db.priceList.findUnique({
      where: { id },
      include: defaultEntriesInclude,
    });
  }

  async create(data: CreatePriceListRequest): Promise<any> {
    const currency = data.currency || 'USD';
    if (data.isDefault) {
      await db.priceList.updateMany({
        where: { currency, isDefault: true },
        data: { isDefault: false },
      });
    }

    return db.priceList.create({
      data: {
        name: data.name,
        customerTier: data.customerTier as CustomerTier | null,
        currency,
        isDefault: data.isDefault ?? false,
        isActive: data.isActive ?? true,
        entries: data.entries
          ? {
              create: data.entries.map((e) => ({
                productId: e.productId,
                unitPrice: e.unitPrice,
              })),
            }
          : undefined,
      },
      include: defaultEntriesInclude,
    });
  }

  async findEffectivePriceEntry(
    productId: string,
    customerTier?: CustomerTier | null,
    currency: string = 'USD',
  ): Promise<number | null> {
    // Step 1: Customer Tier + Currency
    if (customerTier) {
      const tierList = await db.priceList.findFirst({
        where: {
          customerTier,
          currency,
          isActive: true,
        },
        orderBy: { createdAt: 'desc' },
        include: {
          entries: {
            where: { productId },
          },
        },
      });

      if (tierList && tierList.entries.length > 0) {
        return tierList.entries[0].unitPrice;
      }
    }

    // Step 2: Default Price List for Currency
    const defaultList = await db.priceList.findFirst({
      where: {
        isDefault: true,
        currency,
        isActive: true,
      },
      include: {
        entries: {
          where: { productId },
        },
      },
    });

    if (defaultList && defaultList.entries.length > 0) {
      return defaultList.entries[0].unitPrice;
    }

    return null;
  }

  async update(id: string, data: {
    name?: string;
    customerTier?: CustomerTier | null;
    currency?: string;
    isDefault?: boolean;
    isActive?: boolean;
  }): Promise<any> {
    const existing = await db.priceList.findUnique({ where: { id } });
    const targetCurrency = data.currency || existing?.currency || 'USD';

    if (data.isDefault) {
      await db.priceList.updateMany({
        where: {
          currency: targetCurrency,
          isDefault: true,
          NOT: { id },
        },
        data: { isDefault: false },
      });
    }

    return db.priceList.update({
      where: { id },
      data,
      include: defaultEntriesInclude,
    });
  }

  async delete(id: string): Promise<void> {
    await db.priceList.delete({
      where: { id },
    });
  }

  async upsertEntry(priceListId: string, productId: string, unitPrice: number): Promise<any> {
    return db.priceListEntry.upsert({
      where: {
        priceListId_productId: {
          priceListId,
          productId,
        },
      },
      update: {
        unitPrice,
      },
      create: {
        priceListId,
        productId,
        unitPrice,
      },
      include: {
        product: true,
      },
    });
  }


  async deleteEntry(priceListId: string, productId: string): Promise<void> {
    await db.priceListEntry.deleteMany({
      where: {
        priceListId,
        productId,
      },
    });
  }
}

export const priceListRepository = new PriceListRepository();

