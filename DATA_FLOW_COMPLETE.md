# DealFlow360 - Complete Top-to-Bottom Data Flow Guide

## Overview
This document traces how data flows through the entire system from user interaction to database storage and back.

---

## 1. REQUEST FLOW: Frontend → Backend

### Layer 1: Frontend Entry Point
**Key Files:**
- `apps/web/src/main.tsx` - React app initialization & root DOM render
- `apps/web/src/app/App.tsx` - Root component with providers
- `apps/web/src/routes/AppRoutes.tsx` - All route definitions and protected routes

**Flow:**
```
User opens app
    ↓
main.tsx renders React into <div id="root">
    ↓
App.tsx initializes:
  • QueryClientProvider (tanstack/react-query for API calls)
  • AuthProvider (manages JWT token & user context)
  • BrowserRouter (React Router)
    ↓
AppRoutes.tsx matches URL → renders appropriate page component
```

**Example: User logs in**
1. URL: `/login` → renders `LoginForm` component
2. User fills email & password → submits form
3. Component calls API

---

### Layer 2: Frontend API Client
**Key Files:**
- `apps/web/src/features/auth/LoginForm.tsx` - Form component
- `apps/web/src/lib/api.ts` (if exists) or direct fetch calls
- `apps/web/src/features/auth/AuthContext.tsx` - Global auth state

**Example Login Flow:**
```typescript
// LoginForm.tsx
const LoginForm = () => {
  const mutation = useMutation({
    mutationFn: async (credentials) => {
      // POST /api/v1/auth/login
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
        credentials: 'include', // Send cookies
      });
      return response.json();
    },
    onSuccess: (data) => {
      // Store token in AuthContext
      // Token is in response: data.data.accessToken
    },
  });
  
  return <form onSubmit={(e) => mutation.mutate(...)}>...</form>;
};
```

**Key Headers Sent:**
- `Authorization: Bearer <accessToken>` (in Authorization header for protected routes)
- `Content-Type: application/json`
- Cookies (HttpOnly refresh token automatically sent)

---

## 2. REQUEST HANDLING: Backend Entry Point

### Layer 3: Express Server Initialization
**Key Files:**
- `apps/api/src/app.ts` - Express app configuration
- `apps/api/src/config/env.ts` - Environment variables
- `apps/api/src/server.ts` or entry point - Listen & start server

**Request Reception:**
```typescript
// apps/api/src/app.ts
import express from 'express';
import helmet from 'helmet';           // Security headers
import cors from 'cors';               // Cross-origin handling
import rateLimit from 'express-rate-limit'; // Throttling
import cookieParser from 'cookie-parser';   // Parse cookies

const app = express();

app.use(helmet());                     // Add security headers
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json());               // Parse JSON body
app.use(cookieParser());               // Parse cookies
app.use(rateLimit({...}));             // 200 requests per 15min

// Route registration
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/customers', customerRoutes);
app.use('/api/v1/quotes', quoteRoutes);
// ... other routes

app.use(errorHandler); // Global error handler (last middleware)
```

---

### Layer 4: Route Matching & Middleware Chain

**Key Files:**
- `apps/api/src/routes/authRoutes.ts` - Auth endpoint definitions
- `apps/api/src/routes/customerRoutes.ts` - Customer endpoints
- `apps/api/src/routes/quoteRoutes.ts` - Quote endpoints
- `apps/api/src/middleware/auth.ts` - JWT verification & RBAC

**Auth Routes Example:**
```typescript
// apps/api/src/routes/authRoutes.ts
import { Router } from 'express';
import { signup, login, refresh, logout, me } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

export const authRoutes: Router = Router();

authRoutes.post('/signup', signup);           // Public
authRoutes.post('/login', login);             // Public
authRoutes.post('/refresh', refresh);         // Public (but uses cookie)
authRoutes.post('/logout', logout);           // Public
authRoutes.get('/me', authenticate, me);      // Protected ✓
```

