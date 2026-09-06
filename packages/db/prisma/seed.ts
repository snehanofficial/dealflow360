import 'dotenv/config';
import { config } from 'dotenv';
import { PrismaClient, Role } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import argon2 from 'argon2';

config({ path: '../../.env' });

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding development users...');

  const defaultPasswordHash = await argon2.hash('Password123!', {
    type: argon2.argon2id,
  });

  // Seed Customer first so User can reference it
  const acmeCorp = await prisma.customer.upsert({
    where: { id: 'cust-acme-001' },
    update: {
      name: 'Acme Enterprise Solutions',
      email: 'customer@dealflow360.com',
      tier: 'ENTERPRISE',
      creditLimit: 500000,
    },
    create: {
      id: 'cust-acme-001',
      code: 'CUST-ACME-001',
      email: 'customer@dealflow360.com',
      name: 'Acme Enterprise Solutions',
      tier: 'ENTERPRISE',
      creditLimit: 500000,
      region: 'US-East',
      accountManager: 'Bob Salesrep',
    },
  });
  console.log(`Seeded customer: ${acmeCorp.name}`);

  const seedUsers = [
    {
      email: 'admin@dealflow360.com',
      name: 'System Admin',
      role: Role.ADMIN,
      passwordHash: defaultPasswordHash,
    },
    {
      email: 'sales.manager@dealflow360.com',
      name: 'Sarah Manager',
      role: Role.SALES_MANAGER,
      passwordHash: defaultPasswordHash,
    },
    {
      email: 'sales.rep@dealflow360.com',
      name: 'Bob Salesrep',
      role: Role.SALES_REP,
      passwordHash: defaultPasswordHash,
    },
    {
      email: 'finance@dealflow360.com',
      name: 'Frank Finance',
      role: Role.FINANCE_OPERATIONS,
      passwordHash: defaultPasswordHash,
    },
    {
      email: 'customer@dealflow360.com',
      name: 'Acme Procurement',
      role: Role.CUSTOMER,
      customerId: acmeCorp.id,
      passwordHash: defaultPasswordHash,
    },
  ];

  for (const user of seedUsers) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        role: user.role,
        customerId: user.customerId || null,
        passwordHash: user.passwordHash,
      },
      create: user,
    });
    console.log(`Seeded user: ${user.email} (${user.role})`);
  }

  // Seed Products
  const serverProduct = await prisma.product.upsert({
    where: { sku: 'SKU-SRV-9000' },
    update: {
      name: 'Enterprise Server Pro',
      category: 'Hardware',
      listPrice: 10000,
      standardCost: 6000,
    },
    create: {
      id: 'prod-srv-001',
      sku: 'SKU-SRV-9000',
      name: 'Enterprise Server Pro',
      category: 'Hardware',
      listPrice: 10000,
      standardCost: 6000,
      billingType: 'ONE_TIME',
    },
  });

  const upsProduct = await prisma.product.upsert({
    where: { sku: 'SKU-UPS-2000' },
    update: {
      name: 'Smart UPS Power Backup 3kVA',
      category: 'Hardware Accessories',
      listPrice: 2500,
      standardCost: 1400,
    },
    create: {
      id: 'prod-ups-001',
      sku: 'SKU-UPS-2000',
      name: 'Smart UPS Power Backup 3kVA',
      category: 'Hardware Accessories',
      listPrice: 2500,
      standardCost: 1400,
      billingType: 'ONE_TIME',
    },
  });

  const rackProduct = await prisma.product.upsert({
    where: { sku: 'SKU-RCK-42U' },
    update: {
      name: 'Heavy Duty 42U Server Rack',
      category: 'Hardware Accessories',
      listPrice: 1800,
      standardCost: 950,
    },
    create: {
      id: 'prod-rck-001',
      sku: 'SKU-RCK-42U',
      name: 'Heavy Duty 42U Server Rack',
      category: 'Hardware Accessories',
      listPrice: 1800,
      standardCost: 950,
      billingType: 'ONE_TIME',
    },
  });

  const securitySub = await prisma.product.upsert({
    where: { sku: 'SKU-SEC-ANNUAL' },
    update: {
      name: 'Enterprise Cloud Security Suite',
      category: 'Software Subscriptions',
      listPrice: 5000,
      standardCost: 1500,
    },
    create: {
      id: 'prod-sec-001',
      sku: 'SKU-SEC-ANNUAL',
      name: 'Enterprise Cloud Security Suite',
      category: 'Software Subscriptions',
      listPrice: 5000,
      standardCost: 1500,
      billingType: 'RECURRING',
      recurringPeriod: 'ANNUAL',
    },
  });
  console.log('Seeded products.');

  // Seed Recommendation Rules
  await prisma.recommendationRule.upsert({
    where: { id: 'rule-copurchase-001' },
    update: {
      priority: 25,
      reasonTemplate: 'Frequently co-purchased with {sourceProduct}',
    },
    create: {
      id: 'rule-copurchase-001',
      sourceProductId: serverProduct.id,
      recommendedProductId: upsProduct.id,
      ruleType: 'CO_PURCHASE',
      reasonTemplate: 'Frequently co-purchased with Enterprise Server Pro',
      priority: 25,
      isActive: true,
    },
  });

  await prisma.recommendationRule.upsert({
    where: { id: 'rule-copurchase-002' },
    update: {
      priority: 15,
      reasonTemplate: 'Recommended accessory for rack integration',
    },
    create: {
      id: 'rule-copurchase-002',
      sourceProductId: serverProduct.id,
      recommendedProductId: rackProduct.id,
      ruleType: 'CROSS_SELL',
      reasonTemplate: 'Recommended rackmount enclosure for server deployment',
      priority: 15,
      isActive: true,
    },
  });

  await prisma.recommendationRule.upsert({
    where: { id: 'rule-promo-001' },
    update: {
      priority: 30,
      promotionDiscountPercent: 15,
      reasonTemplate: 'Active 15% Bundle Promotion',
    },
    create: {
      id: 'rule-promo-001',
      sourceProductId: null,
      recommendedProductId: securitySub.id,
      ruleType: 'PROMOTION',
      reasonTemplate: 'Enterprise Security Annual Bundle Promotion',
      priority: 30,
      promotionDiscountPercent: 15,
      isActive: true,
    },
  });
  console.log('Seeded recommendation rules.');

  // Seed Sample Quotation
  const salesRepUser = await prisma.user.findUnique({
    where: { email: 'sales.rep@dealflow360.com' },
  });

  if (salesRepUser) {
    const sampleQuote = await prisma.quotation.upsert({
      where: { id: 'quote-sample-001' },
      update: {},
      create: {
        id: 'quote-sample-001',
        quoteNumber: 'QT-2026-0001',
        customerId: acmeCorp.id,
        createdById: salesRepUser.id,
        status: 'DRAFT',
        subtotal: 20000,
        totalDiscount: 1000,
        netValue: 19000,
        grossMarginPercent: 36.84,
        riskScore: 2.1,
        riskLevel: 'LOW',
      },
    });

    await prisma.quoteLine.upsert({
      where: { id: 'qline-sample-001' },
      update: {},
      create: {
        id: 'qline-sample-001',
        quotationId: sampleQuote.id,
        productId: serverProduct.id,
        quantity: 2,
        listPrice: 10000,
        proposedDiscountPercent: 5,
        discountAmount: 1000,
        netLinePrice: 19000,
        lineCost: 12000,
        lineMarginPercent: 36.84,
      },
    });
    console.log(`Seeded sample quotation: ${sampleQuote.quoteNumber}`);
  }

  // Seed Discount Policy Rules
  const policyRules = [
    {
      id: 'rule-ent-001',
      name: 'Enterprise Tier Discount Policy',
      description: 'Special high-volume discount allowance for Enterprise tier customers',
      customerTier: 'ENTERPRISE' as const,
      category: null,
      maxDiscountPercent: 20.0,
      minMarginPercent: 20.0,
      requiredApprovalRole: Role.SALES_MANAGER,
      priority: 50,
      isActive: true,
    },
    {
      id: 'rule-t1-001',
      name: 'Gold Customer Policy',
      description: 'Standard governed discount allowance for Gold key accounts',
      customerTier: 'GOLD' as const,
      category: null,
      maxDiscountPercent: 15.0,
      minMarginPercent: 25.0,
      requiredApprovalRole: Role.SALES_MANAGER,
      priority: 40,
      isActive: true,
    },
    {
      id: 'rule-t2-001',
      name: 'Silver Customer Policy',
      description: 'Strict discount policy for Silver standard accounts',
      customerTier: 'SILVER' as const,
      category: null,
      maxDiscountPercent: 10.0,
      minMarginPercent: 30.0,
      requiredApprovalRole: Role.SALES_MANAGER,
      priority: 30,
      isActive: true,
    },
    {
      id: 'rule-hw-001',
      name: 'Hardware Category Margin Protection Policy',
      description: 'Requires Finance approval when Hardware discounts impact baseline margin',
      customerTier: null,
      category: 'Hardware',
      maxDiscountPercent: 12.0,
      minMarginPercent: 25.0,
      requiredApprovalRole: Role.FINANCE_OPERATIONS,
      priority: 60,
      isActive: true,
    },
    {
      id: 'rule-global-001',
      name: 'Global Default Commercial Governance',
      description: 'Fallback policy for unclassified customers and products',
      customerTier: null,
      category: null,
      maxDiscountPercent: 10.0,
      minMarginPercent: 25.0,
      requiredApprovalRole: Role.SALES_MANAGER,
      priority: 10,
      isActive: true,
    },
  ];

  for (const rule of policyRules) {
    await prisma.discountPolicyRule.upsert({
      where: { id: rule.id },
      update: rule,
      create: rule,
    });
  }
  console.log('Seeded discount policy rules.');

  // Seed System Config
  await prisma.systemConfig.upsert({
    where: { configKey: 'BUSINESS_THRESHOLDS' },
    update: {
      configValue: {
        discountThreshold: 10,
        marginMinimum: 20,
        marginWarning: 30,
        stalledDaysThreshold: 7,
        minMarginThreshold: 25,
      }
    },
    create: {
      id: 'default',
      configKey: 'BUSINESS_THRESHOLDS',
      configValue: {
        discountThreshold: 10,
        marginMinimum: 20,
        marginWarning: 30,
        stalledDaysThreshold: 7,
        minMarginThreshold: 25,
      }
    }
  });
  console.log('Seeded System Config.');

  console.log('Database seed completed successfully.');
}


main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
