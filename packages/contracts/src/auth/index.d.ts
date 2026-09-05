import { z } from 'zod';
export declare const RoleEnum: z.ZodEnum<["ADMIN", "SALES_MANAGER", "SALES_REP", "FINANCE_OPERATIONS", "CUSTOMER"]>;
export type Role = z.infer<typeof RoleEnum>;
export declare const Permissions: {
    readonly DASHBOARD_VIEW: "dashboard.view";
    readonly PROFILE_VIEW: "profile.view";
    readonly PROFILE_UPDATE: "profile.update";
    readonly CUSTOMER_VIEW: "customer.view";
    readonly CUSTOMER_CREATE: "customer.create";
    readonly PRODUCT_VIEW: "product.view";
    readonly PRODUCT_CREATE: "product.create";
    readonly QUOTATION_VIEW: "quotation.view";
    readonly QUOTATION_CREATE: "quotation.create";
    readonly QUOTATION_UPDATE: "quotation.update";
    readonly QUOTATION_SUBMIT: "quotation.submit";
    readonly APPROVAL_VIEW: "approval.view";
    readonly APPROVAL_ACTION: "approval.action";
    readonly FULFILLMENT_VIEW: "fulfillment.view";
    readonly FULFILLMENT_MANAGE: "fulfillment.manage";
    readonly BILLING_VIEW: "billing.view";
    readonly BILLING_MANAGE: "billing.manage";
    readonly PORTAL_NEGOTIATE: "portal.negotiate";
    readonly PORTAL_CONFIRM: "portal.confirm";
    readonly AUDIT_VIEW: "audit.view";
    readonly DISCOUNT_VIEW: "discount.view";
    readonly DISCOUNT_EVALUATE: "discount.evaluate";
    readonly DISCOUNT_CONFIGURE: "discount.configure";
};
export type Permission = (typeof Permissions)[keyof typeof Permissions];
export declare const ROLE_PERMISSIONS: Record<Role, readonly Permission[]>;
export declare const SignupRequestSchema: z.ZodEffects<z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    confirmPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
}, {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
}>, {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
}, {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
}>;
export type SignupRequest = z.infer<typeof SignupRequestSchema>;
export declare const LoginRequestSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export declare const UserSchema: z.ZodObject<{
    id: z.ZodString;
    email: z.ZodString;
    name: z.ZodString;
    role: z.ZodEnum<["ADMIN", "SALES_MANAGER", "SALES_REP", "FINANCE_OPERATIONS", "CUSTOMER"]>;
    isActive: z.ZodBoolean;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    email: string;
    role: "ADMIN" | "SALES_MANAGER" | "SALES_REP" | "FINANCE_OPERATIONS" | "CUSTOMER";
}, {
    id: string;
    name: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    email: string;
    role: "ADMIN" | "SALES_MANAGER" | "SALES_REP" | "FINANCE_OPERATIONS" | "CUSTOMER";
}>;
export type UserDto = z.infer<typeof UserSchema>;
export declare const AuthResponseDataSchema: z.ZodObject<{
    user: z.ZodObject<{
        id: z.ZodString;
        email: z.ZodString;
        name: z.ZodString;
        role: z.ZodEnum<["ADMIN", "SALES_MANAGER", "SALES_REP", "FINANCE_OPERATIONS", "CUSTOMER"]>;
        isActive: z.ZodBoolean;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        isActive: boolean;
        createdAt: string;
        updatedAt: string;
        email: string;
        role: "ADMIN" | "SALES_MANAGER" | "SALES_REP" | "FINANCE_OPERATIONS" | "CUSTOMER";
    }, {
        id: string;
        name: string;
        isActive: boolean;
        createdAt: string;
        updatedAt: string;
        email: string;
        role: "ADMIN" | "SALES_MANAGER" | "SALES_REP" | "FINANCE_OPERATIONS" | "CUSTOMER";
    }>;
    accessToken: z.ZodString;
}, "strip", z.ZodTypeAny, {
    user: {
        id: string;
        name: string;
        isActive: boolean;
        createdAt: string;
        updatedAt: string;
        email: string;
        role: "ADMIN" | "SALES_MANAGER" | "SALES_REP" | "FINANCE_OPERATIONS" | "CUSTOMER";
    };
    accessToken: string;
}, {
    user: {
        id: string;
        name: string;
        isActive: boolean;
        createdAt: string;
        updatedAt: string;
        email: string;
        role: "ADMIN" | "SALES_MANAGER" | "SALES_REP" | "FINANCE_OPERATIONS" | "CUSTOMER";
    };
    accessToken: string;
}>;
export type AuthResponseData = z.infer<typeof AuthResponseDataSchema>;
export declare const UserMeResponseDataSchema: z.ZodObject<{
    user: z.ZodObject<{
        id: z.ZodString;
        email: z.ZodString;
        name: z.ZodString;
        role: z.ZodEnum<["ADMIN", "SALES_MANAGER", "SALES_REP", "FINANCE_OPERATIONS", "CUSTOMER"]>;
        isActive: z.ZodBoolean;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        isActive: boolean;
        createdAt: string;
        updatedAt: string;
        email: string;
        role: "ADMIN" | "SALES_MANAGER" | "SALES_REP" | "FINANCE_OPERATIONS" | "CUSTOMER";
    }, {
        id: string;
        name: string;
        isActive: boolean;
        createdAt: string;
        updatedAt: string;
        email: string;
        role: "ADMIN" | "SALES_MANAGER" | "SALES_REP" | "FINANCE_OPERATIONS" | "CUSTOMER";
    }>;
    role: z.ZodEnum<["ADMIN", "SALES_MANAGER", "SALES_REP", "FINANCE_OPERATIONS", "CUSTOMER"]>;
    permissions: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    role: "ADMIN" | "SALES_MANAGER" | "SALES_REP" | "FINANCE_OPERATIONS" | "CUSTOMER";
    user: {
        id: string;
        name: string;
        isActive: boolean;
        createdAt: string;
        updatedAt: string;
        email: string;
        role: "ADMIN" | "SALES_MANAGER" | "SALES_REP" | "FINANCE_OPERATIONS" | "CUSTOMER";
    };
    permissions: string[];
}, {
    role: "ADMIN" | "SALES_MANAGER" | "SALES_REP" | "FINANCE_OPERATIONS" | "CUSTOMER";
    user: {
        id: string;
        name: string;
        isActive: boolean;
        createdAt: string;
        updatedAt: string;
        email: string;
        role: "ADMIN" | "SALES_MANAGER" | "SALES_REP" | "FINANCE_OPERATIONS" | "CUSTOMER";
    };
    permissions: string[];
}>;
export type UserMeResponseData = z.infer<typeof UserMeResponseDataSchema>;
//# sourceMappingURL=index.d.ts.map