**Request to `/api/v1/auth/login` flows:**
```
POST /api/v1/auth/login with { email, password }
    ↓
app.js receives request
    ↓
Helmet middleware (adds security headers)
    ↓
CORS middleware (checks origin)
    ↓
Rate limiter middleware (checks rate limit)
    ↓
JSON parser middleware (parses body)
    ↓
Cookie parser middleware (parses cookies)
    ↓
Route matcher finds authRoutes
    ↓
No authentication middleware needed (public endpoint)
    ↓
Calls loginController function
```

**Request to `/api/v1/quotes` (protected) flows:**
```
GET /api/v1/quotes with Authorization: Bearer <token>
    ↓
[All middleware same as above]
    ↓
Route matcher finds quoteRoutes
    ↓
authenticate middleware (JWT verification required!) ✓
    ↓
JWT token extracted from header: "Bearer <token>"
    ↓
verifyAccessToken(token) validates signature & expiration
    ↓
If valid: req.user = { userId, email, role, permissions }
    ↓
If invalid: next(AppError with 401)
    ↓
Next middleware/controller executes with user context
```

---

## 3. AUTHENTICATION & AUTHORIZATION SYSTEM

### Layer 5: Authentication Middleware
**Key Files:**
- `apps/api/src/middleware/auth.ts` - authenticate() & requirePermission()
- `apps/api/src/auth/token.ts` - JWT generation & verification
- `apps/api/src/auth/password.ts` - Argon2id hashing

**JWT Flow:**
```
User submits credentials
    ↓
authService.login() validated email/password
    ↓
passwordHash compared with Argon2id.verify()
    ↓
If valid, generateAccessToken() creates JWT:
{
  sub: userId,           // Subject (user ID)
  email: email,
  role: 'SALES_MANAGER',
  iat: 1234567890,       // Issued at
  exp: 1234571490        // Expires in 1 hour
}
    ↓
JWT signed with secret (HS256)
    ↓
Sent to frontend in response.data.accessToken
    ↓
Frontend stores in memory (not localStorage for security)
    ↓
Frontend sends with every request: Authorization: Bearer <jwt>
```

**Role-Based Access Control (RBAC):**
```typescript
// apps/api/src/middleware/auth.ts

export function authenticate(req, res, next) {
  const token = extractFromHeader(req); // "Bearer <token>"
  
  const payload = verifyAccessToken(token); // Verify signature
  
  const role = payload.role; // 'SALES_MANAGER' | 'SALES_REP' | etc
  
  // Load permissions from role mapping
  const permissions = ROLE_PERMISSIONS[role];
  // Example: SALES_MANAGER has:
  // ['quotation.view', 'quotation.create', 'approval.view', ...]
  
  req.user = {
    userId: payload.sub,
    email: payload.email,
    role,
    permissions, // Array of permission strings
  };
  
  next();
}

export function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.user?.permissions.includes(permission)) {
      next(AppError('FORBIDDEN', 'Permission denied', 403));
    }
    next();
  };
}
```

**Permissions Map:**
```typescript
// apps/api/src/contracts/auth/index.ts
export const Permissions = {
  DASHBOARD_VIEW: 'dashboard.view',
  CUSTOMER_CREATE: 'customer.create',
  QUOTATION_CREATE: 'quotation.create',
  APPROVAL_ACTION: 'approval.action',
  FULFILLMENT_MANAGE: 'fulfillment.manage',
  BILLING_MANAGE: 'billing.manage',
  // ... 20+ more permissions
};

export const ROLE_PERMISSIONS = {
  ADMIN: Object.values(Permissions), // All permissions
  SALES_MANAGER: [
    Permissions.CUSTOMER_VIEW,
    Permissions.QUOTATION_CREATE,
    Permissions.APPROVAL_ACTION,
    // ... subset of permissions
  ],
  SALES_REP: [
    Permissions.CUSTOMER_VIEW,
    Permissions.QUOTATION_CREATE,
    // ... more limited permissions
  ],
  FINANCE_OPERATIONS: [
    Permissions.APPROVAL_ACTION,
    Permissions.BILLING_MANAGE,
    // ... finance-specific permissions
  ],
  CUSTOMER: [
    Permissions.PORTAL_NEGOTIATE,
    Permissions.PORTAL_CONFIRM,
    // ... customer portal only
  ],
};
```

