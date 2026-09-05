import { Request, Response, NextFunction } from 'express';
import {
  CreateProductSchema,
  UpdateProductSchema,
  ProductFilterQuerySchema,
} from '@dealflow360/contracts';
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
} from '../modules/products/product.service.js';

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
    const product = await getProductById(id);
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
