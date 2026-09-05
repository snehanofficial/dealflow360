import { z } from 'zod';
export declare const DiscountPolicyRuleSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    customerTier: z.ZodOptional<z.ZodNullable<z.ZodEnum<["ENTERPRISE", "GOLD", "SILVER", "BRONZE"]>>>;
    category: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    productId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    maxDiscountPercent: z.ZodNumber;
    minMarginPercent: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    requiredApprovalRole: z.ZodDefault<z.ZodEnum<["ADMIN", "SALES_MANAGER", "SALES_REP", "FINANCE_OPERATIONS", "CUSTOMER"]>>;
    priority: z.ZodDefault<z.ZodNumber>;
    isActive: z.ZodDefault<z.ZodBoolean>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    maxDiscountPercent: number;
    requiredApprovalRole: "ADMIN" | "SALES_MANAGER" | "SALES_REP" | "FINANCE_OPERATIONS" | "CUSTOMER";
    priority: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    description?: string | null | undefined;
    customerTier?: "ENTERPRISE" | "GOLD" | "SILVER" | "BRONZE" | null | undefined;
    category?: string | null | undefined;
    productId?: string | null | undefined;
    minMarginPercent?: number | null | undefined;
}, {
    id: string;
    name: string;
    maxDiscountPercent: number;
    createdAt: string;
    updatedAt: string;
    description?: string | null | undefined;
    customerTier?: "ENTERPRISE" | "GOLD" | "SILVER" | "BRONZE" | null | undefined;
    category?: string | null | undefined;
    productId?: string | null | undefined;
    minMarginPercent?: number | null | undefined;
    requiredApprovalRole?: "ADMIN" | "SALES_MANAGER" | "SALES_REP" | "FINANCE_OPERATIONS" | "CUSTOMER" | undefined;
    priority?: number | undefined;
    isActive?: boolean | undefined;
}>;
export type DiscountPolicyRuleDto = z.infer<typeof DiscountPolicyRuleSchema>;
export declare const CreateDiscountPolicyRuleSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    customerTier: z.ZodOptional<z.ZodNullable<z.ZodEnum<["ENTERPRISE", "GOLD", "SILVER", "BRONZE"]>>>;
    category: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    productId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    maxDiscountPercent: z.ZodNumber;
    minMarginPercent: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    requiredApprovalRole: z.ZodDefault<z.ZodOptional<z.ZodEnum<["ADMIN", "SALES_MANAGER", "SALES_REP", "FINANCE_OPERATIONS", "CUSTOMER"]>>>;
    priority: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    isActive: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    maxDiscountPercent: number;
    requiredApprovalRole: "ADMIN" | "SALES_MANAGER" | "SALES_REP" | "FINANCE_OPERATIONS" | "CUSTOMER";
    priority: number;
    isActive: boolean;
    description?: string | undefined;
    customerTier?: "ENTERPRISE" | "GOLD" | "SILVER" | "BRONZE" | null | undefined;
    category?: string | null | undefined;
    productId?: string | null | undefined;
    minMarginPercent?: number | null | undefined;
}, {
    name: string;
    maxDiscountPercent: number;
    description?: string | undefined;
    customerTier?: "ENTERPRISE" | "GOLD" | "SILVER" | "BRONZE" | null | undefined;
    category?: string | null | undefined;
    productId?: string | null | undefined;
    minMarginPercent?: number | null | undefined;
    requiredApprovalRole?: "ADMIN" | "SALES_MANAGER" | "SALES_REP" | "FINANCE_OPERATIONS" | "CUSTOMER" | undefined;
    priority?: number | undefined;
    isActive?: boolean | undefined;
}>;
export type CreateDiscountPolicyRuleRequest = z.infer<typeof CreateDiscountPolicyRuleSchema>;
export declare const UpdateDiscountPolicyRuleSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    customerTier: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodEnum<["ENTERPRISE", "GOLD", "SILVER", "BRONZE"]>>>>;
    category: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    productId: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    maxDiscountPercent: z.ZodOptional<z.ZodNumber>;
    minMarginPercent: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
    requiredApprovalRole: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodEnum<["ADMIN", "SALES_MANAGER", "SALES_REP", "FINANCE_OPERATIONS", "CUSTOMER"]>>>>;
    priority: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodNumber>>>;
    isActive: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodBoolean>>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    description?: string | undefined;
    customerTier?: "ENTERPRISE" | "GOLD" | "SILVER" | "BRONZE" | null | undefined;
    category?: string | null | undefined;
    productId?: string | null | undefined;
    maxDiscountPercent?: number | undefined;
    minMarginPercent?: number | null | undefined;
    requiredApprovalRole?: "ADMIN" | "SALES_MANAGER" | "SALES_REP" | "FINANCE_OPERATIONS" | "CUSTOMER" | undefined;
    priority?: number | undefined;
    isActive?: boolean | undefined;
}, {
    name?: string | undefined;
    description?: string | undefined;
    customerTier?: "ENTERPRISE" | "GOLD" | "SILVER" | "BRONZE" | null | undefined;
    category?: string | null | undefined;
    productId?: string | null | undefined;
    maxDiscountPercent?: number | undefined;
    minMarginPercent?: number | null | undefined;
    requiredApprovalRole?: "ADMIN" | "SALES_MANAGER" | "SALES_REP" | "FINANCE_OPERATIONS" | "CUSTOMER" | undefined;
    priority?: number | undefined;
    isActive?: boolean | undefined;
}>;
export type UpdateDiscountPolicyRuleRequest = z.infer<typeof UpdateDiscountPolicyRuleSchema>;
export declare const PolicyViolationSchema: z.ZodObject<{
    ruleId: z.ZodOptional<z.ZodString>;
    ruleName: z.ZodString;
    violatedField: z.ZodEnum<["MAX_DISCOUNT", "MIN_MARGIN", "PRODUCT_MAX_DISCOUNT"]>;
    allowedValue: z.ZodNumber;
    proposedValue: z.ZodNumber;
    severity: z.ZodEnum<["WARNING", "VIOLATION", "CRITICAL"]>;
    message: z.ZodString;
}, "strip", z.ZodTypeAny, {
    message: string;
    ruleName: string;
    violatedField: "MAX_DISCOUNT" | "MIN_MARGIN" | "PRODUCT_MAX_DISCOUNT";
    allowedValue: number;
    proposedValue: number;
    severity: "WARNING" | "VIOLATION" | "CRITICAL";
    ruleId?: string | undefined;
}, {
    message: string;
    ruleName: string;
    violatedField: "MAX_DISCOUNT" | "MIN_MARGIN" | "PRODUCT_MAX_DISCOUNT";
    allowedValue: number;
    proposedValue: number;
    severity: "WARNING" | "VIOLATION" | "CRITICAL";
    ruleId?: string | undefined;
}>;
export type PolicyViolationDto = z.infer<typeof PolicyViolationSchema>;
export declare const EvaluationLineInputSchema: z.ZodObject<{
    productId: z.ZodString;
    variantId: z.ZodOptional<z.ZodString>;
    quantity: z.ZodNumber;
    proposedDiscountPercent: z.ZodNumber;
    unitPriceOverride: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    productId: string;
    quantity: number;
    proposedDiscountPercent: number;
    variantId?: string | undefined;
    unitPriceOverride?: number | undefined;
}, {
    productId: string;
    quantity: number;
    proposedDiscountPercent: number;
    variantId?: string | undefined;
    unitPriceOverride?: number | undefined;
}>;
export type EvaluationLineInput = z.infer<typeof EvaluationLineInputSchema>;
export declare const EvaluateCommercialScenarioSchema: z.ZodObject<{
    customerId: z.ZodOptional<z.ZodString>;
    customerTier: z.ZodOptional<z.ZodEnum<["ENTERPRISE", "GOLD", "SILVER", "BRONZE"]>>;
    currency: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    lines: z.ZodArray<z.ZodObject<{
        productId: z.ZodString;
        variantId: z.ZodOptional<z.ZodString>;
        quantity: z.ZodNumber;
        proposedDiscountPercent: z.ZodNumber;
        unitPriceOverride: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        productId: string;
        quantity: number;
        proposedDiscountPercent: number;
        variantId?: string | undefined;
        unitPriceOverride?: number | undefined;
    }, {
        productId: string;
        quantity: number;
        proposedDiscountPercent: number;
        variantId?: string | undefined;
        unitPriceOverride?: number | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    currency: string;
    lines: {
        productId: string;
        quantity: number;
        proposedDiscountPercent: number;
        variantId?: string | undefined;
        unitPriceOverride?: number | undefined;
    }[];
    customerTier?: "ENTERPRISE" | "GOLD" | "SILVER" | "BRONZE" | undefined;
    customerId?: string | undefined;
}, {
    lines: {
        productId: string;
        quantity: number;
        proposedDiscountPercent: number;
        variantId?: string | undefined;
        unitPriceOverride?: number | undefined;
    }[];
    customerTier?: "ENTERPRISE" | "GOLD" | "SILVER" | "BRONZE" | undefined;
    customerId?: string | undefined;
    currency?: string | undefined;
}>;
export type EvaluateCommercialScenarioRequest = z.infer<typeof EvaluateCommercialScenarioSchema>;
export declare const LineEvaluationDetailSchema: z.ZodObject<{
    productId: z.ZodString;
    sku: z.ZodString;
    productName: z.ZodString;
    category: z.ZodString;
    quantity: z.ZodNumber;
    effectiveUnitPrice: z.ZodNumber;
    lineSubtotal: z.ZodNumber;
    proposedDiscountPercent: z.ZodNumber;
    discountAmount: z.ZodNumber;
    netUnitPrice: z.ZodNumber;
    netLineTotal: z.ZodNumber;
    unitCost: z.ZodNumber;
    totalCost: z.ZodNumber;
    marginAmount: z.ZodNumber;
    marginPercentage: z.ZodNumber;
    violations: z.ZodArray<z.ZodObject<{
        ruleId: z.ZodOptional<z.ZodString>;
        ruleName: z.ZodString;
        violatedField: z.ZodEnum<["MAX_DISCOUNT", "MIN_MARGIN", "PRODUCT_MAX_DISCOUNT"]>;
        allowedValue: z.ZodNumber;
        proposedValue: z.ZodNumber;
        severity: z.ZodEnum<["WARNING", "VIOLATION", "CRITICAL"]>;
        message: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        message: string;
        ruleName: string;
        violatedField: "MAX_DISCOUNT" | "MIN_MARGIN" | "PRODUCT_MAX_DISCOUNT";
        allowedValue: number;
        proposedValue: number;
        severity: "WARNING" | "VIOLATION" | "CRITICAL";
        ruleId?: string | undefined;
    }, {
        message: string;
        ruleName: string;
        violatedField: "MAX_DISCOUNT" | "MIN_MARGIN" | "PRODUCT_MAX_DISCOUNT";
        allowedValue: number;
        proposedValue: number;
        severity: "WARNING" | "VIOLATION" | "CRITICAL";
        ruleId?: string | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    category: string;
    productId: string;
    quantity: number;
    proposedDiscountPercent: number;
    sku: string;
    productName: string;
    effectiveUnitPrice: number;
    lineSubtotal: number;
    discountAmount: number;
    netUnitPrice: number;
    netLineTotal: number;
    unitCost: number;
    totalCost: number;
    marginAmount: number;
    marginPercentage: number;
    violations: {
        message: string;
        ruleName: string;
        violatedField: "MAX_DISCOUNT" | "MIN_MARGIN" | "PRODUCT_MAX_DISCOUNT";
        allowedValue: number;
        proposedValue: number;
        severity: "WARNING" | "VIOLATION" | "CRITICAL";
        ruleId?: string | undefined;
    }[];
}, {
    category: string;
    productId: string;
    quantity: number;
    proposedDiscountPercent: number;
    sku: string;
    productName: string;
    effectiveUnitPrice: number;
    lineSubtotal: number;
    discountAmount: number;
    netUnitPrice: number;
    netLineTotal: number;
    unitCost: number;
    totalCost: number;
    marginAmount: number;
    marginPercentage: number;
    violations: {
        message: string;
        ruleName: string;
        violatedField: "MAX_DISCOUNT" | "MIN_MARGIN" | "PRODUCT_MAX_DISCOUNT";
        allowedValue: number;
        proposedValue: number;
        severity: "WARNING" | "VIOLATION" | "CRITICAL";
        ruleId?: string | undefined;
    }[];
}>;
export type LineEvaluationDetail = z.infer<typeof LineEvaluationDetailSchema>;
export declare const CommercialEvaluationSchema: z.ZodObject<{
    quoteId: z.ZodOptional<z.ZodString>;
    netTotal: z.ZodNumber;
    marginAmount: z.ZodNumber;
    marginPercentage: z.ZodNumber;
    riskScore: z.ZodNumber;
    riskLevel: z.ZodEnum<["LOW", "MEDIUM", "HIGH", "CRITICAL"]>;
    violations: z.ZodArray<z.ZodObject<{
        ruleId: z.ZodOptional<z.ZodString>;
        ruleName: z.ZodString;
        violatedField: z.ZodEnum<["MAX_DISCOUNT", "MIN_MARGIN", "PRODUCT_MAX_DISCOUNT"]>;
        allowedValue: z.ZodNumber;
        proposedValue: z.ZodNumber;
        severity: z.ZodEnum<["WARNING", "VIOLATION", "CRITICAL"]>;
        message: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        message: string;
        ruleName: string;
        violatedField: "MAX_DISCOUNT" | "MIN_MARGIN" | "PRODUCT_MAX_DISCOUNT";
        allowedValue: number;
        proposedValue: number;
        severity: "WARNING" | "VIOLATION" | "CRITICAL";
        ruleId?: string | undefined;
    }, {
        message: string;
        ruleName: string;
        violatedField: "MAX_DISCOUNT" | "MIN_MARGIN" | "PRODUCT_MAX_DISCOUNT";
        allowedValue: number;
        proposedValue: number;
        severity: "WARNING" | "VIOLATION" | "CRITICAL";
        ruleId?: string | undefined;
    }>, "many">;
    requiredApprovalRoles: z.ZodArray<z.ZodEnum<["ADMIN", "SALES_MANAGER", "SALES_REP", "FINANCE_OPERATIONS", "CUSTOMER"]>, "many">;
    requiresApproval: z.ZodBoolean;
    evaluatedAt: z.ZodString;
    lineEvaluations: z.ZodOptional<z.ZodArray<z.ZodObject<{
        productId: z.ZodString;
        sku: z.ZodString;
        productName: z.ZodString;
        category: z.ZodString;
        quantity: z.ZodNumber;
        effectiveUnitPrice: z.ZodNumber;
        lineSubtotal: z.ZodNumber;
        proposedDiscountPercent: z.ZodNumber;
        discountAmount: z.ZodNumber;
        netUnitPrice: z.ZodNumber;
        netLineTotal: z.ZodNumber;
        unitCost: z.ZodNumber;
        totalCost: z.ZodNumber;
        marginAmount: z.ZodNumber;
        marginPercentage: z.ZodNumber;
        violations: z.ZodArray<z.ZodObject<{
            ruleId: z.ZodOptional<z.ZodString>;
            ruleName: z.ZodString;
            violatedField: z.ZodEnum<["MAX_DISCOUNT", "MIN_MARGIN", "PRODUCT_MAX_DISCOUNT"]>;
            allowedValue: z.ZodNumber;
            proposedValue: z.ZodNumber;
            severity: z.ZodEnum<["WARNING", "VIOLATION", "CRITICAL"]>;
            message: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            message: string;
            ruleName: string;
            violatedField: "MAX_DISCOUNT" | "MIN_MARGIN" | "PRODUCT_MAX_DISCOUNT";
            allowedValue: number;
            proposedValue: number;
            severity: "WARNING" | "VIOLATION" | "CRITICAL";
            ruleId?: string | undefined;
        }, {
            message: string;
            ruleName: string;
            violatedField: "MAX_DISCOUNT" | "MIN_MARGIN" | "PRODUCT_MAX_DISCOUNT";
            allowedValue: number;
            proposedValue: number;
            severity: "WARNING" | "VIOLATION" | "CRITICAL";
            ruleId?: string | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        category: string;
        productId: string;
        quantity: number;
        proposedDiscountPercent: number;
        sku: string;
        productName: string;
        effectiveUnitPrice: number;
        lineSubtotal: number;
        discountAmount: number;
        netUnitPrice: number;
        netLineTotal: number;
        unitCost: number;
        totalCost: number;
        marginAmount: number;
        marginPercentage: number;
        violations: {
            message: string;
            ruleName: string;
            violatedField: "MAX_DISCOUNT" | "MIN_MARGIN" | "PRODUCT_MAX_DISCOUNT";
            allowedValue: number;
            proposedValue: number;
            severity: "WARNING" | "VIOLATION" | "CRITICAL";
            ruleId?: string | undefined;
        }[];
    }, {
        category: string;
        productId: string;
        quantity: number;
        proposedDiscountPercent: number;
        sku: string;
        productName: string;
        effectiveUnitPrice: number;
        lineSubtotal: number;
        discountAmount: number;
        netUnitPrice: number;
        netLineTotal: number;
        unitCost: number;
        totalCost: number;
        marginAmount: number;
        marginPercentage: number;
        violations: {
            message: string;
            ruleName: string;
            violatedField: "MAX_DISCOUNT" | "MIN_MARGIN" | "PRODUCT_MAX_DISCOUNT";
            allowedValue: number;
            proposedValue: number;
            severity: "WARNING" | "VIOLATION" | "CRITICAL";
            ruleId?: string | undefined;
        }[];
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    marginAmount: number;
    marginPercentage: number;
    violations: {
        message: string;
        ruleName: string;
        violatedField: "MAX_DISCOUNT" | "MIN_MARGIN" | "PRODUCT_MAX_DISCOUNT";
        allowedValue: number;
        proposedValue: number;
        severity: "WARNING" | "VIOLATION" | "CRITICAL";
        ruleId?: string | undefined;
    }[];
    netTotal: number;
    riskScore: number;
    riskLevel: "CRITICAL" | "LOW" | "MEDIUM" | "HIGH";
    requiredApprovalRoles: ("ADMIN" | "SALES_MANAGER" | "SALES_REP" | "FINANCE_OPERATIONS" | "CUSTOMER")[];
    requiresApproval: boolean;
    evaluatedAt: string;
    quoteId?: string | undefined;
    lineEvaluations?: {
        category: string;
        productId: string;
        quantity: number;
        proposedDiscountPercent: number;
        sku: string;
        productName: string;
        effectiveUnitPrice: number;
        lineSubtotal: number;
        discountAmount: number;
        netUnitPrice: number;
        netLineTotal: number;
        unitCost: number;
        totalCost: number;
        marginAmount: number;
        marginPercentage: number;
        violations: {
            message: string;
            ruleName: string;
            violatedField: "MAX_DISCOUNT" | "MIN_MARGIN" | "PRODUCT_MAX_DISCOUNT";
            allowedValue: number;
            proposedValue: number;
            severity: "WARNING" | "VIOLATION" | "CRITICAL";
            ruleId?: string | undefined;
        }[];
    }[] | undefined;
}, {
    marginAmount: number;
    marginPercentage: number;
    violations: {
        message: string;
        ruleName: string;
        violatedField: "MAX_DISCOUNT" | "MIN_MARGIN" | "PRODUCT_MAX_DISCOUNT";
        allowedValue: number;
        proposedValue: number;
        severity: "WARNING" | "VIOLATION" | "CRITICAL";
        ruleId?: string | undefined;
    }[];
    netTotal: number;
    riskScore: number;
    riskLevel: "CRITICAL" | "LOW" | "MEDIUM" | "HIGH";
    requiredApprovalRoles: ("ADMIN" | "SALES_MANAGER" | "SALES_REP" | "FINANCE_OPERATIONS" | "CUSTOMER")[];
    requiresApproval: boolean;
    evaluatedAt: string;
    quoteId?: string | undefined;
    lineEvaluations?: {
        category: string;
        productId: string;
        quantity: number;
        proposedDiscountPercent: number;
        sku: string;
        productName: string;
        effectiveUnitPrice: number;
        lineSubtotal: number;
        discountAmount: number;
        netUnitPrice: number;
        netLineTotal: number;
        unitCost: number;
        totalCost: number;
        marginAmount: number;
        marginPercentage: number;
        violations: {
            message: string;
            ruleName: string;
            violatedField: "MAX_DISCOUNT" | "MIN_MARGIN" | "PRODUCT_MAX_DISCOUNT";
            allowedValue: number;
            proposedValue: number;
            severity: "WARNING" | "VIOLATION" | "CRITICAL";
            ruleId?: string | undefined;
        }[];
    }[] | undefined;
}>;
export type CommercialEvaluationDto = z.infer<typeof CommercialEvaluationSchema>;
//# sourceMappingURL=index.d.ts.map