---

## 4. REQUEST HANDLING: Controllers

### Layer 6: Controller Functions
**Key Files:**
- `apps/api/src/controllers/authController.ts` - Auth operations
- `apps/api/src/controllers/customerController.ts` - Customer CRUD
- More controllers in `apps/api/src/controllers/`

**Example: Login Controller**
```typescript
// apps/api/src/controllers/authController.ts

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    // Step 1: Validate input against Zod schema
    const validated = LoginRequestSchema.parse(req.body);
    // LoginRequestSchema comes from packages/contracts
    // Ensures: email is valid, password exists, etc.
    
    // Step 2: Extract metadata
    const meta = {
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    };
    
    // Step 3: Call service layer
    const { authData, rawRefreshToken } = await authService.login(validated, meta);
    
    // Step 4: Set secure cookie (HttpOnly, Secure, SameSite)
    res.cookie(REFRESH_COOKIE_NAME, rawRefreshToken, getRefreshCookieOptions());
    
    // Step 5: Return standardized response
    res.json({
      success: true,
      data: authData,           // { user, accessToken }
      message: 'Login successful.',
      meta: null,
    });
  } catch (error) {
    // Pass to error handler
    next(error);
  }
}
```

**Controller Pattern:**
```
1. Validate input (Zod schemas)
2. Extract auth context (req.user from middleware)
3. Call service layer (business logic)
4. Format response (standardized JSON)
5. Error handling (caught by global error handler)
```

---

## 5. BUSINESS LOGIC: Service Layer

### Layer 7: Application Services
**Key Files:**
- `apps/api/src/services/authService.ts` - Auth operations
- `apps/api/src/services/quoteService.ts` - Quote operations (if exists)
- More services in `apps/api/src/services/`

**Example: Auth Service**
```typescript
// apps/api/src/services/authService.ts

export class AuthService {
  async login(input: LoginRequest, meta?: { ipAddress; userAgent }) {
    // Step 1: Find user in database
    const user = await this.userRepo.findByEmail(input.email);
    if (!user) {
      throw new AppError('INVALID_CREDENTIALS', 'Invalid email or password.', 401);
    }
    
    // Step 2: Verify password (Argon2id)
    const isValid = await verifyPassword(user.passwordHash, input.password);
    if (!isValid) {
      throw new AppError('INVALID_CREDENTIALS', 'Invalid email or password.', 401);
    }
    
    // Step 3: Generate tokens
    const accessToken = generateAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
    const { rawToken: refreshToken, tokenHash } = generateRefreshToken();
    
    // Step 4: Persist refresh session (for rotation)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days
    
    await this.userRepo.createRefreshSession({
      userId: user.id,
      tokenHash,      // Never store raw token
      expiresAt,
      ipAddress: meta?.ipAddress,
      userAgent: meta?.userAgent,
    });
    
    // Step 5: Return tokens & user data
    return {
      authData: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        accessToken,
      },
      rawRefreshToken, // Returns raw token (for cookie)
    };
  }
}
```

**Service Responsibilities:**
- Orchestrate multiple business operations
- Call domain layer for complex rules
- Call repositories for data access
- Validate business constraints
- Prepare response data

---

## 6. DOMAIN BUSINESS LOGIC

### Layer 8: Pure Business Engine
**Key Files:**
- `packages/domain/src/pricing/` - Price calculations
- `packages/domain/src/margin/` - Margin calculations
- `packages/domain/src/policy/` - Policy rule validation
- `packages/domain/src/approval/` - Approval routing logic
- `packages/domain/src/risk/` - Risk scoring engine
- `packages/domain/src/quote/` - Quotation state machine
- `packages/domain/src/fulfillment/` - Warehouse allocation
- `packages/domain/src/billing/` - Invoice scheduling

