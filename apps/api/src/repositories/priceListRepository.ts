import { db, PriceList, PriceListEntry, CustomerTier } from '@dealflow360/db';
import { CreatePriceListRequest } from '@dealflow360/contracts';

export class PriceListRepository {
  async findMany(): Promise<(PriceList & { entries: PriceListEntry[] })[]> {
    return db.priceList.findMany({
      include: { entries: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string): Promise<(PriceList & { entries: PriceListEntry[] }) | null> {
    return db.priceList.findUnique({
      where: { id },
      include: { entries: true },
    });
  }

  async create(data: CreatePriceListRequest): Promise<PriceList & { entries: PriceListEntry[] }> {
    return db.priceList.create({
      data: {
        name: data.name,
        customerTier: data.customerTier as CustomerTier | null,
        currency: data.currency || 'USD',
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
      include: { entries: true },
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
  }): Promise<PriceList & { entries: PriceListEntry[] }> {
    return db.priceList.update({
      where: { id },
      data,
      include: { entries: true },
    });
  }

  async upsertEntry(priceListId: string, productId: string, unitPrice: number): Promise<PriceListEntry> {
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
