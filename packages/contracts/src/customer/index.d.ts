import { z } from 'zod';
export declare const CustomerTierEnum: z.ZodEnum<["ENTERPRISE", "TIER_1", "TIER_2", "TIER_3"]>;
export type CustomerTier = z.infer<typeof CustomerTierEnum>;
export declare const CustomerStatusEnum: z.ZodEnum<["ACTIVE", "INACTIVE", "SUSPENDED"]>;
export type CustomerStatus = z.infer<typeof CustomerStatusEnum>;
export declare const CustomerSchema: z.ZodObject<{
    id: z.ZodString;
    code: z.ZodString;
    name: z.ZodString;
    email: z.ZodString;
    phone: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    tier: z.ZodEnum<["ENTERPRISE", "TIER_1", "TIER_2", "TIER_3"]>;
    status: z.ZodEnum<["ACTIVE", "INACTIVE", "SUSPENDED"]>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    code: string;
    status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    tier: "ENTERPRISE" | "TIER_1" | "TIER_2" | "TIER_3";
    email: string;
    phone?: string | null | undefined;
}, {
    code: string;
    status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    tier: "ENTERPRISE" | "TIER_1" | "TIER_2" | "TIER_3";
    email: string;
    phone?: string | null | undefined;
}>;
export type CustomerDto = z.infer<typeof CustomerSchema>;
export declare const CreateCustomerSchema: z.ZodObject<{
    code: z.ZodString;
    name: z.ZodString;
    email: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
    tier: z.ZodDefault<z.ZodEnum<["ENTERPRISE", "TIER_1", "TIER_2", "TIER_3"]>>;
    status: z.ZodDefault<z.ZodEnum<["ACTIVE", "INACTIVE", "SUSPENDED"]>>;
}, "strip", z.ZodTypeAny, {
    code: string;
    status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
    name: string;
    tier: "ENTERPRISE" | "TIER_1" | "TIER_2" | "TIER_3";
    email: string;
    phone?: string | undefined;
}, {
    code: string;
    name: string;
    email: string;
    status?: "ACTIVE" | "INACTIVE" | "SUSPENDED" | undefined;
    tier?: "ENTERPRISE" | "TIER_1" | "TIER_2" | "TIER_3" | undefined;
    phone?: string | undefined;
}>;
export type CreateCustomerRequest = z.infer<typeof CreateCustomerSchema>;
export declare const UpdateCustomerSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    tier: z.ZodOptional<z.ZodEnum<["ENTERPRISE", "TIER_1", "TIER_2", "TIER_3"]>>;
    status: z.ZodOptional<z.ZodEnum<["ACTIVE", "INACTIVE", "SUSPENDED"]>>;
}, "strip", z.ZodTypeAny, {
    status?: "ACTIVE" | "INACTIVE" | "SUSPENDED" | undefined;
    name?: string | undefined;
    tier?: "ENTERPRISE" | "TIER_1" | "TIER_2" | "TIER_3" | undefined;
    email?: string | undefined;
    phone?: string | null | undefined;
}, {
    status?: "ACTIVE" | "INACTIVE" | "SUSPENDED" | undefined;
    name?: string | undefined;
    tier?: "ENTERPRISE" | "TIER_1" | "TIER_2" | "TIER_3" | undefined;
    email?: string | undefined;
    phone?: string | null | undefined;
}>;
export type UpdateCustomerRequest = z.infer<typeof UpdateCustomerSchema>;
export declare const CustomerFilterQuerySchema: z.ZodObject<{
    search: z.ZodOptional<z.ZodString>;
    tier: z.ZodOptional<z.ZodEnum<["ENTERPRISE", "TIER_1", "TIER_2", "TIER_3"]>>;
    status: z.ZodOptional<z.ZodEnum<["ACTIVE", "INACTIVE", "SUSPENDED"]>>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    status?: "ACTIVE" | "INACTIVE" | "SUSPENDED" | undefined;
    search?: string | undefined;
    tier?: "ENTERPRISE" | "TIER_1" | "TIER_2" | "TIER_3" | undefined;
}, {
    status?: "ACTIVE" | "INACTIVE" | "SUSPENDED" | undefined;
    search?: string | undefined;
    tier?: "ENTERPRISE" | "TIER_1" | "TIER_2" | "TIER_3" | undefined;
    page?: number | undefined;
    limit?: number | undefined;
}>;
export type CustomerFilterQuery = z.infer<typeof CustomerFilterQuerySchema>;
export declare const CustomerListResponseSchema: z.ZodObject<{
    items: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        code: z.ZodString;
        name: z.ZodString;
        email: z.ZodString;
        phone: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        tier: z.ZodEnum<["ENTERPRISE", "TIER_1", "TIER_2", "TIER_3"]>;
        status: z.ZodEnum<["ACTIVE", "INACTIVE", "SUSPENDED"]>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        code: string;
        status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
        id: string;
        name: string;
        createdAt: string;
        updatedAt: string;
        tier: "ENTERPRISE" | "TIER_1" | "TIER_2" | "TIER_3";
        email: string;
        phone?: string | null | undefined;
    }, {
        code: string;
        status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
        id: string;
        name: string;
        createdAt: string;
        updatedAt: string;
        tier: "ENTERPRISE" | "TIER_1" | "TIER_2" | "TIER_3";
        email: string;
        phone?: string | null | undefined;
    }>, "many">;
    total: z.ZodNumber;
    page: z.ZodNumber;
    limit: z.ZodNumber;
    totalPages: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    items: {
        code: string;
        status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
        id: string;
        name: string;
        createdAt: string;
        updatedAt: string;
        tier: "ENTERPRISE" | "TIER_1" | "TIER_2" | "TIER_3";
        email: string;
        phone?: string | null | undefined;
    }[];
    total: number;
    totalPages: number;
}, {
    page: number;
    limit: number;
    items: {
        code: string;
        status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
        id: string;
        name: string;
        createdAt: string;
        updatedAt: string;
        tier: "ENTERPRISE" | "TIER_1" | "TIER_2" | "TIER_3";
        email: string;
        phone?: string | null | undefined;
    }[];
    total: number;
    totalPages: number;
}>;
export type CustomerListResponse = z.infer<typeof CustomerListResponseSchema>;
export declare const CustomerReferenceSchema: z.ZodObject<{
    id: z.ZodString;
    code: z.ZodString;
    name: z.ZodString;
    tier: z.ZodEnum<["ENTERPRISE", "TIER_1", "TIER_2", "TIER_3"]>;
}, "strip", z.ZodTypeAny, {
    code: string;
    id: string;
    name: string;
    tier: "ENTERPRISE" | "TIER_1" | "TIER_2" | "TIER_3";
}, {
    code: string;
    id: string;
    name: string;
    tier: "ENTERPRISE" | "TIER_1" | "TIER_2" | "TIER_3";
}>;
export type CustomerReferenceDto = z.infer<typeof CustomerReferenceSchema>;
//# sourceMappingURL=index.d.ts.map