**Critical Constraint: No Framework Dependencies**
```
Domain layer MUST NOT import:
  ✗ React
  ✗ Express
  ✗ Prisma
  ✗ Axios
  ✗ Browser APIs
  
Domain layer MUST ONLY use:
  ✓ TypeScript
  ✓ Standard library
  ✓ Pure functions
  ✓ Type safety
```

**Example: Quotation Commercial Evaluation**
```typescript
// packages/domain/src/quote/evaluate-commercial.ts

export interface QuoteEvaluationRequest {
  customer: CustomerReference;
  lines: Array<{
    product: ProductReference;
    quantity: number;
    discountPercent: number;
  }>;
}

export interface QuoteEvaluationResult {
  netTotal: number;
  marginAmount: number;
  marginPercentage: number;
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  violations: PolicyViolation[];
  requiredApprovalRoles: ('SALES_MANAGER' | 'FINANCE_OPERATIONS')[];
  requiresApproval: boolean;
}

export function evaluateCommercial(
  request: QuoteEvaluationRequest,
  policyRules: PolicyRule[],
): QuoteEvaluationResult {
  // Step 1: Calculate line-level costs
  const lines = request.lines.map(line => {
    const listPrice = line.product.unitPrice;
    const discountAmount = listPrice * (line.discountPercent / 100);
    const netPrice = listPrice - discountAmount;
    const lineCost = line.product.costPrice * line.quantity;
    const lineMargin = (netPrice * line.quantity) - lineCost;
    const lineMarginPercent = ((netPrice - line.product.costPrice) / netPrice) * 100;
    
    return { ...line, listPrice, netPrice, lineMargin, lineMarginPercent };
  });
  
  // Step 2: Calculate totals
  const netTotal = lines.reduce((sum, l) => sum + (l.netPrice * l.quantity), 0);
  const totalCost = lines.reduce((sum, l) => sum + l.lineCost, 0);
  const marginAmount = netTotal - totalCost;
  const marginPercentage = (marginAmount / netTotal) * 100;
  
  // Step 3: Check policy violations
  const customerTier = request.customer.tier;
  const violations: PolicyViolation[] = [];
  
  for (const line of lines) {
    const policy = policyRules.find(p => 
      p.tier === customerTier && p.category === line.product.category
    );
    
    if (!policy) continue;
    
    if (line.discountPercent > policy.maxAllowedDiscount) {
      violations.push({
        type: 'DISCOUNT_EXCEEDED',
        message: `Discount ${line.discountPercent}% exceeds max ${policy.maxAllowedDiscount}%`,
        requiredRole: 'SALES_MANAGER',
      });
    }
    
    if (line.lineMarginPercent < policy.minRequiredMargin) {
      violations.push({
        type: 'MARGIN_BELOW_MINIMUM',
        message: `Margin ${line.lineMarginPercent}% below min ${policy.minRequiredMargin}%`,
        requiredRole: 'FINANCE_OPERATIONS',
      });
    }
  }
  
  // Step 4: Calculate risk score
  const riskScore = calculateRiskScore({
    marginPercentage,
    customerTier: request.customer.tier,
    discountPercentage: Math.max(...request.lines.map(l => l.discountPercent)),
    violationCount: violations.length,
  });
  
  // Step 5: Determine approvals needed
  const requiredApprovalRoles = Array.from(
    new Set(violations.map(v => v.requiredRole))
  );
  
  return {
    netTotal,
    marginAmount,
    marginPercentage,
    riskScore,
    riskLevel: getRiskLevel(riskScore),
    violations,
    requiredApprovalRoles,
    requiresApproval: violations.length > 0 || riskScore > 5,
  };
}
```

**Domain modules produce single source of truth for:**
- Pricing calculations
- Margin validation
- Discount governance
- Risk assessment
- Approval routing
- Fulfillment allocation
- Billing schedules

---

## 7. DATA PERSISTENCE: Repositories & Database

