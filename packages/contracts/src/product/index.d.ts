import { z } from 'zod';
export declare const ProductCategoryEnum: z.ZodEnum<["HARDWARE", "SOFTWARE_LICENSE", "SUBSCRIPTION", "PROFESSIONAL_SERVICES", "SUPPORT"]>;
export type ProductCategory = z.infer<typeof ProductCategoryEnum>;
export declare const ProductTypeEnum: z.ZodEnum<["ONE_TIME", "RECURRING"]>;
export type ProductType = z.infer<typeof ProductTypeEnum>;
export declare const CategorySchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    code: z.ZodString;
    createdAt: z.ZodOptional<z.ZodString>;
    updatedAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    code: string;
    id: string;
    name: string;
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
}, {
    code: string;
    id: string;
    name: string;
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
}>;
export type CategoryDto = z.infer<typeof CategorySchema>;
export declare const CreateCategorySchema: z.ZodObject<{
    name: z.ZodString;
    code: z.ZodString;
}, "strip", z.ZodTypeAny, {
    code: string;
    name: string;
}, {
    code: string;
    name: string;
}>;
export type CreateCategoryRequest = z.infer<typeof CreateCategorySchema>;
export declare const CategoryReferenceSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    code: z.ZodString;
    isPrimary: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    code: string;
    id: string;
    name: string;
    isPrimary: boolean;
}, {
    code: string;
    id: string;
    name: string;
    isPrimary: boolean;
}>;
export type CategoryReferenceDto = z.infer<typeof CategoryReferenceSchema>;
export declare const VariantAttributeValueSchema: z.ZodObject<{
    attributeName: z.ZodString;
    attributeValue: z.ZodString;
}, "strip", z.ZodTypeAny, {
    attributeName: string;
    attributeValue: string;
}, {
    attributeName: string;
    attributeValue: string;
}>;
export type VariantAttributeValueDto = z.infer<typeof VariantAttributeValueSchema>;
export declare const ProductVariantSchema: z.ZodObject<{
    id: z.ZodString;
    productId: z.ZodString;
    sku: z.ZodString;
    name: z.ZodString;
    extraPrice: z.ZodNumber;
    isActive: z.ZodBoolean;
    attributes: z.ZodDefault<z.ZodArray<z.ZodObject<{
        attributeName: z.ZodString;
        attributeValue: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        attributeName: string;
        attributeValue: string;
    }, {
        attributeName: string;
        attributeValue: string;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    productId: string;
    isActive: boolean;
    sku: string;
    extraPrice: number;
    attributes: {
        attributeName: string;
        attributeValue: string;
    }[];
}, {
    id: string;
    name: string;
    productId: string;
    isActive: boolean;
    sku: string;
    extraPrice: number;
    attributes?: {
        attributeName: string;
        attributeValue: string;
    }[] | undefined;
}>;
export type ProductVariantDto = z.infer<typeof ProductVariantSchema>;
export declare const CreateVariantSchema: z.ZodObject<{
    sku: z.ZodString;
    name: z.ZodString;
    extraPrice: z.ZodDefault<z.ZodNumber>;
    attributes: z.ZodDefault<z.ZodArray<z.ZodObject<{
        attributeName: z.ZodString;
        attributeValue: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        attributeName: string;
        attributeValue: string;
    }, {
        attributeName: string;
        attributeValue: string;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    name: string;
    sku: string;
    extraPrice: number;
    attributes: {
        attributeName: string;
        attributeValue: string;
    }[];
}, {
    name: string;
    sku: string;
    extraPrice?: number | undefined;
    attributes?: {
        attributeName: string;
        attributeValue: string;
    }[] | undefined;
}>;
export type CreateVariantRequest = z.infer<typeof CreateVariantSchema>;
export declare const ProductAttributeValueSchema: z.ZodObject<{
    id: z.ZodString;
    attributeId: z.ZodString;
    value: z.ZodString;
}, "strip", z.ZodTypeAny, {
    value: string;
    id: string;
    attributeId: string;
}, {
    value: string;
    id: string;
    attributeId: string;
}>;
export type ProductAttributeValueDto = z.infer<typeof ProductAttributeValueSchema>;
export declare const ProductAttributeSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    values: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        attributeId: z.ZodString;
        value: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        value: string;
        id: string;
        attributeId: string;
    }, {
        value: string;
        id: string;
        attributeId: string;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    values: {
        value: string;
        id: string;
        attributeId: string;
    }[];
    id: string;
    name: string;
}, {
    id: string;
    name: string;
    values?: {
        value: string;
        id: string;
        attributeId: string;
    }[] | undefined;
}>;
export type ProductAttributeDto = z.infer<typeof ProductAttributeSchema>;
export declare const CreateAttributeSchema: z.ZodObject<{
    name: z.ZodString;
    values: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    values: string[];
    name: string;
}, {
    name: string;
    values?: string[] | undefined;
}>;
export type CreateAttributeRequest = z.infer<typeof CreateAttributeSchema>;
export declare const PriceListEntrySchema: z.ZodObject<{
    id: z.ZodString;
    priceListId: z.ZodString;
    productId: z.ZodString;
    unitPrice: z.ZodNumber;
    product: z.ZodNullable<z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        sku: z.ZodString;
        name: z.ZodString;
        category: z.ZodOptional<z.ZodString>;
        unitPrice: z.ZodOptional<z.ZodNumber>;
        listPrice: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        sku: string;
        category?: string | undefined;
        listPrice?: number | undefined;
        unitPrice?: number | undefined;
    }, {
        id: string;
        name: string;
        sku: string;
        category?: string | undefined;
        listPrice?: number | undefined;
        unitPrice?: number | undefined;
    }>>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    productId: string;
    priceListId: string;
    unitPrice: number;
    product?: {
        id: string;
        name: string;
        sku: string;
        category?: string | undefined;
        listPrice?: number | undefined;
        unitPrice?: number | undefined;
    } | null | undefined;
}, {
    id: string;
    productId: string;
    priceListId: string;
    unitPrice: number;
    product?: {
        id: string;
        name: string;
        sku: string;
        category?: string | undefined;
        listPrice?: number | undefined;
        unitPrice?: number | undefined;
    } | null | undefined;
}>;
export type PriceListEntryDto = z.infer<typeof PriceListEntrySchema>;
export declare const PriceListSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    customerTier: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    currency: z.ZodDefault<z.ZodString>;
    isDefault: z.ZodDefault<z.ZodBoolean>;
    isActive: z.ZodDefault<z.ZodBoolean>;
    entries: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        priceListId: z.ZodString;
        productId: z.ZodString;
        unitPrice: z.ZodNumber;
        product: z.ZodNullable<z.ZodOptional<z.ZodObject<{
            id: z.ZodString;
            sku: z.ZodString;
            name: z.ZodString;
            category: z.ZodOptional<z.ZodString>;
            unitPrice: z.ZodOptional<z.ZodNumber>;
            listPrice: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            name: string;
            sku: string;
            category?: string | undefined;
            listPrice?: number | undefined;
            unitPrice?: number | undefined;
        }, {
            id: string;
            name: string;
            sku: string;
            category?: string | undefined;
            listPrice?: number | undefined;
            unitPrice?: number | undefined;
        }>>>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        productId: string;
        priceListId: string;
        unitPrice: number;
        product?: {
            id: string;
            name: string;
            sku: string;
            category?: string | undefined;
            listPrice?: number | undefined;
            unitPrice?: number | undefined;
        } | null | undefined;
    }, {
        id: string;
        productId: string;
        priceListId: string;
        unitPrice: number;
        product?: {
            id: string;
            name: string;
            sku: string;
            category?: string | undefined;
            listPrice?: number | undefined;
            unitPrice?: number | undefined;
        } | null | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    isActive: boolean;
    currency: string;
    isDefault: boolean;
    entries?: {
        id: string;
        productId: string;
        priceListId: string;
        unitPrice: number;
        product?: {
            id: string;
            name: string;
            sku: string;
            category?: string | undefined;
            listPrice?: number | undefined;
            unitPrice?: number | undefined;
        } | null | undefined;
    }[] | undefined;
    customerTier?: string | null | undefined;
}, {
    id: string;
    name: string;
    entries?: {
        id: string;
        productId: string;
        priceListId: string;
        unitPrice: number;
        product?: {
            id: string;
            name: string;
            sku: string;
            category?: string | undefined;
            listPrice?: number | undefined;
            unitPrice?: number | undefined;
        } | null | undefined;
    }[] | undefined;
    customerTier?: string | null | undefined;
    isActive?: boolean | undefined;
    currency?: string | undefined;
    isDefault?: boolean | undefined;
}>;
export type PriceListDto = z.infer<typeof PriceListSchema>;
export declare const CreatePriceListSchema: z.ZodObject<{
    name: z.ZodString;
    customerTier: z.ZodNullable<z.ZodOptional<z.ZodEnum<["ENTERPRISE", "TIER_1", "TIER_2", "TIER_3"]>>>;
    currency: z.ZodDefault<z.ZodString>;
    isDefault: z.ZodDefault<z.ZodBoolean>;
    isActive: z.ZodDefault<z.ZodBoolean>;
    entries: z.ZodOptional<z.ZodArray<z.ZodObject<{
        productId: z.ZodString;
        unitPrice: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        productId: string;
        unitPrice: number;
    }, {
        productId: string;
        unitPrice: number;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    name: string;
    isActive: boolean;
    currency: string;
    isDefault: boolean;
    entries?: {
        productId: string;
        unitPrice: number;
    }[] | undefined;
    customerTier?: "ENTERPRISE" | "TIER_1" | "TIER_2" | "TIER_3" | null | undefined;
}, {
    name: string;
    entries?: {
        productId: string;
        unitPrice: number;
    }[] | undefined;
    customerTier?: "ENTERPRISE" | "TIER_1" | "TIER_2" | "TIER_3" | null | undefined;
    isActive?: boolean | undefined;
    currency?: string | undefined;
    isDefault?: boolean | undefined;
}>;
export type CreatePriceListRequest = z.infer<typeof CreatePriceListSchema>;
export declare const UpdatePriceListSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    customerTier: z.ZodNullable<z.ZodOptional<z.ZodEnum<["ENTERPRISE", "TIER_1", "TIER_2", "TIER_3"]>>>;
    currency: z.ZodOptional<z.ZodString>;
    isDefault: z.ZodOptional<z.ZodBoolean>;
    isActive: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    customerTier?: "ENTERPRISE" | "TIER_1" | "TIER_2" | "TIER_3" | null | undefined;
    isActive?: boolean | undefined;
    currency?: string | undefined;
    isDefault?: boolean | undefined;
}, {
    name?: string | undefined;
    customerTier?: "ENTERPRISE" | "TIER_1" | "TIER_2" | "TIER_3" | null | undefined;
    isActive?: boolean | undefined;
    currency?: string | undefined;
    isDefault?: boolean | undefined;
}>;
export type UpdatePriceListRequest = z.infer<typeof UpdatePriceListSchema>;
export declare const UpsertPriceListEntrySchema: z.ZodObject<{
    productId: z.ZodString;
    unitPrice: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    productId: string;
    unitPrice: number;
}, {
    productId: string;
    unitPrice: number;
}>;
export type UpsertPriceListEntryRequest = z.infer<typeof UpsertPriceListEntrySchema>;
export declare const AddAttributeValueSchema: z.ZodObject<{
    value: z.ZodString;
}, "strip", z.ZodTypeAny, {
    value: string;
}, {
    value: string;
}>;
export type AddAttributeValueRequest = z.infer<typeof AddAttributeValueSchema>;
export declare const UpdateVariantSchema: z.ZodObject<{
    sku: z.ZodOptional<z.ZodString>;
    name: z.ZodOptional<z.ZodString>;
    extraPrice: z.ZodOptional<z.ZodNumber>;
    isActive: z.ZodOptional<z.ZodBoolean>;
    attributeValueIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    isActive?: boolean | undefined;
    sku?: string | undefined;
    extraPrice?: number | undefined;
    attributeValueIds?: string[] | undefined;
}, {
    name?: string | undefined;
    isActive?: boolean | undefined;
    sku?: string | undefined;
    extraPrice?: number | undefined;
    attributeValueIds?: string[] | undefined;
}>;
export type UpdateVariantRequest = z.infer<typeof UpdateVariantSchema>;
export declare const ProductSchema: z.ZodObject<{
    id: z.ZodString;
    sku: z.ZodString;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    category: z.ZodEnum<["HARDWARE", "SOFTWARE_LICENSE", "SUBSCRIPTION", "PROFESSIONAL_SERVICES", "SUPPORT"]>;
    primaryCategory: z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        code: z.ZodString;
        isPrimary: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        code: string;
        id: string;
        name: string;
        isPrimary: boolean;
    }, {
        code: string;
        id: string;
        name: string;
        isPrimary: boolean;
    }>>;
    categories: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        code: z.ZodString;
        isPrimary: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        code: string;
        id: string;
        name: string;
        isPrimary: boolean;
    }, {
        code: string;
        id: string;
        name: string;
        isPrimary: boolean;
    }>, "many">>;
    type: z.ZodEnum<["ONE_TIME", "RECURRING"]>;
    unit: z.ZodDefault<z.ZodString>;
    taxRate: z.ZodDefault<z.ZodNumber>;
    unitPrice: z.ZodNumber;
    costPrice: z.ZodNumber;
    maxAllowedDiscount: z.ZodNumber;
    isActive: z.ZodBoolean;
    variants: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        productId: z.ZodString;
        sku: z.ZodString;
        name: z.ZodString;
        extraPrice: z.ZodNumber;
        isActive: z.ZodBoolean;
        attributes: z.ZodDefault<z.ZodArray<z.ZodObject<{
            attributeName: z.ZodString;
            attributeValue: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            attributeName: string;
            attributeValue: string;
        }, {
            attributeName: string;
            attributeValue: string;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        productId: string;
        isActive: boolean;
        sku: string;
        extraPrice: number;
        attributes: {
            attributeName: string;
            attributeValue: string;
        }[];
    }, {
        id: string;
        name: string;
        productId: string;
        isActive: boolean;
        sku: string;
        extraPrice: number;
        attributes?: {
            attributeName: string;
            attributeValue: string;
        }[] | undefined;
    }>, "many">>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: "ONE_TIME" | "RECURRING";
    id: string;
    name: string;
    category: "HARDWARE" | "SOFTWARE_LICENSE" | "SUBSCRIPTION" | "PROFESSIONAL_SERVICES" | "SUPPORT";
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    sku: string;
    unitPrice: number;
    categories: {
        code: string;
        id: string;
        name: string;
        isPrimary: boolean;
    }[];
    unit: string;
    taxRate: number;
    costPrice: number;
    maxAllowedDiscount: number;
    variants: {
        id: string;
        name: string;
        productId: string;
        isActive: boolean;
        sku: string;
        extraPrice: number;
        attributes: {
            attributeName: string;
            attributeValue: string;
        }[];
    }[];
    description?: string | null | undefined;
    primaryCategory?: {
        code: string;
        id: string;
        name: string;
        isPrimary: boolean;
    } | undefined;
}, {
    type: "ONE_TIME" | "RECURRING";
    id: string;
    name: string;
    category: "HARDWARE" | "SOFTWARE_LICENSE" | "SUBSCRIPTION" | "PROFESSIONAL_SERVICES" | "SUPPORT";
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    sku: string;
    unitPrice: number;
    costPrice: number;
    maxAllowedDiscount: number;
    description?: string | null | undefined;
    primaryCategory?: {
        code: string;
        id: string;
        name: string;
        isPrimary: boolean;
    } | undefined;
    categories?: {
        code: string;
        id: string;
        name: string;
        isPrimary: boolean;
    }[] | undefined;
    unit?: string | undefined;
    taxRate?: number | undefined;
    variants?: {
        id: string;
        name: string;
        productId: string;
        isActive: boolean;
        sku: string;
        extraPrice: number;
        attributes?: {
            attributeName: string;
            attributeValue: string;
        }[] | undefined;
    }[] | undefined;
}>;
export type ProductDto = z.infer<typeof ProductSchema>;
export declare const ProductReferenceSchema: z.ZodObject<{
    id: z.ZodString;
    sku: z.ZodString;
    name: z.ZodString;
    category: z.ZodEnum<["HARDWARE", "SOFTWARE_LICENSE", "SUBSCRIPTION", "PROFESSIONAL_SERVICES", "SUPPORT"]>;
    primaryCategory: z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        code: z.ZodString;
        isPrimary: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        code: string;
        id: string;
        name: string;
        isPrimary: boolean;
    }, {
        code: string;
        id: string;
        name: string;
        isPrimary: boolean;
    }>>;
    categories: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        code: z.ZodString;
        isPrimary: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        code: string;
        id: string;
        name: string;
        isPrimary: boolean;
    }, {
        code: string;
        id: string;
        name: string;
        isPrimary: boolean;
    }>, "many">>;
    type: z.ZodEnum<["ONE_TIME", "RECURRING"]>;
    unit: z.ZodDefault<z.ZodString>;
    taxRate: z.ZodDefault<z.ZodNumber>;
    unitPrice: z.ZodNumber;
    costPrice: z.ZodNumber;
    maxAllowedDiscount: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    type: "ONE_TIME" | "RECURRING";
    id: string;
    name: string;
    category: "HARDWARE" | "SOFTWARE_LICENSE" | "SUBSCRIPTION" | "PROFESSIONAL_SERVICES" | "SUPPORT";
    sku: string;
    unitPrice: number;
    categories: {
        code: string;
        id: string;
        name: string;
        isPrimary: boolean;
    }[];
    unit: string;
    taxRate: number;
    costPrice: number;
    maxAllowedDiscount: number;
    primaryCategory?: {
        code: string;
        id: string;
        name: string;
        isPrimary: boolean;
    } | undefined;
}, {
    type: "ONE_TIME" | "RECURRING";
    id: string;
    name: string;
    category: "HARDWARE" | "SOFTWARE_LICENSE" | "SUBSCRIPTION" | "PROFESSIONAL_SERVICES" | "SUPPORT";
    sku: string;
    unitPrice: number;
    costPrice: number;
    maxAllowedDiscount: number;
    primaryCategory?: {
        code: string;
        id: string;
        name: string;
        isPrimary: boolean;
    } | undefined;
    categories?: {
        code: string;
        id: string;
        name: string;
        isPrimary: boolean;
    }[] | undefined;
    unit?: string | undefined;
    taxRate?: number | undefined;
}>;
export type ProductReferenceDto = z.infer<typeof ProductReferenceSchema>;
export declare const CreateProductSchema: z.ZodObject<{
    sku: z.ZodString;
    name: z.ZodString;
    description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    category: z.ZodEnum<["HARDWARE", "SOFTWARE_LICENSE", "SUBSCRIPTION", "PROFESSIONAL_SERVICES", "SUPPORT"]>;
    additionalCategoryIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    type: z.ZodDefault<z.ZodEnum<["ONE_TIME", "RECURRING"]>>;
    unit: z.ZodDefault<z.ZodString>;
    taxRate: z.ZodDefault<z.ZodNumber>;
    unitPrice: z.ZodNumber;
    costPrice: z.ZodNumber;
    maxAllowedDiscount: z.ZodDefault<z.ZodNumber>;
    isActive: z.ZodDefault<z.ZodBoolean>;
    variants: z.ZodOptional<z.ZodArray<z.ZodObject<{
        sku: z.ZodString;
        name: z.ZodString;
        extraPrice: z.ZodDefault<z.ZodNumber>;
        attributes: z.ZodDefault<z.ZodArray<z.ZodObject<{
            attributeName: z.ZodString;
            attributeValue: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            attributeName: string;
            attributeValue: string;
        }, {
            attributeName: string;
            attributeValue: string;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        sku: string;
        extraPrice: number;
        attributes: {
            attributeName: string;
            attributeValue: string;
        }[];
    }, {
        name: string;
        sku: string;
        extraPrice?: number | undefined;
        attributes?: {
            attributeName: string;
            attributeValue: string;
        }[] | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    type: "ONE_TIME" | "RECURRING";
    name: string;
    category: "HARDWARE" | "SOFTWARE_LICENSE" | "SUBSCRIPTION" | "PROFESSIONAL_SERVICES" | "SUPPORT";
    isActive: boolean;
    sku: string;
    unitPrice: number;
    unit: string;
    taxRate: number;
    costPrice: number;
    maxAllowedDiscount: number;
    description?: string | null | undefined;
    variants?: {
        name: string;
        sku: string;
        extraPrice: number;
        attributes: {
            attributeName: string;
            attributeValue: string;
        }[];
    }[] | undefined;
    additionalCategoryIds?: string[] | undefined;
}, {
    name: string;
    category: "HARDWARE" | "SOFTWARE_LICENSE" | "SUBSCRIPTION" | "PROFESSIONAL_SERVICES" | "SUPPORT";
    sku: string;
    unitPrice: number;
    costPrice: number;
    type?: "ONE_TIME" | "RECURRING" | undefined;
    description?: string | null | undefined;
    isActive?: boolean | undefined;
    unit?: string | undefined;
    taxRate?: number | undefined;
    maxAllowedDiscount?: number | undefined;
    variants?: {
        name: string;
        sku: string;
        extraPrice?: number | undefined;
        attributes?: {
            attributeName: string;
            attributeValue: string;
        }[] | undefined;
    }[] | undefined;
    additionalCategoryIds?: string[] | undefined;
}>;
export type CreateProductRequest = z.infer<typeof CreateProductSchema>;
export declare const UpdateProductSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    category: z.ZodOptional<z.ZodEnum<["HARDWARE", "SOFTWARE_LICENSE", "SUBSCRIPTION", "PROFESSIONAL_SERVICES", "SUPPORT"]>>;
    additionalCategoryIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    type: z.ZodOptional<z.ZodEnum<["ONE_TIME", "RECURRING"]>>;
    unit: z.ZodOptional<z.ZodString>;
    taxRate: z.ZodOptional<z.ZodNumber>;
    unitPrice: z.ZodOptional<z.ZodNumber>;
    costPrice: z.ZodOptional<z.ZodNumber>;
    maxAllowedDiscount: z.ZodOptional<z.ZodNumber>;
    isActive: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    type?: "ONE_TIME" | "RECURRING" | undefined;
    name?: string | undefined;
    description?: string | null | undefined;
    category?: "HARDWARE" | "SOFTWARE_LICENSE" | "SUBSCRIPTION" | "PROFESSIONAL_SERVICES" | "SUPPORT" | undefined;
    isActive?: boolean | undefined;
    unitPrice?: number | undefined;
    unit?: string | undefined;
    taxRate?: number | undefined;
    costPrice?: number | undefined;
    maxAllowedDiscount?: number | undefined;
    additionalCategoryIds?: string[] | undefined;
}, {
    type?: "ONE_TIME" | "RECURRING" | undefined;
    name?: string | undefined;
    description?: string | null | undefined;
    category?: "HARDWARE" | "SOFTWARE_LICENSE" | "SUBSCRIPTION" | "PROFESSIONAL_SERVICES" | "SUPPORT" | undefined;
    isActive?: boolean | undefined;
    unitPrice?: number | undefined;
    unit?: string | undefined;
    taxRate?: number | undefined;
    costPrice?: number | undefined;
    maxAllowedDiscount?: number | undefined;
    additionalCategoryIds?: string[] | undefined;
}>;
export type UpdateProductRequest = z.infer<typeof UpdateProductSchema>;
export declare const ProductFilterQuerySchema: z.ZodObject<{
    search: z.ZodOptional<z.ZodString>;
    category: z.ZodOptional<z.ZodEnum<["HARDWARE", "SOFTWARE_LICENSE", "SUBSCRIPTION", "PROFESSIONAL_SERVICES", "SUPPORT"]>>;
    categoryIds: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodEnum<["ONE_TIME", "RECURRING"]>>;
    tier: z.ZodOptional<z.ZodString>;
    currency: z.ZodOptional<z.ZodString>;
    isActive: z.ZodEffects<z.ZodOptional<z.ZodBoolean>, boolean | undefined, unknown>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    type?: "ONE_TIME" | "RECURRING" | undefined;
    category?: "HARDWARE" | "SOFTWARE_LICENSE" | "SUBSCRIPTION" | "PROFESSIONAL_SERVICES" | "SUPPORT" | undefined;
    isActive?: boolean | undefined;
    currency?: string | undefined;
    search?: string | undefined;
    categoryIds?: string | undefined;
    tier?: string | undefined;
}, {
    type?: "ONE_TIME" | "RECURRING" | undefined;
    category?: "HARDWARE" | "SOFTWARE_LICENSE" | "SUBSCRIPTION" | "PROFESSIONAL_SERVICES" | "SUPPORT" | undefined;
    isActive?: unknown;
    currency?: string | undefined;
    search?: string | undefined;
    categoryIds?: string | undefined;
    tier?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
}>;
export type ProductFilterQuery = z.infer<typeof ProductFilterQuerySchema>;
export declare const ProductListResponseSchema: z.ZodObject<{
    items: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        sku: z.ZodString;
        name: z.ZodString;
        description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        category: z.ZodEnum<["HARDWARE", "SOFTWARE_LICENSE", "SUBSCRIPTION", "PROFESSIONAL_SERVICES", "SUPPORT"]>;
        primaryCategory: z.ZodOptional<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            code: z.ZodString;
            isPrimary: z.ZodBoolean;
        }, "strip", z.ZodTypeAny, {
            code: string;
            id: string;
            name: string;
            isPrimary: boolean;
        }, {
            code: string;
            id: string;
            name: string;
            isPrimary: boolean;
        }>>;
        categories: z.ZodDefault<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            code: z.ZodString;
            isPrimary: z.ZodBoolean;
        }, "strip", z.ZodTypeAny, {
            code: string;
            id: string;
            name: string;
            isPrimary: boolean;
        }, {
            code: string;
            id: string;
            name: string;
            isPrimary: boolean;
        }>, "many">>;
        type: z.ZodEnum<["ONE_TIME", "RECURRING"]>;
        unit: z.ZodDefault<z.ZodString>;
        taxRate: z.ZodDefault<z.ZodNumber>;
        unitPrice: z.ZodNumber;
        costPrice: z.ZodNumber;
        maxAllowedDiscount: z.ZodNumber;
        isActive: z.ZodBoolean;
        variants: z.ZodDefault<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            productId: z.ZodString;
            sku: z.ZodString;
            name: z.ZodString;
            extraPrice: z.ZodNumber;
            isActive: z.ZodBoolean;
            attributes: z.ZodDefault<z.ZodArray<z.ZodObject<{
                attributeName: z.ZodString;
                attributeValue: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                attributeName: string;
                attributeValue: string;
            }, {
                attributeName: string;
                attributeValue: string;
            }>, "many">>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            name: string;
            productId: string;
            isActive: boolean;
            sku: string;
            extraPrice: number;
            attributes: {
                attributeName: string;
                attributeValue: string;
            }[];
        }, {
            id: string;
            name: string;
            productId: string;
            isActive: boolean;
            sku: string;
            extraPrice: number;
            attributes?: {
                attributeName: string;
                attributeValue: string;
            }[] | undefined;
        }>, "many">>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type: "ONE_TIME" | "RECURRING";
        id: string;
        name: string;
        category: "HARDWARE" | "SOFTWARE_LICENSE" | "SUBSCRIPTION" | "PROFESSIONAL_SERVICES" | "SUPPORT";
        isActive: boolean;
        createdAt: string;
        updatedAt: string;
        sku: string;
        unitPrice: number;
        categories: {
            code: string;
            id: string;
            name: string;
            isPrimary: boolean;
        }[];
        unit: string;
        taxRate: number;
        costPrice: number;
        maxAllowedDiscount: number;
        variants: {
            id: string;
            name: string;
            productId: string;
            isActive: boolean;
            sku: string;
            extraPrice: number;
            attributes: {
                attributeName: string;
                attributeValue: string;
            }[];
        }[];
        description?: string | null | undefined;
        primaryCategory?: {
            code: string;
            id: string;
            name: string;
            isPrimary: boolean;
        } | undefined;
    }, {
        type: "ONE_TIME" | "RECURRING";
        id: string;
        name: string;
        category: "HARDWARE" | "SOFTWARE_LICENSE" | "SUBSCRIPTION" | "PROFESSIONAL_SERVICES" | "SUPPORT";
        isActive: boolean;
        createdAt: string;
        updatedAt: string;
        sku: string;
        unitPrice: number;
        costPrice: number;
        maxAllowedDiscount: number;
        description?: string | null | undefined;
        primaryCategory?: {
            code: string;
            id: string;
            name: string;
            isPrimary: boolean;
        } | undefined;
        categories?: {
            code: string;
            id: string;
            name: string;
            isPrimary: boolean;
        }[] | undefined;
        unit?: string | undefined;
        taxRate?: number | undefined;
        variants?: {
            id: string;
            name: string;
            productId: string;
            isActive: boolean;
            sku: string;
            extraPrice: number;
            attributes?: {
                attributeName: string;
                attributeValue: string;
            }[] | undefined;
        }[] | undefined;
    }>, "many">;
    total: z.ZodNumber;
    page: z.ZodNumber;
    limit: z.ZodNumber;
    totalPages: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    items: {
        type: "ONE_TIME" | "RECURRING";
        id: string;
        name: string;
        category: "HARDWARE" | "SOFTWARE_LICENSE" | "SUBSCRIPTION" | "PROFESSIONAL_SERVICES" | "SUPPORT";
        isActive: boolean;
        createdAt: string;
        updatedAt: string;
        sku: string;
        unitPrice: number;
        categories: {
            code: string;
            id: string;
            name: string;
            isPrimary: boolean;
        }[];
        unit: string;
        taxRate: number;
        costPrice: number;
        maxAllowedDiscount: number;
        variants: {
            id: string;
            name: string;
            productId: string;
            isActive: boolean;
            sku: string;
            extraPrice: number;
            attributes: {
                attributeName: string;
                attributeValue: string;
            }[];
        }[];
        description?: string | null | undefined;
        primaryCategory?: {
            code: string;
            id: string;
            name: string;
            isPrimary: boolean;
        } | undefined;
    }[];
    total: number;
    totalPages: number;
}, {
    page: number;
    limit: number;
    items: {
        type: "ONE_TIME" | "RECURRING";
        id: string;
        name: string;
        category: "HARDWARE" | "SOFTWARE_LICENSE" | "SUBSCRIPTION" | "PROFESSIONAL_SERVICES" | "SUPPORT";
        isActive: boolean;
        createdAt: string;
        updatedAt: string;
        sku: string;
        unitPrice: number;
        costPrice: number;
        maxAllowedDiscount: number;
        description?: string | null | undefined;
        primaryCategory?: {
            code: string;
            id: string;
            name: string;
            isPrimary: boolean;
        } | undefined;
        categories?: {
            code: string;
            id: string;
            name: string;
            isPrimary: boolean;
        }[] | undefined;
        unit?: string | undefined;
        taxRate?: number | undefined;
        variants?: {
            id: string;
            name: string;
            productId: string;
            isActive: boolean;
            sku: string;
            extraPrice: number;
            attributes?: {
                attributeName: string;
                attributeValue: string;
            }[] | undefined;
        }[] | undefined;
    }[];
    total: number;
    totalPages: number;
}>;
export type ProductListResponse = z.infer<typeof ProductListResponseSchema>;
//# sourceMappingURL=index.d.ts.map