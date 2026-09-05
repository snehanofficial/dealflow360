import { priceListRepository } from '../repositories/priceListRepository.js';
import { CreatePriceListRequest } from '@dealflow360/contracts';
import { recordAuditEvent } from './auditService.js';

export interface ServiceActor {
  id?: string | null;
  name?: string | null;
  role?: string | null;
}

export async function createPriceListService(
  data: CreatePriceListRequest,
  actor?: ServiceActor | null,
): Promise<any> {
  const priceList = await priceListRepository.create(data);

  await recordAuditEvent({
    eventType: 'PRICE_LIST_CREATED',
    action: `Created Price List ${priceList.name} (${priceList.currency})`,
    entityType: 'PriceList',
    entityId: priceList.id,
    actor,
    newState: priceList,
  });

  return priceList;
}

export async function updatePriceListService(
  id: string,
  data: {
    name?: string;
    customerTier?: any;
    currency?: string;
    isDefault?: boolean;
    isActive?: boolean;
  },
  actor?: ServiceActor | null,
): Promise<any> {
  const existing = await priceListRepository.findById(id);
  const updated = await priceListRepository.update(id, data);

  await recordAuditEvent({
    eventType: 'PRICE_LIST_UPDATED',
    action: `Updated Price List ${updated.name}`,
    entityType: 'PriceList',
    entityId: updated.id,
    actor,
    previousState: existing,
    newState: updated,
  });

  return updated;
}

export async function upsertPriceListEntryService(
  priceListId: string,
  productId: string,
  unitPrice: number,
  actor?: ServiceActor | null,
): Promise<any> {
  const priceList = await priceListRepository.findById(priceListId);
  const existingEntry = priceList?.entries?.find((e: any) => e.productId === productId);

  const entry = await priceListRepository.upsertEntry(priceListId, productId, unitPrice);

  await recordAuditEvent({
    eventType: 'PRODUCT_PRICE_CHANGED',
    action: existingEntry
      ? `Changed Price List entry price for product in ${priceList?.name || 'Price List'} from ₹${existingEntry.unitPrice} to ₹${unitPrice}`
      : `Added Price List entry with price ₹${unitPrice} to ${priceList?.name || 'Price List'}`,
    entityType: 'PriceList',
    entityId: priceListId,
    actor,
    previousState: existingEntry ? { productId, unitPrice: existingEntry.unitPrice } : null,
    newState: { productId, unitPrice },
  });

  return entry;
}