### Layer 9: Repository Pattern
**Key Files:**
- `apps/api/src/repositories/userRepository.ts` - User data access
- `apps/api/src/repositories/` - More repositories (one per domain entity)

**Example: User Repository**
```typescript
// apps/api/src/repositories/userRepository.ts

export class UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }
  
  async createUser(data: {
    email: string;
    name: string;
    passwordHash: string;
    role: Role;
  }): Promise<User> {
    return prisma.user.create({
      data,
    });
  }
  
  async createRefreshSession(data: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<RefreshSession> {
    return prisma.refreshSession.create({
      data,
    });
  }
}
```

**Repository Responsibilities:**
- Encapsulate database queries
- Never expose raw Prisma calls to controller/service
- Provide data access methods (create, read, update, delete)
- Handle database-specific logic

---

### Layer 10: Prisma ORM & Database Schema
**Key Files:**
- `packages/db/prisma/schema.prisma` - Database schema definition
- `packages/db/prisma/migrations/` - Migration history
- `packages/db/prisma.config.ts` - Prisma configuration

**Schema Overview:**
```prisma
// packages/db/prisma/schema.prisma

datasource db {
  provider = "postgresql"
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  ADMIN
  SALES_MANAGER
  SALES_REP
  FINANCE_OPERATIONS
  CUSTOMER
}

model User {
  id              String           @id @default(uuid())
  email           String           @unique
  passwordHash    String
  name            String
  role            Role             @default(SALES_REP)
  isActive        Boolean          @default(true)
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt
  refreshSessions RefreshSession[]  // One-to-many
  quotations      Quotation[]       // Owns quotes created by user
}

model RefreshSession {
  id        String    @id @default(uuid())
  userId    String
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  tokenHash String    @unique
  expiresAt DateTime
  isRevoked Boolean   @default(false)
  ipAddress String?
  userAgent String?
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  
  @@index([userId]) // For fast lookups
}

model Customer {
  id        String          @id @default(uuid())
  code      String          @unique
  name      String
  email     String
  tier      CustomerTier    @default(BRONZE)
  status    CustomerStatus  @default(ACTIVE)
  creditLimit Float         @default(50000)
  quotations Quotation[]     // One customer has many quotes
}

model Product {
  id              String        @id @default(uuid())
  sku             String        @unique
  name            String
  category        String
  listPrice       Float
  standardCost    Float
  billingType     BillingType   @default(ONE_TIME)
  recurringPeriod RecurringPeriod?
  quoteLines      QuoteLine[]   // Many products per quote line
}

model Quotation {
  id                     String      @id @default(uuid())
  quoteNumber            String      @unique
  customerId             String
  customer               Customer    @relation(fields: [customerId], references: [id])
  createdById            String
  createdBy              User        @relation(fields: [createdById], references: [id])
  status                 QuoteStatus @default(DRAFT)
  subtotal               Float       @default(0)
  totalDiscount          Float       @default(0)
  netValue               Float       @default(0)
  grossMarginPercent     Float       @default(0)
  riskScore              Float       @default(0)
  riskLevel              String      @default("LOW")
  createdAt              DateTime    @default(now())
  updatedAt              DateTime    @updatedAt
  lines                  QuoteLine[]  // One quote has many lines
  portalTokens           PortalToken[] // Customer negotiation tokens
}

model QuoteLine {
  id              String      @id @default(uuid())
  quotationId     String
  quotation       Quotation   @relation(fields: [quotationId], references: [id], onDelete: Cascade)
  productId       String
  product         Product     @relation(fields: [productId], references: [id])
  quantity        Float
  listPrice       Float
  proposedDiscount Float
  netLinePrice    Float
  lineCost        Float
  lineMarginPercent Float
}
```

**Database Flow for Login:**
```
Authentication Request
    ↓
PostgreSQL Database (TCP connection via Prisma client)
    ↓
User table queried:
  SELECT * FROM "User" WHERE email = $1
    ↓
Returns user record with:
  { id, email, passwordHash, name, role, isActive, ... }
    ↓
Service verifies password with Argon2id
    ↓
If valid: Insert into RefreshSession table:
  INSERT INTO "RefreshSession" (id, userId, tokenHash, expiresAt, ...)
    ↓
Response returns to client
```

