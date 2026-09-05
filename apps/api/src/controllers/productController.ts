import { Request, Response, NextFunction } from 'express';
import {
  CreateProductSchema,
  UpdateProductSchema,
  ProductFilterQuerySchema,
  CreatePriceListSchema,
  CreateCategorySchema,
  UpdateCategorySchema,
  UpsertCategoryDiscountPolicySchema,
  CreateAttributeSchema,
  AddAttributeValueSchema,
  UpdateVariantSchema,
  UpdatePriceListSchema,
  UpsertPriceListEntrySchema,
} from '@dealflow360/contracts';
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
} from '../modules/products/product.service.js';
import {
  createPriceListService,
  updatePriceListService,
  upsertPriceListEntryService,
} from '../services/priceListService.js';
import { categoryRepository } from '../repositories/categoryRepository.js';
import { priceListRepository } from '../repositories/priceListRepository.js';
import { attributeRepository } from '../repositories/attributeRepository.js';
import { productRepository } from '../repositories/productRepository.js';

export async function createProductHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const validated = CreateProductSchema.parse(req.body);
    const actor = (req as any).user;
    const product = await createProduct(validated, actor);
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
    const actor = (req as any).user;
    const product = await updateProduct(id, validated, actor);
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
    const categories = await categoryRepository.findAllWithStats();
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

export async function getCategoryByIdHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const category = await categoryRepository.findByIdWithDetails(id);
    if (!category) {
      res.status(404).json({
        success: false,
        data: null,
        message: 'Category not found',
        meta: null,
      });
      return;
    }
    res.json({
      success: true,
      data: category,
      message: null,
      meta: null,
    });
  } catch (error) {
    next(error);
  }
}

export async function createCategoryHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { name, code, description } = CreateCategorySchema.parse(req.body);
    const category = await categoryRepository.create({
      name,
      code: code.toUpperCase(),
      description,
    });
    res.status(201).json({
      success: true,
      data: category,
      message: 'Category created successfully.',
      meta: null,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateCategoryHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const validated = UpdateCategorySchema.parse(req.body);
    const updateData = {
      ...validated,
      description: validated.description ?? undefined,
    };
    const category = await categoryRepository.update(id, updateData);
    res.json({
      success: true,
      data: category,
      message: 'Category updated successfully.',
      meta: null,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteCategoryHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await categoryRepository.delete(id);
    res.json({
      success: true,
      data: null,
      message: 'Category deleted successfully.',
      meta: null,
    });
  } catch (error) {
    next(error);
  }
}

export async function upsertCategoryDiscountPolicyHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const validated = UpsertCategoryDiscountPolicySchema.parse(req.body);
    const policy = await categoryRepository.upsertCategoryDiscountPolicy(id, validated);
    res.json({
      success: true,
      data: policy,
      message: 'Category discount policy updated successfully.',
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

export async function getPriceListByIdHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const priceList = await priceListRepository.findById(id);
    if (!priceList) {
      res.status(404).json({
        success: false,
        data: null,
        message: 'Price list not found',
        meta: null,
      });
      return;
    }
    res.json({
      success: true,
      data: priceList,
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
    const actor = (req as any).user;
    const priceList = await createPriceListService(validated, actor);
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




export async function getAttributesHandler(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const attributes = await attributeRepository.findAll();
    res.json({
      success: true,
      data: attributes,
      message: null,
      meta: null,
    });
  } catch (error) {
    next(error);
  }
}

export async function createAttributeHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { name, values } = CreateAttributeSchema.parse(req.body);
    const attribute = await attributeRepository.createAttribute(name, values);
    res.status(201).json({
      success: true,
      data: attribute,
      message: 'Attribute created successfully.',
      meta: null,
    });
  } catch (error) {
    next(error);
  }
}

export async function addAttributeValueHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const attributeId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { value } = AddAttributeValueSchema.parse(req.body);
    const val = await attributeRepository.addValue(attributeId, value);
    res.status(201).json({
      success: true,
      data: val,
      message: 'Attribute value added successfully.',
      meta: null,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteAttributeValueHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const valueId = Array.isArray(req.params.valueId) ? req.params.valueId[0] : req.params.valueId;
    await attributeRepository.deleteValue(valueId);
    res.json({
      success: true,
      data: null,
      message: 'Attribute value deleted successfully.',
      meta: null,
    });
  } catch (error) {
    next(error);
  }
}

export async function createVariantHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const productId = Array.isArray(req.params.productId) ? req.params.productId[0] : req.params.productId;
    const { sku, name, extraPrice, isActive, attributeValueIds } = req.body;
    const variant = await productRepository.createVariant(productId, {
      sku,
      name,
      extraPrice: Number(extraPrice) || 0,
      isActive: isActive ?? true,
      attributeValueIds: Array.isArray(attributeValueIds) ? attributeValueIds : [],
    });
    res.status(201).json({
      success: true,
      data: variant,
      message: 'Variant created successfully.',
      meta: null,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateVariantHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const variantId = Array.isArray(req.params.variantId) ? req.params.variantId[0] : req.params.variantId;
    const validated = UpdateVariantSchema.parse(req.body);
    const variant = await productRepository.updateVariant(variantId, validated);
    res.json({
      success: true,
      data: variant,
      message: 'Variant updated successfully.',
      meta: null,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteVariantHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const variantId = Array.isArray(req.params.variantId) ? req.params.variantId[0] : req.params.variantId;
    await productRepository.deleteVariant(variantId);
    res.json({
      success: true,
      data: null,
      message: 'Variant deleted successfully.',
      meta: null,
    });
  } catch (error) {
    next(error);
  }
}

export async function updatePriceListHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const validated = UpdatePriceListSchema.parse(req.body);
    const actor = (req as any).user;
    const priceList = await updatePriceListService(id, validated as any, actor);
    res.json({
      success: true,
      data: priceList,
      message: 'Price list updated successfully.',
      meta: null,
    });
  } catch (error) {
    next(error);
  }
}

export async function deletePriceListHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await priceListRepository.delete(id);
    res.json({
      success: true,
      data: null,
      message: 'Price list deleted successfully.',
      meta: null,
    });
  } catch (error) {
    next(error);
  }
}

export async function upsertPriceListEntryHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const priceListId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { productId, unitPrice } = UpsertPriceListEntrySchema.parse(req.body);
    const actor = (req as any).user;
    const entry = await upsertPriceListEntryService(priceListId, productId, unitPrice, actor);
    res.json({
      success: true,
      data: entry,
      message: 'Price list entry saved successfully.',
      meta: null,
    });
  } catch (error) {
    next(error);
  }
}

export async function deletePriceListEntryHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const priceListId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const productId = Array.isArray(req.params.productId) ? req.params.productId[0] : req.params.productId;
    await priceListRepository.deleteEntry(priceListId, productId);
    res.json({
      success: true,
      data: null,
      message: 'Price list entry deleted successfully.',
      meta: null,
    });
  } catch (error) {
    next(error);
  }
}

