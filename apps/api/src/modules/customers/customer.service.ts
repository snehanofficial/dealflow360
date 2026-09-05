import { db } from '@dealflow360/db';
import {
  CreateCustomerRequest,
  UpdateCustomerRequest,
  CustomerFilterQuery,
  CustomerListResponse,
  CustomerDto,
} from '@dealflow360/contracts';
import { AppError } from '../../middleware/errorHandler.js';

export async function createCustomer(data: CreateCustomerRequest): Promise<CustomerDto> {
  const existingCode = await db.customer.findUnique({
    where: { code: data.code },
  });

  if (existingCode) {
    throw new AppError('DUPLICATE_CODE', `Customer with code '${data.code}' already exists.`, 409);
  }

  const customer = await db.customer.create({
    data: {
      code: data.code,
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      tier: data.tier,
      status: data.status,
    },
  });

  return {
    ...customer,
    createdAt: customer.createdAt.toISOString(),
    updatedAt: customer.updatedAt.toISOString(),
  };
}

export async function getCustomers(query: CustomerFilterQuery): Promise<CustomerListResponse> {
  const { search, tier, status, page, limit } = query;
  const skip = (page - 1) * limit;

  const whereClause: Record<string, unknown> = {};

  if (tier) {
    whereClause.tier = tier;
  }

  if (status) {
    whereClause.status = status;
  }

  if (search && search.trim() !== '') {
    const searchTerm = search.trim();
    whereClause.OR = [
      { name: { contains: searchTerm, mode: 'insensitive' } },
      { code: { contains: searchTerm, mode: 'insensitive' } },
      { email: { contains: searchTerm, mode: 'insensitive' } },
    ];
  }

  const [items, total] = await Promise.all([
    db.customer.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    db.customer.count({ where: whereClause }),
  ]);

  const totalPages = Math.ceil(total / limit) || 1;

  return {
    items: items.map((c) => ({
      ...c,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    })),
    total,
    page,
    limit,
    totalPages,
  };
}

export async function getCustomerById(id: string): Promise<CustomerDto> {
  const customer = await db.customer.findUnique({
    where: { id },
  });

  if (!customer) {
    throw new AppError('NOT_FOUND', `Customer with ID '${id}' not found.`, 404);
  }

  return {
    ...customer,
    createdAt: customer.createdAt.toISOString(),
    updatedAt: customer.updatedAt.toISOString(),
  };
}

export async function updateCustomer(
  id: string,
  data: UpdateCustomerRequest,
): Promise<CustomerDto> {
  const existing = await db.customer.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError('NOT_FOUND', `Customer with ID '${id}' not found.`, 404);
  }

  const updated = await db.customer.update({
    where: { id },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.email && { email: data.email }),
      ...(data.phone !== undefined && { phone: data.phone }),
      ...(data.tier && { tier: data.tier }),
      ...(data.status && { status: data.status }),
    },
  });

  return {
    ...updated,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
  };
}