---

## 8. DATA VALIDATION: Contracts Layer

### Layer 11: Shared Contracts & Zod Schemas
**Key Files:**
- `packages/contracts/src/auth/index.ts` - Auth DTOs
- `packages/contracts/src/customer/index.ts` - Customer DTOs
- `packages/contracts/src/quotes/index.ts` - Quote DTOs
- More in `packages/contracts/src/`

**Contracts Pattern:**
```typescript
// packages/contracts/src/auth/index.ts

import { z } from 'zod';

// Define schema
export const LoginRequestSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be 8+ characters'),
});

// Infer TypeScript type from schema
export type LoginRequest = z.infer<typeof LoginRequestSchema>;

// Define response schema
export const UserDtoSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
  role: RoleEnum,
});

export type UserDto = z.infer<typeof UserDtoSchema>;

export const AuthResponseDataSchema = z.object({
  user: UserDtoSchema,
  accessToken: z.string(),
});

export type AuthResponseData = z.infer<typeof AuthResponseDataSchema>;
```

**How Contracts Are Used:**

1. **Frontend validates before sending:**
   ```typescript
   try {
     const validated = LoginRequestSchema.parse(formData);
     await apiClient.post('/api/v1/auth/login', validated);
   } catch (error) {
     // Show validation errors
   }
   ```

2. **Backend validates on receipt:**
   ```typescript
   export async function login(req, res, next) {
     try {
       const validated = LoginRequestSchema.parse(req.body);
       // Guaranteed valid structure
     } catch (error) {
       // Return validation error
       next(new AppError('VALIDATION_ERROR', error.message, 400));
     }
   }
   ```

3. **Ensures type safety end-to-end:**
   ```typescript
   // Frontend
   const response = await fetch(...); // Returns AuthResponseData
   const user: UserDto = response.data.user; // Type-safe!
   ```

---

## 9. RESPONSE FLOW: Backend → Frontend

### Layer 12: Response Formatting

**Standard Success Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-string",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "SALES_REP"
    },
    "accessToken": "eyJhbGc..."
  },
  "message": "Login successful.",
  "meta": null
}
```

**Standard Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password.",
    "details": {}
  }
}
```

**Collection Response (for list endpoints):**
```json
{
  "success": true,
  "data": [...],
  "message": null,
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

---

## 10. COMPLETE EXAMPLE: Create Quotation Flow

Tracing a complete user action end-to-end:

```
USER INTERACTION
├─ User navigates to /quotations/new
├─ React component QuoteBuilderPage loads
├─ Component displays form fields
└─ User fills: customer, products, quantities, discounts

FRONTEND VALIDATION
├─ User clicks "Create Quote" button
├─ Form data validated against QuotationCreateSchema
└─ If invalid: show validation errors on form

API REQUEST
├─ POST /api/v1/quotes
├─ Headers:
│  ├─ Authorization: Bearer <accessToken>
│  ├─ Content-Type: application/json
│  └─ Cookies: <refreshToken (HttpOnly)>
└─ Body: { customerId, lines: [{productId, quantity, discountPercent}] }

BACKEND PROCESSING
├─ Express receives request
├─ Middleware chain:
│  ├─ helmet() - adds security headers
│  ├─ cors() - checks origin
│  ├─ express.json() - parses body
│  ├─ cookieParser() - parses cookies
│  └─ rateLimit() - checks rate limit
├─ Route matching: POST /api/v1/quotes → quoteRoutes
├─ authenticate middleware:
│  ├─ Extracts token from Authorization header
│  ├─ Verifies JWT signature and expiration
│  ├─ Loads user permissions from role
│  └─ Sets req.user = { userId, email, role, permissions }
├─ requirePermission('quotation.create') middleware:
│  └─ Checks user.permissions includes 'quotation.create'
└─ Route handler calls quoteController.createQuote()

