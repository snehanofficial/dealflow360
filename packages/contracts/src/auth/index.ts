import { z } from 'zod';

export const RoleEnum = z.enum([
  'ADMIN',
  'SALES_MANAGER',
  'SALES_REP',
  'FINANCE_OPERATIONS',
  'CUSTOMER',
]);

export type Role = z.infer<typeof RoleEnum>;

export const Permissions = {
  DASHBOARD_VIEW: 'dashboard.view',
  PROFILE_VIEW: 'profile.view',
  PROFILE_UPDATE: 'profile.update',
  CUSTOMER_VIEW: 'customer.view',
  CUSTOMER_CREATE: 'customer.create',
  PRODUCT_VIEW: 'product.view',
  PRODUCT_CREATE: 'product.create',
  QUOTATION_VIEW: 'quotation.view',
  QUOTATION_CREATE: 'quotation.create',
  QUOTATION_UPDATE: 'quotation.update',
  QUOTATION_SUBMIT: 'quotation.submit',
  APPROVAL_VIEW: 'approval.view',
  APPROVAL_ACTION: 'approval.action',
  FULFILLMENT_VIEW: 'fulfillment.view',
  FULFILLMENT_MANAGE: 'fulfillment.manage',
  BILLING_VIEW: 'billing.view',
  BILLING_MANAGE: 'billing.manage',
  PORTAL_NEGOTIATE: 'portal.negotiate',
  PORTAL_CONFIRM: 'portal.confirm',
  AUDIT_VIEW: 'audit.view',
  DISCOUNT_VIEW: 'discount.view',
  DISCOUNT_EVALUATE: 'discount.evaluate',
  DISCOUNT_CONFIGURE: 'discount.configure',
} as const;

export type Permission = (typeof Permissions)[keyof typeof Permissions];

export const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  ADMIN: Object.values(Permissions),
  SALES_MANAGER: [
    Permissions.DASHBOARD_VIEW,
    Permissions.PROFILE_VIEW,
    Permissions.PROFILE_UPDATE,
    Permissions.CUSTOMER_VIEW,
    Permissions.PRODUCT_VIEW,
    Permissions.QUOTATION_VIEW,
    Permissions.QUOTATION_CREATE,
    Permissions.QUOTATION_UPDATE,
    Permissions.QUOTATION_SUBMIT,
    Permissions.APPROVAL_VIEW,
    Permissions.APPROVAL_ACTION,
    Permissions.FULFILLMENT_VIEW,
    Permissions.BILLING_VIEW,
    Permissions.AUDIT_VIEW,
    Permissions.DISCOUNT_VIEW,
    Permissions.DISCOUNT_EVALUATE,
    Permissions.DISCOUNT_CONFIGURE,
  ],
  SALES_REP: [
    Permissions.DASHBOARD_VIEW,
    Permissions.PROFILE_VIEW,
    Permissions.PROFILE_UPDATE,
    Permissions.CUSTOMER_VIEW,
    Permissions.PRODUCT_VIEW,
    Permissions.QUOTATION_VIEW,
    Permissions.QUOTATION_CREATE,
    Permissions.QUOTATION_UPDATE,
    Permissions.QUOTATION_SUBMIT,
    Permissions.APPROVAL_VIEW,
    Permissions.FULFILLMENT_VIEW,
    Permissions.BILLING_VIEW,
    Permissions.DISCOUNT_VIEW,
    Permissions.DISCOUNT_EVALUATE,
  ],
  FINANCE_OPERATIONS: [
    Permissions.DASHBOARD_VIEW,
    Permissions.PROFILE_VIEW,
    Permissions.PROFILE_UPDATE,
    Permissions.QUOTATION_VIEW,
    Permissions.APPROVAL_VIEW,
    Permissions.APPROVAL_ACTION,
    Permissions.BILLING_VIEW,
    Permissions.BILLING_MANAGE,
    Permissions.AUDIT_VIEW,
    Permissions.DISCOUNT_VIEW,
    Permissions.DISCOUNT_EVALUATE,
    Permissions.DISCOUNT_CONFIGURE,
  ],
  CUSTOMER: [
    Permissions.PROFILE_VIEW,
    Permissions.PORTAL_NEGOTIATE,
    Permissions.PORTAL_CONFIRM,
  ],
};

export const SignupRequestSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Password confirmation is required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type SignupRequest = z.infer<typeof SignupRequestSchema>;

export const LoginRequestSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  role: RoleEnum,
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type UserDto = z.infer<typeof UserSchema>;

export const AuthResponseDataSchema = z.object({
  user: UserSchema,
  accessToken: z.string(),
});

export type AuthResponseData = z.infer<typeof AuthResponseDataSchema>;

export const UserMeResponseDataSchema = z.object({
  user: UserSchema,
  role: RoleEnum,
  permissions: z.array(z.string()),
});

export type UserMeResponseData = z.infer<typeof UserMeResponseDataSchema>;
