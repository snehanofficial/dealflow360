import { Request, Response, NextFunction } from 'express';
import {
  CreateProductSchema,
  UpdateProductSchema,
  ProductFilterQuerySchema,
  CreatePriceListSchema,
} from '@dealflow360/contracts';
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
} from '../modules/products/product.service.js';
import { categoryRepository } from '../repositories/categoryRepository.js';
import { priceListRepository } from '../repositories/priceListRepository.js';

export async function createProductHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const validated = CreateProductSchema.parse(req.body);
    const product = await createProduct(validated);
    res.status(201).json({
      success: true,
      data: product,
      message: 'Product created successfully.',
      meta: null,
    });
  } catch (error) {
    next(error);
  }
}

export async function getProductsHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const query = ProductFilterQuerySchema.parse(req.query);
    const result = await getProducts(query);
    res.json({
      success: true,
      data: result,
      message: null,
      meta: null,
    });
  } catch (error) {
    next(error);
  }
}

export async function getProductByIdHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const tier = typeof req.query.tier === 'string' ? req.query.tier : undefined;
    const currency = typeof req.query.currency === 'string' ? req.query.currency : undefined;

    const product = await getProductById(id, tier, currency);
    res.json({
      success: true,
      data: product,
      message: null,
      meta: null,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateProductHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const validated = UpdateProductSchema.parse(req.body);
    const product = await updateProduct(id, validated);
    res.json({
      success: true,
      data: product,
      message: 'Product updated successfully.',
      meta: null,
    });
  } catch (error) {
    next(error);
  }
}

export async function getCategoriesHandler(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await categoryRepository.ensureDefaultCategories();
    const categories = await categoryRepository.findAll();
    res.json({
      success: true,
      data: categories,
      message: null,
      meta: null,
    });
  } catch (error) {
    next(error);
  }
}

export async function getPriceListsHandler(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const priceLists = await priceListRepository.findMany();
    res.json({
      success: true,
      data: priceLists,
      message: null,
      meta: null,
    });
  } catch (error) {
    next(error);
  }
}

export async function createPriceListHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const validated = CreatePriceListSchema.parse(req.body);
    const priceList = await priceListRepository.create(validated);
    res.status(201).json({
      success: true,
      data: priceList,
      message: 'Price list created successfully.',
      meta: null,
    });
  } catch (error) {
    next(error);
  }
}