CONTROLLER
├─ Input validation: QuotationCreateSchema.parse(req.body)
├─ Calls quoteService.createQuotation(validated, req.user)
└─ Returns response with status 201

SERVICE LAYER
├─ Fetch customer from repository
├─ Fetch products from repository
├─ Call domain.evaluateCommercial():
│  ├─ Calculate line prices & margins
│  ├─ Apply policy rules
│  ├─ Detect approval violations
│  ├─ Calculate risk score
│  └─ Returns evaluation result
├─ Determine approval routing:
│  └─ If violations: create ApprovalRequest
├─ Create Quotation in repository
├─ Create QuoteLines in repository
├─ Emit DealEvent for audit trail
└─ Return quotation + evaluation results

DOMAIN LAYER (Business Logic)
├─ evaluateCommercial():
│  ├─ Pure functions (no side effects)
│  ├─ Line-level calculations:
│  │  └─ netPrice = listPrice - (listPrice * discountPercent/100)
│  ├─ Totals:
│  │  ├─ netTotal = sum(netPrice * quantity)
│  │  ├─ totalCost = sum(costPrice * quantity)
│  │  └─ marginPercentage = (netTotal - totalCost) / netTotal
│  ├─ Policy checks:
│  │  └─ For each line: verify discount% ≤ policy.maxDiscount
│  ├─ Risk calculation:
│  │  └─ riskScore = f(marginPercent, tier, discounts, violations)
│  └─ Returns evaluation with violations & approval routing

REPOSITORY LAYER
├─ Create Quotation:
│  └─ INSERT INTO quotation (quote_number, customer_id, ...) VALUES (...)
├─ Create QuoteLine (multiple):
│  └─ INSERT INTO quote_line (quotation_id, product_id, ...) VALUES (...)
├─ Create ApprovalRequest (if needed):
│  └─ INSERT INTO approval_request (quotation_id, required_role, ...)
└─ Create DealEvent:
   └─ INSERT INTO deal_event (quotation_id, actor_id, event_type, payload)

DATABASE
├─ PostgreSQL receives INSERT statements
├─ Validates constraints & foreign keys
├─ Writes to storage
├─ Returns generated IDs & timestamps
└─ Responses flow back through repository → service → controller

RESPONSE TO FRONTEND
├─ Controller returns:
│  ├─ Status: 201 Created
│  └─ Body:
│     {
│       "success": true,
│       "data": {
│         "id": "quote-uuid",
│         "quoteNumber": "QT-2024-0001",
│         "customer": { id, name, tier },
│         "lines": [...],
│         "status": "DRAFT",
│         "netValue": 45000,
│         "marginPercent": 22.5,
│         "riskScore": 4.2,
│         "requiresApproval": true,
│         "requiredApprovalRoles": ["SALES_MANAGER"]
│       },
│       "message": "Quotation created successfully."
│     }

FRONTEND UPDATE
├─ React mutation resolves with response data
├─ Component state updated with quote data
├─ UI re-renders showing:
│  ├─ Quotation number & status
│  ├─ Line items with prices & margins
│  ├─ Risk indicators
│  ├─ Approval status
│  └─ Next action buttons
└─ Optional: Redirect to quote detail view (/quotations/:id)
```

---

## 11. CRITICAL FILE REFERENCE BY RESPONSIBILITY

### Authentication & Security
- `apps/api/src/app.ts` - Express security setup
- `apps/api/src/middleware/auth.ts` - JWT verification & RBAC
- `apps/api/src/auth/token.ts` - Token generation & verification
- `apps/api/src/auth/password.ts` - Argon2id hashing
- `packages/contracts/src/auth/index.ts` - Auth DTOs & role definitions

### Frontend
- `apps/web/src/main.tsx` - React app entry
- `apps/web/src/app/App.tsx` - Root component with providers
- `apps/web/src/routes/AppRoutes.tsx` - All routes & protected routes
- `apps/web/src/features/auth/AuthContext.tsx` - Auth state management
- Feature folders for each module (customers, quotes, portal, etc.)

### API Routes & Controllers
- `apps/api/src/app.ts` - Route registration
- `apps/api/src/routes/authRoutes.ts` - Auth endpoints
- `apps/api/src/routes/customerRoutes.ts` - Customer endpoints
- `apps/api/src/routes/quoteRoutes.ts` - Quote endpoints
- Other route files for fulfillment, billing, portal, etc.

### Services & Business Orchestration
- `apps/api/src/services/authService.ts` - Auth operations
- Additional service files in `apps/api/src/services/`

### Domain Business Logic (Pure)
- `packages/domain/src/pricing/` - Price calculations
- `packages/domain/src/margin/` - Margin calculations
- `packages/domain/src/policy/` - Policy rule validation
- `packages/domain/src/approval/` - Approval routing
- `packages/domain/src/risk/` - Risk scoring
- `packages/domain/src/quote/` - Quote state machine
- `packages/domain/src/fulfillment/` - Warehouse allocation
- `packages/domain/src/billing/` - Invoice scheduling

### Data Access (Repositories)
- `apps/api/src/repositories/userRepository.ts` - User data access
- Additional repository files in `apps/api/src/repositories/`

### Database
- `packages/db/prisma/schema.prisma` - Database schema
- `packages/db/prisma/migrations/` - Schema migration history
- `packages/db/prisma.config.ts` - Prisma configuration

### Contracts & Validation
- `packages/contracts/src/index.ts` - Main export
- `packages/contracts/src/auth/index.ts` - Auth contracts
- `packages/contracts/src/customer/index.ts` - Customer contracts
- `packages/contracts/src/quotes/index.ts` - Quote contracts
- Similar files for other domains (billing, fulfillment, portal, etc.)

### Shared Middleware
- `apps/api/src/middleware/auth.ts` - Authentication & authorization
- `apps/api/src/middleware/errorHandler.ts` - Global error handling
- `apps/api/src/middleware/index.ts` - Middleware exports

### Configuration
- `apps/api/src/config/env.ts` - Environment variables
- `apps/api/package.json` - API dependencies
- `apps/web/vite.config.ts` - Frontend build configuration
- Root `pnpm-workspace.yaml` - Monorepo configuration

---

## 12. Key Architectural Patterns

### Dependency Injection
Controllers receive services injected:
```typescript
class UserRepository {
  // Default instance
}

const userRepository = new UserRepository();

export class AuthService {
  constructor(private userRepo = userRepository) {}
}
```

### Error Handling Pyramid
```
User input → Zod validation
     ↓
Business rules → AppError exceptions
     ↓
Database constraints → Prisma errors
     ↓
Global error handler → Standardized response
```

### Request Context Flow
```
req.user (from authenticate middleware) 
  → passed through service layers 
  → used for audit logging & permission checks
  → never leaked to frontend
```

### Contract-First Development
```
1. Define contracts in packages/contracts
2. Backend implements to contract
3. Frontend uses same contracts
4. Type-safe end-to-end
```

---

## Summary

**Data flows through 12 layers:**

1. **Frontend UI** - React components collect user input
2. **Frontend API Client** - Send HTTP requests with auth
3. **Express Server** - Receive & route requests
4. **Middleware Chain** - Security, auth, parsing
5. **Route Matching** - Find correct handler
6. **Controllers** - Parse input, call services, format response
7. **Services** - Orchestrate business operations
8. **Domain Logic** - Pure business rules (single source of truth)
9. **Repositories** - Abstract database access
10. **Prisma ORM** - SQL generation & execution
11. **PostgreSQL Database** - Store & retrieve data
12. **Response Formatting** - Send standardized JSON back to frontend

**Every request:**
- Validated against Zod schemas (contracts)
- Authenticated (JWT token)
- Authorized (role-based permissions)
- Processed by domain logic (business rules)
- Persisted to database
- Returned in standardized format

**Every layer has clear responsibility & cannot bypass its neighbors.**
