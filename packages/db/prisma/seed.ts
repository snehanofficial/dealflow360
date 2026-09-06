import 'dotenv/config';
import { config } from 'dotenv';
import {
  PrismaClient,
  Role,
  CustomerTier,
  CustomerStatus,
  BillingType,
  RecurringPeriod,
  QuoteStatus,
  RecommendationRuleType,
  ApprovalRequestStatus,
  ApprovalStepStatus,
  AllocationStatus,
  BackorderStatus,
  BillingScheduleStatus,
  InvoiceStatus,
  PaymentStatus,
  CounterOfferStatus,
  InventoryMovementType,
} from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import argon2 from 'argon2';

config({ path: '../../.env' });

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🚀 Starting DealFlow360 Connected Demo Seed...');

  const defaultPasswordHash = await argon2.hash('Password123!', {
    type: argon2.argon2id,
  });

  // ==========================================
  // 1. CUSTOMERS (10 connected enterprise accounts)
  // ==========================================
  console.log('📦 Seeding 10 Customers...');
  const customerDefs = [
    {
      id: 'cust-acme-001',
      code: 'CUST-ACME-001',
      name: 'Acme Enterprise Solutions',
      email: 'customer@dealflow360.com',
      phone: '+1-555-0101',
      tier: CustomerTier.ENTERPRISE,
      status: CustomerStatus.ACTIVE,
      creditLimit: 500000,
      region: 'US-East',
      accountManager: 'Bob Salesrep',
    },
    {
      id: 'cust-beta-002',
      code: 'CUST-BETA-002',
      name: 'Beta Industries Inc',
      email: 'customer.beta@dealflow360.com',
      phone: '+1-555-0102',
      tier: CustomerTier.GOLD,
      status: CustomerStatus.ACTIVE,
      creditLimit: 350000,
      region: 'US-West',
      accountManager: 'Bob Salesrep',
    },
    {
      id: 'cust-nova-003',
      code: 'CUST-NOVA-003',
      name: 'Nova Healthcare Systems',
      email: 'customer.nova@dealflow360.com',
      phone: '+1-555-0103',
      tier: CustomerTier.GOLD,
      status: CustomerStatus.ACTIVE,
      creditLimit: 400000,
      region: 'US-North',
      accountManager: 'Alice Rep',
    },
    {
      id: 'cust-vertex-004',
      code: 'CUST-VERTEX-004',
      name: 'Vertex Financial Services',
      email: 'procurement@vertexfin.com',
      phone: '+1-555-0104',
      tier: CustomerTier.GOLD,
      status: CustomerStatus.ACTIVE,
      creditLimit: 450000,
      region: 'US-East',
      accountManager: 'Alice Rep',
    },
    {
      id: 'cust-orion-005',
      code: 'CUST-ORION-005',
      name: 'Orion Manufacturing Group',
      email: 'supply@orionmfg.com',
      phone: '+1-555-0105',
      tier: CustomerTier.SILVER,
      status: CustomerStatus.ACTIVE,
      creditLimit: 200000,
      region: 'US-Central',
      accountManager: 'Charlie Rep',
    },
    {
      id: 'cust-apex-006',
      code: 'CUST-APEX-006',
      name: 'Apex Retail Group',
      email: 'orders@apexretail.com',
      phone: '+1-555-0106',
      tier: CustomerTier.SILVER,
      status: CustomerStatus.ACTIVE,
      creditLimit: 180000,
      region: 'US-South',
      accountManager: 'Charlie Rep',
    },
    {
      id: 'cust-quantum-007',
      code: 'CUST-QUANTUM-007',
      name: 'Quantum Education Network',
      email: 'tech@quantumed.org',
      phone: '+1-555-0107',
      tier: CustomerTier.SILVER,
      status: CustomerStatus.ACTIVE,
      creditLimit: 150000,
      region: 'US-North',
      accountManager: 'Bob Salesrep',
    },
    {
      id: 'cust-bluepeak-008',
      code: 'CUST-BLUEPEAK-008',
      name: 'BluePeak Logistics',
      email: 'fleet@bluepeaklogistics.com',
      phone: '+1-555-0108',
      tier: CustomerTier.BRONZE,
      status: CustomerStatus.ACTIVE,
      creditLimit: 90000,
      region: 'US-West',
      accountManager: 'Alice Rep',
    },
    {
      id: 'cust-greengrid-009',
      code: 'CUST-GREENGRID-009',
      name: 'GreenGrid Energy Corp',
      email: 'systems@greengrid.com',
      phone: '+1-555-0109',
      tier: CustomerTier.BRONZE,
      status: CustomerStatus.ACTIVE,
      creditLimit: 100000,
      region: 'US-East',
      accountManager: 'Charlie Rep',
    },
    {
      id: 'cust-stellar-010',
      code: 'CUST-STELLAR-010',
      name: 'Stellar Communications',
      email: 'noc@stellarcomms.com',
      phone: '+1-555-0110',
      tier: CustomerTier.BRONZE,
      status: CustomerStatus.ACTIVE,
      creditLimit: 75000,
      region: 'US-Central',
      accountManager: 'Bob Salesrep',
    },
  ];

  const seededCustomers: Record<string, any> = {};
  for (const cust of customerDefs) {
    seededCustomers[cust.id] = await prisma.customer.upsert({
      where: { id: cust.id },
      update: cust,
      create: cust,
    });
  }

  // ==========================================
  // 2. USERS (Internal roles + Customer Portal Users)
  // ==========================================
  console.log('👤 Seeding 10 Users...');
  const userDefs = [
    {
      id: 'user-admin-001',
      email: 'admin@dealflow360.com',
      name: 'System Admin',
      role: Role.ADMIN,
      passwordHash: defaultPasswordHash,
    },
    {
      id: 'user-mgr-001',
      email: 'sales.manager@dealflow360.com',
      name: 'Sarah Manager',
      role: Role.SALES_MANAGER,
      passwordHash: defaultPasswordHash,
    },
    {
      id: 'user-mgr-002',
      email: 'sales.manager2@dealflow360.com',
      name: 'Marcus Manager',
      role: Role.SALES_MANAGER,
      passwordHash: defaultPasswordHash,
    },
    {
      id: 'user-rep-001',
      email: 'sales.rep@dealflow360.com',
      name: 'Bob Salesrep',
      role: Role.SALES_REP,
      passwordHash: defaultPasswordHash,
    },
    {
      id: 'user-rep-002',
      email: 'sales.rep2@dealflow360.com',
      name: 'Alice Rep',
      role: Role.SALES_REP,
      passwordHash: defaultPasswordHash,
    },
    {
      id: 'user-rep-003',
      email: 'sales.rep3@dealflow360.com',
      name: 'Charlie Rep',
      role: Role.SALES_REP,
      passwordHash: defaultPasswordHash,
    },
    {
      id: 'user-fin-001',
      email: 'finance@dealflow360.com',
      name: 'Frank Finance',
      role: Role.FINANCE_OPERATIONS,
      passwordHash: defaultPasswordHash,
    },
    {
      id: 'user-fin-002',
      email: 'finance2@dealflow360.com',
      name: 'Fiona Operations',
      role: Role.FINANCE_OPERATIONS,
      passwordHash: defaultPasswordHash,
    },
    {
      id: 'user-cust-001',
      email: 'customer@dealflow360.com',
      name: 'Acme Procurement',
      role: Role.CUSTOMER,
      customerId: seededCustomers['cust-acme-001'].id,
      passwordHash: defaultPasswordHash,
    },
    {
      id: 'user-cust-002',
      email: 'customer.beta@dealflow360.com',
      name: 'Beta Procurement',
      role: Role.CUSTOMER,
      customerId: seededCustomers['cust-beta-002'].id,
      passwordHash: defaultPasswordHash,
    },
    {
      id: 'user-cust-003',
      email: 'customer.nova@dealflow360.com',
      name: 'Nova Procurement',
      role: Role.CUSTOMER,
      customerId: seededCustomers['cust-nova-003'].id,
      passwordHash: defaultPasswordHash,
    },
  ];

  const seededUsers: Record<string, any> = {};
  for (const user of userDefs) {
    seededUsers[user.email] = await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        role: user.role,
        customerId: user.customerId || null,
        passwordHash: user.passwordHash,
      },
      create: user,
    });
  }

  // ==========================================
  // 3. CATEGORIES & PRODUCTS (10 products with margin variety)
  // ==========================================
  console.log('🏷️ Seeding Product Categories & 10 Products...');

  const categoryDefs = [
    { id: 'cat-hw', name: 'Hardware', code: 'HARDWARE', description: 'Enterprise hardware servers and switches' },
    { id: 'cat-acc', name: 'Hardware Accessories', code: 'HARDWARE_ACCESSORIES', description: 'Racks, UPS, cabling' },
    { id: 'cat-srv', name: 'Professional Services', code: 'PROFESSIONAL_SERVICES', description: 'Deployment, integration & support' },
    { id: 'cat-sub', name: 'Software Subscriptions', code: 'SUBSCRIPTION', description: 'Cloud security & backup software' },
  ];

  await prisma.productCategory.deleteMany({});
  await prisma.category.deleteMany({});

  for (const cat of categoryDefs) {
    await prisma.category.create({ data: cat });
  }

  const productDefs = [
    {
      id: 'prod-srv-001',
      sku: 'SKU-SRV-9000',
      name: 'Enterprise Server Pro',
      description: 'High-density 2U dual-socket enterprise rack server',
      category: 'Hardware',
      listPrice: 10000,
      standardCost: 6000, // 40% margin
      maxAllowedDiscount: 15.0,
      billingType: BillingType.ONE_TIME,
      recurringPeriod: null,
      taxRate: 0.08,
    },
    {
      id: 'prod-sw-001',
      sku: 'SKU-SW-48P',
      name: 'Core Network Switch 48-Port',
      description: '48-port Layer 3 Managed PoE+ Gigabit Switch',
      category: 'Hardware',
      listPrice: 4500,
      standardCost: 2700, // 40% margin
      maxAllowedDiscount: 12.0,
      billingType: BillingType.ONE_TIME,
      recurringPeriod: null,
      taxRate: 0.08,
    },
    {
      id: 'prod-str-001',
      sku: 'SKU-STR-SAN',
      name: 'High-Perf SAN Storage Array',
      description: 'Dual controller 100TB High Performance Flash Storage Array',
      category: 'Hardware',
      listPrice: 15000,
      standardCost: 10500, // 30% margin (Low margin!)
      maxAllowedDiscount: 10.0,
      billingType: BillingType.ONE_TIME,
      recurringPeriod: null,
      taxRate: 0.08,
    },
    {
      id: 'prod-ups-001',
      sku: 'SKU-UPS-2000',
      name: 'Smart UPS Power Backup 3kVA',
      description: 'Rackmount 3000VA / 2700W Line Interactive Uninterruptible Power Supply',
      category: 'Hardware Accessories',
      listPrice: 2500,
      standardCost: 1400, // 44% margin
      maxAllowedDiscount: 15.0,
      billingType: BillingType.ONE_TIME,
      recurringPeriod: null,
      taxRate: 0.08,
    },
    {
      id: 'prod-rck-001',
      sku: 'SKU-RCK-42U',
      name: 'Heavy Duty 42U Server Rack',
      description: '42U Enclosure Server Cabinet with Cable Management',
      category: 'Hardware Accessories',
      listPrice: 1800,
      standardCost: 950, // 47.2% margin
      maxAllowedDiscount: 15.0,
      billingType: BillingType.ONE_TIME,
      recurringPeriod: null,
      taxRate: 0.08,
    },
    {
      id: 'prod-inst-001',
      sku: 'SKU-SRV-INST',
      name: 'On-Site Installation Service',
      description: 'Turnkey rack assembly, cabling, OS installation and validation',
      category: 'Professional Services',
      listPrice: 3000,
      standardCost: 1200, // 60% margin (High margin!)
      maxAllowedDiscount: 10.0,
      billingType: BillingType.ONE_TIME,
      recurringPeriod: null,
      taxRate: 0.0,
    },
    {
      id: 'prod-supp-001',
      sku: 'SKU-SRV-SUPP',
      name: '24/7 Enterprise Premium Support',
      description: '24/7 Priority support with 2-hour SLA response time',
      category: 'Professional Services',
      listPrice: 6000,
      standardCost: 2400, // 60% margin
      maxAllowedDiscount: 15.0,
      billingType: BillingType.RECURRING,
      recurringPeriod: RecurringPeriod.MONTHLY,
      taxRate: 0.0,
    },
    {
      id: 'prod-sec-001',
      sku: 'SKU-SEC-ANNUAL',
      name: 'Enterprise Cloud Security Suite',
      description: 'Zero-trust network security, endpoint detection and firewall management',
      category: 'Software Subscriptions',
      listPrice: 5000,
      standardCost: 1500, // 70% margin (High margin!)
      maxAllowedDiscount: 20.0,
      billingType: BillingType.RECURRING,
      recurringPeriod: RecurringPeriod.ANNUAL,
      taxRate: 0.05,
    },
    {
      id: 'prod-bkp-001',
      sku: 'SKU-BKP-ANNUAL',
      name: 'Managed Cloud Backup Solution',
      description: 'Automated encrypted cloud snapshot backup and disaster recovery',
      category: 'Software Subscriptions',
      listPrice: 4000,
      standardCost: 1600, // 60% margin
      maxAllowedDiscount: 15.0,
      billingType: BillingType.RECURRING,
      recurringPeriod: RecurringPeriod.ANNUAL,
      taxRate: 0.05,
    },
    {
      id: 'prod-cloud-001',
      sku: 'SKU-GW-HYBRID',
      name: 'Hybrid Cloud Infrastructure Gateway',
      description: 'Edge appliance for secure hybrid cloud compute synchronization',
      category: 'Hardware',
      listPrice: 8000,
      standardCost: 5200, // 35% margin
      maxAllowedDiscount: 12.0,
      billingType: BillingType.ONE_TIME,
      recurringPeriod: null,
      taxRate: 0.08,
    },
  ];

  const seededProducts: Record<string, any> = {};
  for (const prod of productDefs) {
    seededProducts[prod.id] = await prisma.product.upsert({
      where: { sku: prod.sku },
      update: prod,
      create: prod,
    });
  }

  // ==========================================
  // 4. PRICE LISTS & TIER PRICING
  // ==========================================
  console.log('💳 Seeding Price Lists & Tier Pricing...');

  const priceListDefs = [
    { id: 'plist-ent', name: 'Enterprise Customer Price List', customerTier: CustomerTier.ENTERPRISE, isDefault: false },
    { id: 'plist-gold', name: 'Gold Tier Key Account Price List', customerTier: CustomerTier.GOLD, isDefault: false },
    { id: 'plist-silver', name: 'Silver Tier Standard Price List', customerTier: CustomerTier.SILVER, isDefault: false },
    { id: 'plist-bronze', name: 'Bronze Tier Baseline Price List', customerTier: CustomerTier.BRONZE, isDefault: false },
    { id: 'plist-default', name: 'Global List Price Catalog', customerTier: null, isDefault: true },
  ];

  for (const pl of priceListDefs) {
    const priceList = await prisma.priceList.upsert({
      where: { id: pl.id },
      update: pl,
      create: pl,
    });

    // Add entries for major products
    for (const prodId of Object.keys(seededProducts)) {
      const p = seededProducts[prodId];
      let discountMultiplier = 1.0;
      if (pl.customerTier === CustomerTier.ENTERPRISE) discountMultiplier = 0.90; // 10% catalog discount for Enterprise
      if (pl.customerTier === CustomerTier.GOLD) discountMultiplier = 0.95; // 5% catalog discount for Gold

      await prisma.priceListEntry.upsert({
        where: {
          priceListId_productId: {
            priceListId: priceList.id,
            productId: p.id,
          },
        },
        update: { unitPrice: p.listPrice * discountMultiplier },
        create: {
          priceListId: priceList.id,
          productId: p.id,
          unitPrice: p.listPrice * discountMultiplier,
        },
      });
    }
  }

  // ==========================================
  // 5. DISCOUNT POLICY MATRIX
  // ==========================================
  console.log('📜 Seeding Discount Policy Governance Matrix...');

  const policyRules = [
    {
      id: 'rule-ent-001',
      name: 'Enterprise Tier Governance Policy',
      description: 'Governed volume discount threshold for Enterprise key accounts',
      customerTier: CustomerTier.ENTERPRISE,
      category: null,
      maxDiscountPercent: 20.0,
      minMarginPercent: 20.0,
      requiredApprovalRole: Role.SALES_MANAGER,
      priority: 50,
      isActive: true,
    },
    {
      id: 'rule-gold-001',
      name: 'Gold Customer Governance Policy',
      description: 'Standard governed discount allowance for Gold customer tier',
      customerTier: CustomerTier.GOLD,
      category: null,
      maxDiscountPercent: 15.0,
      minMarginPercent: 25.0,
      requiredApprovalRole: Role.SALES_MANAGER,
      priority: 40,
      isActive: true,
    },
    {
      id: 'rule-silver-001',
      name: 'Silver Customer Governance Policy',
      description: 'Strict discount policy for Silver tier standard accounts',
      customerTier: CustomerTier.SILVER,
      category: null,
      maxDiscountPercent: 10.0,
      minMarginPercent: 30.0,
      requiredApprovalRole: Role.SALES_MANAGER,
      priority: 30,
      isActive: true,
    },
    {
      id: 'rule-bronze-001',
      name: 'Bronze Customer Governance Policy',
      description: 'Baseline policy for Bronze tier entry-level accounts',
      customerTier: CustomerTier.BRONZE,
      category: null,
      maxDiscountPercent: 5.0,
      minMarginPercent: 35.0,
      requiredApprovalRole: Role.SALES_MANAGER,
      priority: 20,
      isActive: true,
    },
    {
      id: 'rule-hw-001',
      name: 'Hardware Category Margin Protection Policy',
      description: 'Requires Finance approval when Hardware discounts degrade baseline margin below 25%',
      customerTier: null,
      category: 'Hardware',
      maxDiscountPercent: 12.0,
      minMarginPercent: 25.0,
      requiredApprovalRole: Role.FINANCE_OPERATIONS,
      priority: 60,
      isActive: true,
    },
    {
      id: 'rule-srv-001',
      name: 'Services Category Governance Policy',
      description: 'Governed threshold for Professional Services discount requests',
      customerTier: null,
      category: 'Professional Services',
      maxDiscountPercent: 10.0,
      minMarginPercent: 30.0,
      requiredApprovalRole: Role.SALES_MANAGER,
      priority: 45,
      isActive: true,
    },
    {
      id: 'rule-global-001',
      name: 'Global Fallback Commercial Policy',
      description: 'Default commercial policy for unclassified items and accounts',
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


  // ==========================================
  // 6. WAREHOUSES & INVENTORY LEDGER
  // ==========================================
  console.log('🏭 Seeding 10 Warehouses & Inventory Ledger...');

  const warehouseDefs = [
    { id: 'wh-east-001', code: 'WH-EAST', name: 'East Coast Logistics Hub', location: 'New York, NY', priority: 10 },
    { id: 'wh-west-002', code: 'WH-WEST', name: 'West Coast Logistics Hub', location: 'San Francisco, CA', priority: 20 },
    { id: 'wh-central-003', code: 'WH-CENTRAL', name: 'Midwest Distribution Center', location: 'Chicago, IL', priority: 30 },
    { id: 'wh-north-004', code: 'WH-NORTH', name: 'Northern Regional Depot', location: 'Seattle, WA', priority: 40 },
    { id: 'wh-south-005', code: 'WH-SOUTH', name: 'Southern Express Warehouse', location: 'Dallas, TX', priority: 50 },
    { id: 'wh-atl-006', code: 'WH-ATL', name: 'Southeast Fulfillment Center', location: 'Atlanta, GA', priority: 60 },
    { id: 'wh-den-007', code: 'WH-DEN', name: 'Mountain Region Depot', location: 'Denver, CO', priority: 70 },
    { id: 'wh-bos-008', code: 'WH-BOS', name: 'New England Distribution', location: 'Boston, MA', priority: 80 },
    { id: 'wh-mia-009', code: 'WH-MIA', name: 'Florida Logistics Gateway', location: 'Miami, FL', priority: 90 },
    { id: 'wh-phx-010', code: 'WH-PHX', name: 'Southwest Fulfillment Hub', location: 'Phoenix, AZ', priority: 100 },
  ];

  const seededWarehouses: Record<string, any> = {};
  for (const wh of warehouseDefs) {
    seededWarehouses[wh.id] = await prisma.warehouse.upsert({
      where: { code: wh.code },
      update: wh,
      create: wh,
    });
  }

  // Stock major products in East, West, and Central warehouses to test allocation scenarios
  const inventorySetup = [
    // Scenario A & B: Enterprise Server Pro stock distribution
    { whId: 'wh-east-001', prodId: 'prod-srv-001', onHand: 20, reserved: 5, available: 15 },
    { whId: 'wh-west-002', prodId: 'prod-srv-001', onHand: 15, reserved: 5, available: 10 },
    { whId: 'wh-central-003', prodId: 'prod-srv-001', onHand: 10, reserved: 0, available: 10 },

    // Scenario C: Smart UPS stock distribution
    { whId: 'wh-east-001', prodId: 'prod-ups-001', onHand: 15, reserved: 5, available: 10 },
    { whId: 'wh-west-002', prodId: 'prod-ups-001', onHand: 20, reserved: 0, available: 20 },

    // 42U Server Rack
    { whId: 'wh-east-001', prodId: 'prod-rck-001', onHand: 30, reserved: 10, available: 20 },
    { whId: 'wh-central-003', prodId: 'prod-rck-001', onHand: 25, reserved: 5, available: 20 },

    // Network Switches & SAN Storage
    { whId: 'wh-east-001', prodId: 'prod-sw-001', onHand: 50, reserved: 10, available: 40 },
    { whId: 'wh-west-002', prodId: 'prod-str-001', onHand: 8, reserved: 2, available: 6 },
    { whId: 'wh-central-003', prodId: 'prod-cloud-001', onHand: 15, reserved: 3, available: 12 },
  ];

  for (const inv of inventorySetup) {
    const item = await prisma.inventoryItem.upsert({
      where: {
        warehouseId_productId: {
          warehouseId: inv.whId,
          productId: seededProducts[inv.prodId].id,
        },
      },
      update: {
        onHandQuantity: inv.onHand,
        reservedQuantity: inv.reserved,
        availableQuantity: inv.available,
      },
      create: {
        warehouseId: inv.whId,
        productId: seededProducts[inv.prodId].id,
        onHandQuantity: inv.onHand,
        reservedQuantity: inv.reserved,
        availableQuantity: inv.available,
      },
    });

    // Record receipt movement log
    await prisma.inventoryMovement.upsert({
      where: { id: `mvt-init-${inv.whId}-${inv.prodId}` },
      update: {},
      create: {
        id: `mvt-init-${inv.whId}-${inv.prodId}`,
        warehouseId: inv.whId,
        productId: seededProducts[inv.prodId].id,
        movementType: InventoryMovementType.RECEIPT,
        quantity: inv.onHand,
        onHandBefore: 0,
        onHandAfter: inv.onHand,
        reservedBefore: 0,
        reservedAfter: inv.reserved,
        referenceType: 'INITIAL_SEED',
        reason: 'Initial warehouse stock receipt',
        actorName: 'System Admin',
      },
    });
  }

  // ==========================================
  // 7. RECOMMENDATION RULES
  // ==========================================
  console.log('💡 Seeding Upsell & Cross-sell Recommendation Rules...');

  const recoRules = [
    {
      id: 'rule-copurchase-001',
      sourceProductId: seededProducts['prod-srv-001'].id,
      recommendedProductId: seededProducts['prod-ups-001'].id,
      ruleType: RecommendationRuleType.CO_PURCHASE,
      reasonTemplate: 'Frequently co-purchased with Enterprise Server Pro for power redundancy',
      priority: 25,
      promotionDiscountPercent: null,
      isActive: true,
    },
    {
      id: 'rule-copurchase-002',
      sourceProductId: seededProducts['prod-srv-001'].id,
      recommendedProductId: seededProducts['prod-rck-001'].id,
      ruleType: RecommendationRuleType.CROSS_SELL,
      reasonTemplate: 'Recommended heavy-duty 42U rackmount enclosure for server deployment',
      priority: 15,
      promotionDiscountPercent: null,
      isActive: true,
    },
    {
      id: 'rule-cross-001',
      sourceProductId: seededProducts['prod-sw-001'].id,
      recommendedProductId: seededProducts['prod-inst-001'].id,
      ruleType: RecommendationRuleType.CROSS_SELL,
      reasonTemplate: 'Professional turn-key on-site installation recommended for core switches',
      priority: 20,
      promotionDiscountPercent: null,
      isActive: true,
    },
    {
      id: 'rule-upsell-001',
      sourceProductId: seededProducts['prod-str-001'].id,
      recommendedProductId: seededProducts['prod-supp-001'].id,
      ruleType: RecommendationRuleType.UPSELL,
      reasonTemplate: '24/7 Enterprise Premium Support recommended for critical SAN storage arrays',
      priority: 35,
      promotionDiscountPercent: null,
      isActive: true,
    },
    {
      id: 'rule-promo-001',
      sourceProductId: null,
      recommendedProductId: seededProducts['prod-sec-001'].id,
      ruleType: RecommendationRuleType.PROMOTION,
      reasonTemplate: 'Active 15% Bundle Promotion on Enterprise Cloud Security Suite',
      priority: 30,
      promotionDiscountPercent: 15,
      isActive: true,
    },
    {
      id: 'rule-promo-002',
      sourceProductId: null,
      recommendedProductId: seededProducts['prod-bkp-001'].id,
      ruleType: RecommendationRuleType.PROMOTION,
      reasonTemplate: 'Active 10% Special Discount on Managed Cloud Backup Solution',
      priority: 28,
      promotionDiscountPercent: 10,
      isActive: true,
    },
  ];

  for (const rule of recoRules) {
    await prisma.recommendationRule.upsert({
      where: { id: rule.id },
      update: rule,
      create: rule,
    });
  }

  // ==========================================
  // 8. QUOTATIONS & CONNECTED WORKFLOW SCENARIOS (10 Quotations)
  // ==========================================
  console.log('📋 Seeding 10 Quotations & Connected Workflows...');

  const salesRepBob = seededUsers['sales.rep@dealflow360.com'];
  const salesRepAlice = seededUsers['sales.rep2@dealflow360.com'];
  const salesRepCharlie = seededUsers['sales.rep3@dealflow360.com'];

  // --- QUOTE 1 (Hero 1: Excessive Discount -> Manager Approval Required) ---
  const quote1 = await prisma.quotation.upsert({
    where: { quoteNumber: 'QT-2026-0001' },
    update: { status: QuoteStatus.PENDING_MANAGER },
    create: {
      id: 'quote-demo-001',
      quoteNumber: 'QT-2026-0001',
      customerId: seededCustomers['cust-acme-001'].id,
      createdById: salesRepBob.id,
      status: QuoteStatus.PENDING_MANAGER,
      subtotal: 23000,
      totalDiscount: 4350,
      taxableAmount: 18650,
      taxAmount: 1280,
      netValue: 19930,
      grossMarginPercent: 32.5,
      riskScore: 7.8,
      riskLevel: 'HIGH',
      createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000), // 2 days ago
    },
  });

  await prisma.quoteLine.upsert({
    where: { id: 'qline-001-1' },
    update: {},
    create: {
      id: 'qline-001-1',
      quotationId: quote1.id,
      productId: seededProducts['prod-srv-001'].id, // Enterprise Server Pro
      quantity: 2,
      listPrice: 10000,
      unitPrice: 10000,
      proposedDiscountPercent: 18, // Exceeds Gold/Enterprise 15% threshold!
      discountAmount: 3600,
      taxRate: 0.08,
      taxAmount: 1312,
      netLinePrice: 16400,
      lineCost: 12000,
      lineMarginPercent: 26.83,
    },
  });

  await prisma.quoteLine.upsert({
    where: { id: 'qline-001-2' },
    update: {},
    create: {
      id: 'qline-001-2',
      quotationId: quote1.id,
      productId: seededProducts['prod-inst-001'].id, // Installation
      quantity: 1,
      listPrice: 3000,
      unitPrice: 3000,
      proposedDiscountPercent: 25, // Exceeds Services 10% threshold!
      discountAmount: 750,
      taxRate: 0.0,
      taxAmount: 0,
      netLinePrice: 2250,
      lineCost: 1200,
      lineMarginPercent: 46.67,
    },
  });

  // Approval Request for Hero 1
  const appReq1 = await prisma.approvalRequest.upsert({
    where: { id: 'appreq-demo-001' },
    update: { status: ApprovalRequestStatus.PENDING },
    create: {
      id: 'appreq-demo-001',
      quotationId: quote1.id,
      requestedById: salesRepBob.id,
      status: ApprovalRequestStatus.PENDING,
      riskScore: 7.8,
      riskLevel: 'HIGH',
      netTotal: 19930,
      marginAmount: 6480,
      marginPercentage: 32.5,
      violations: [
        { ruleId: 'rule-ent-001', description: 'Proposed discount 18% exceeds Enterprise Tier ceiling of 15%' },
        { ruleId: 'rule-srv-001', description: 'Proposed services discount 25% exceeds Services ceiling of 10%' },
      ],
      commercialSummary: {
        customerTier: 'ENTERPRISE',
        originalMargin: 42.0,
        discountedMargin: 32.5,
      },
      currentStepSequence: 1,
    },
  });

  await prisma.approvalStep.upsert({
    where: { id: 'appstep-001-1' },
    update: {},
    create: {
      id: 'appstep-001-1',
      approvalRequestId: appReq1.id,
      sequence: 1,
      requiredRole: Role.SALES_MANAGER,
      status: ApprovalStepStatus.PENDING,
    },
  });

  await prisma.approvalStep.upsert({
    where: { id: 'appstep-001-2' },
    update: {},
    create: {
      id: 'appstep-001-2',
      approvalRequestId: appReq1.id,
      sequence: 2,
      requiredRole: Role.FINANCE_OPERATIONS,
      status: ApprovalStepStatus.PENDING,
    },
  });

  // --- QUOTE 2 (Hero 2: Recommendation & Upsell Trigger) ---
  const quote2 = await prisma.quotation.upsert({
    where: { quoteNumber: 'QT-2026-0002' },
    update: {},
    create: {
      id: 'quote-demo-002',
      quoteNumber: 'QT-2026-0002',
      customerId: seededCustomers['cust-beta-002'].id,
      createdById: salesRepBob.id,
      status: QuoteStatus.DRAFT,
      subtotal: 10000,
      totalDiscount: 500,
      taxableAmount: 9500,
      taxAmount: 760,
      netValue: 10260,
      grossMarginPercent: 36.84,
      riskScore: 1.5,
      riskLevel: 'LOW',
      createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000),
    },
  });

  await prisma.quoteLine.upsert({
    where: { id: 'qline-002-1' },
    update: {},
    create: {
      id: 'qline-002-1',
      quotationId: quote2.id,
      productId: seededProducts['prod-srv-001'].id, // Enterprise Server Pro -> triggers UPS and Rack recommendations!
      quantity: 1,
      listPrice: 10000,
      unitPrice: 10000,
      proposedDiscountPercent: 5,
      discountAmount: 500,
      taxRate: 0.08,
      taxAmount: 760,
      netLinePrice: 9500,
      lineCost: 6000,
      lineMarginPercent: 36.84,
    },
  });

  // --- QUOTE 3 (Hero 3: Multi-Warehouse Split & Backorder) ---
  const quote3 = await prisma.quotation.upsert({
    where: { quoteNumber: 'QT-2026-0003' },
    update: { status: QuoteStatus.FULFILLMENT },
    create: {
      id: 'quote-demo-003',
      quoteNumber: 'QT-2026-0003',
      customerId: seededCustomers['cust-nova-003'].id,
      createdById: salesRepAlice.id,
      status: QuoteStatus.FULFILLMENT,
      subtotal: 350000,
      totalDiscount: 35000,
      taxableAmount: 315000,
      taxAmount: 25200,
      netValue: 340200,
      grossMarginPercent: 38.5,
      riskScore: 3.2,
      riskLevel: 'LOW',
      createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000),
    },
  });

  const qline3 = await prisma.quoteLine.upsert({
    where: { id: 'qline-003-1' },
    update: {},
    create: {
      id: 'qline-003-1',
      quotationId: quote3.id,
      productId: seededProducts['prod-srv-001'].id,
      quantity: 25, // Demand = 25 units -> WH-EAST has 15, WH-WEST has 10 (Multi-warehouse split!)
      listPrice: 10000,
      unitPrice: 10000,
      proposedDiscountPercent: 10,
      discountAmount: 25000,
      taxRate: 0.08,
      taxAmount: 18000,
      netLinePrice: 225000,
      lineCost: 150000,
      lineMarginPercent: 33.33,
    },
  });

  const qline3_ups = await prisma.quoteLine.upsert({
    where: { id: 'qline-003-2' },
    update: {},
    create: {
      id: 'qline-003-2',
      quotationId: quote3.id,
      productId: seededProducts['prod-ups-001'].id,
      quantity: 40, // Demand = 40 -> Total stock available = 30 (Backorder of 10!)
      listPrice: 2500,
      unitPrice: 2500,
      proposedDiscountPercent: 10,
      discountAmount: 10000,
      taxRate: 0.08,
      taxAmount: 7200,
      netLinePrice: 90000,
      lineCost: 56000,
      lineMarginPercent: 37.78,
    },
  });

  // Fulfillment allocations for Hero 3
  const alloc1 = await prisma.fulfillmentAllocation.upsert({
    where: { id: 'alloc-003-1' },
    update: {},
    create: {
      id: 'alloc-003-1',
      quotationId: quote3.id,
      quoteLineId: qline3.id,
      warehouseId: seededWarehouses['wh-east-001'].id,
      allocatedQuantity: 15,
      backorderedQuantity: 0,
      status: AllocationStatus.ALLOCATED,
      explanation: { reason: 'Primary warehouse allocation' },
    },
  });

  const alloc2 = await prisma.fulfillmentAllocation.upsert({
    where: { id: 'alloc-003-2' },
    update: {},
    create: {
      id: 'alloc-003-2',
      quotationId: quote3.id,
      quoteLineId: qline3.id,
      warehouseId: seededWarehouses['wh-west-002'].id,
      allocatedQuantity: 10,
      backorderedQuantity: 0,
      status: AllocationStatus.ALLOCATED,
      explanation: { reason: 'Secondary warehouse split allocation' },
    },
  });

  // Backorder record for Hero 3
  await prisma.backorder.upsert({
    where: { id: 'bo-003-1' },
    update: {},
    create: {
      id: 'bo-003-1',
      quotationId: quote3.id,
      quoteLineId: qline3_ups.id,
      productId: seededProducts['prod-ups-001'].id,
      requestedQuantity: 40,
      allocatedQuantity: 30,
      backorderedQuantity: 10,
      status: BackorderStatus.BACKORDERED,
      notes: 'Awaiting stock replenishment from manufacturer',
    },
  });

  // --- QUOTE 4 (Hero 4: Hybrid Billing - One Time + Recurring) ---
  const quote4 = await prisma.quotation.upsert({
    where: { quoteNumber: 'QT-2026-0004' },
    update: { status: QuoteStatus.BILLING },
    create: {
      id: 'quote-demo-004',
      quoteNumber: 'QT-2026-0004',
      customerId: seededCustomers['cust-vertex-004'].id,
      createdById: salesRepAlice.id,
      status: QuoteStatus.BILLING,
      subtotal: 46000,
      totalDiscount: 4600,
      taxableAmount: 41400,
      taxAmount: 1450,
      netValue: 42850,
      grossMarginPercent: 52.4,
      riskScore: 2.0,
      riskLevel: 'LOW',
      createdAt: new Date(Date.now() - 10 * 24 * 3600 * 1000),
    },
  });

  const qline4_1 = await prisma.quoteLine.upsert({
    where: { id: 'qline-004-1' },
    update: {},
    create: {
      id: 'qline-004-1',
      quotationId: quote4.id,
      productId: seededProducts['prod-str-001'].id, // One-Time SAN Storage Array ($15,000)
      quantity: 1,
      listPrice: 15000,
      unitPrice: 15000,
      proposedDiscountPercent: 10,
      discountAmount: 1500,
      taxRate: 0.08,
      taxAmount: 1080,
      netLinePrice: 13500,
      lineCost: 10500,
      lineMarginPercent: 22.22,
    },
  });

  const qline4_2 = await prisma.quoteLine.upsert({
    where: { id: 'qline-004-2' },
    update: {},
    create: {
      id: 'qline-004-2',
      quotationId: quote4.id,
      productId: seededProducts['prod-sec-001'].id, // Recurring Annual Security Suite ($5,000 x 5 = $25,000)
      quantity: 5,
      listPrice: 5000,
      unitPrice: 5000,
      proposedDiscountPercent: 10,
      discountAmount: 2500,
      taxRate: 0.05,
      taxAmount: 1125,
      netLinePrice: 22500,
      lineCost: 7500,
      lineMarginPercent: 66.67,
    },
  });

  const qline4_3 = await prisma.quoteLine.upsert({
    where: { id: 'qline-004-3' },
    update: {},
    create: {
      id: 'qline-004-3',
      quotationId: quote4.id,
      productId: seededProducts['prod-supp-001'].id, // Recurring Monthly Support ($6,000)
      quantity: 1,
      listPrice: 6000,
      unitPrice: 6000,
      proposedDiscountPercent: 10,
      discountAmount: 600,
      taxRate: 0.0,
      taxAmount: 0,
      netLinePrice: 5400,
      lineCost: 2400,
      lineMarginPercent: 55.56,
    },
  });

  // Billing Schedule & Lines for Hero 4
  const bsch4 = await prisma.billingSchedule.upsert({
    where: { quotationId: quote4.id },
    update: {},
    create: {
      id: 'bsch-demo-004',
      quotationId: quote4.id,
      totalOneTimeAmount: 13500,
      totalRecurringMonthly: 5400,
      totalRecurringAnnual: 22500,
      billingStartDate: new Date(Date.now() - 10 * 24 * 3600 * 1000),
      status: BillingScheduleStatus.ACTIVE,
    },
  });

  await prisma.billingLine.upsert({
    where: { id: 'bline-004-1' },
    update: {},
    create: {
      id: 'bline-004-1',
      billingScheduleId: bsch4.id,
      quoteLineId: qline4_1.id,
      productName: 'High-Perf SAN Storage Array',
      billingType: BillingType.ONE_TIME,
      billingDate: new Date(Date.now() - 10 * 24 * 3600 * 1000),
      amount: 13500,
      status: BillingScheduleStatus.COMPLETED,
    },
  });

  await prisma.billingLine.upsert({
    where: { id: 'bline-004-2' },
    update: {},
    create: {
      id: 'bline-004-2',
      billingScheduleId: bsch4.id,
      quoteLineId: qline4_2.id,
      productName: 'Enterprise Cloud Security Suite',
      billingType: BillingType.RECURRING,
      recurringPeriod: RecurringPeriod.ANNUAL,
      billingDate: new Date(Date.now() - 10 * 24 * 3600 * 1000),
      amount: 22500,
      isProrated: false,
      status: BillingScheduleStatus.COMPLETED,
    },
  });

  await prisma.billingLine.upsert({
    where: { id: 'bline-004-3' },
    update: {},
    create: {
      id: 'bline-004-3',
      billingScheduleId: bsch4.id,
      quoteLineId: qline4_3.id,
      productName: '24/7 Enterprise Premium Support',
      billingType: BillingType.RECURRING,
      recurringPeriod: RecurringPeriod.MONTHLY,
      billingDate: new Date(Date.now() + 20 * 24 * 3600 * 1000),
      amount: 5400,
      isProrated: true,
      proratedDays: 15,
      status: BillingScheduleStatus.PENDING,
    },
  });

  // --- QUOTE 5 (Hero 5: Customer Portal Negotiation & Re-approval) ---
  const quote5 = await prisma.quotation.upsert({
    where: { quoteNumber: 'QT-2026-0005' },
    update: { status: QuoteStatus.NEGOTIATING },
    create: {
      id: 'quote-demo-005',
      quoteNumber: 'QT-2026-0005',
      customerId: seededCustomers['cust-orion-005'].id,
      createdById: salesRepCharlie.id,
      status: QuoteStatus.NEGOTIATING,
      subtotal: 18000,
      totalDiscount: 900,
      taxableAmount: 17100,
      taxAmount: 1368,
      netValue: 18468,
      grossMarginPercent: 44.44,
      riskScore: 3.5,
      riskLevel: 'MEDIUM',
      createdAt: new Date(Date.now() - 4 * 24 * 3600 * 1000),
    },
  });

  await prisma.quoteLine.upsert({
    where: { id: 'qline-005-1' },
    update: {},
    create: {
      id: 'qline-005-1',
      quotationId: quote5.id,
      productId: seededProducts['prod-sw-001'].id,
      quantity: 4,
      listPrice: 4500,
      unitPrice: 4500,
      proposedDiscountPercent: 5,
      discountAmount: 900,
      taxRate: 0.08,
      taxAmount: 1368,
      netLinePrice: 17100,
      lineCost: 10800,
      lineMarginPercent: 36.84,
    },
  });

  // Portal token & Counter offer for Hero 5
  await prisma.portalToken.upsert({
    where: { token: 'portal-token-demo-005' },
    update: {},
    create: {
      id: 'ptoken-demo-005',
      token: 'portal-token-demo-005',
      quotationId: quote5.id,
      expiresAt: new Date(Date.now() + 14 * 24 * 3600 * 1000),
      isRevoked: false,
    },
  });

  await prisma.counterOffer.upsert({
    where: { id: 'counter-demo-005' },
    update: { status: CounterOfferStatus.SUBMITTED },
    create: {
      id: 'counter-demo-005',
      quotationId: quote5.id,
      proposedDiscountPercent: 18.0, // Customer counter-offers 18%!
      customerNotes: 'We need an 18% discount to match competitive quote from vendor X.',
      status: CounterOfferStatus.SUBMITTED,
    },
  });

  // --- QUOTE 6 (Draft State - Apex Retail) ---
  await prisma.quotation.upsert({
    where: { quoteNumber: 'QT-2026-0006' },
    update: {},
    create: {
      id: 'quote-demo-006',
      quoteNumber: 'QT-2026-0006',
      customerId: seededCustomers['cust-apex-006'].id,
      createdById: salesRepCharlie.id,
      status: QuoteStatus.DRAFT,
      subtotal: 12500,
      totalDiscount: 625,
      taxableAmount: 11875,
      taxAmount: 950,
      netValue: 12825,
      grossMarginPercent: 41.2,
      riskScore: 1.2,
      riskLevel: 'LOW',
      createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000),
    },
  });

  // --- QUOTE 7 (Approved State - Quantum Ed) ---
  const quote7 = await prisma.quotation.upsert({
    where: { quoteNumber: 'QT-2026-0007' },
    update: { status: QuoteStatus.APPROVED },
    create: {
      id: 'quote-demo-007',
      quoteNumber: 'QT-2026-0007',
      customerId: seededCustomers['cust-quantum-007'].id,
      createdById: salesRepBob.id,
      status: QuoteStatus.APPROVED,
      subtotal: 25000,
      totalDiscount: 2500,
      taxableAmount: 22500,
      taxAmount: 1800,
      netValue: 24300,
      grossMarginPercent: 40.0,
      riskScore: 2.5,
      riskLevel: 'LOW',
      createdAt: new Date(Date.now() - 6 * 24 * 3600 * 1000),
    },
  });

  // --- QUOTE 8 (Sent to Customer - BluePeak Logistics) ---
  const quote8 = await prisma.quotation.upsert({
    where: { quoteNumber: 'QT-2026-0008' },
    update: { status: QuoteStatus.NEGOTIATING },
    create: {
      id: 'quote-demo-008',
      quoteNumber: 'QT-2026-0008',
      customerId: seededCustomers['cust-bluepeak-008'].id,
      createdById: salesRepAlice.id,
      status: QuoteStatus.NEGOTIATING,
      subtotal: 8000,
      totalDiscount: 400,
      taxableAmount: 7600,
      taxAmount: 608,
      netValue: 8208,
      grossMarginPercent: 35.0,
      riskScore: 1.8,
      riskLevel: 'LOW',
      createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000),
    },
  });

  // --- QUOTE 9 (Completed State - GreenGrid Energy) ---
  const quote9 = await prisma.quotation.upsert({
    where: { quoteNumber: 'QT-2026-0009' },
    update: { status: QuoteStatus.COMPLETED },
    create: {
      id: 'quote-demo-009',
      quoteNumber: 'QT-2026-0009',
      customerId: seededCustomers['cust-greengrid-009'].id,
      createdById: salesRepCharlie.id,
      status: QuoteStatus.COMPLETED,
      subtotal: 50000,
      totalDiscount: 5000,
      taxableAmount: 45000,
      taxAmount: 3600,
      netValue: 48600,
      grossMarginPercent: 42.0,
      riskScore: 1.0,
      riskLevel: 'LOW',
      createdAt: new Date(Date.now() - 15 * 24 * 3600 * 1000),
    },
  });

  const qline9 = await prisma.quoteLine.upsert({
    where: { id: 'qline-009-1' },
    update: {},
    create: {
      id: 'qline-009-1',
      quotationId: quote9.id,
      productId: seededProducts['prod-srv-001'].id,
      quantity: 5,
      listPrice: 10000,
      unitPrice: 10000,
      proposedDiscountPercent: 10,
      discountAmount: 5000,
      taxRate: 0.08,
      taxAmount: 3600,
      netLinePrice: 45000,
      lineCost: 30000,
      lineMarginPercent: 33.33,
    },
  });

  // --- QUOTE 10 (Hero 6: Stalled Deal & Anomaly Deal Health Alerts) ---
  const quote10 = await prisma.quotation.upsert({
    where: { quoteNumber: 'QT-2026-0010' },
    update: { status: QuoteStatus.PENDING_MANAGER },
    create: {
      id: 'quote-demo-010',
      quoteNumber: 'QT-2026-0010',
      customerId: seededCustomers['cust-stellar-010'].id,
      createdById: salesRepBob.id,
      status: QuoteStatus.PENDING_MANAGER,
      subtotal: 60000,
      totalDiscount: 15000, // 25% discount anomaly!
      taxableAmount: 45000,
      taxAmount: 3600,
      netValue: 48600,
      grossMarginPercent: 20.0,
      riskScore: 8.9,
      riskLevel: 'CRITICAL',
      createdAt: new Date(Date.now() - 25 * 24 * 3600 * 1000), // Stalled 25 days ago!
    },
  });

  // ==========================================
  // 9. INVOICES & PAYMENTS (Connected to Quote 4 & Quote 9)
  // ==========================================
  console.log('🧾 Seeding Invoices & Payment Ledger...');

  const inv4 = await prisma.invoice.upsert({
    where: { quotationId: quote4.id },
    update: {},
    create: {
      id: 'inv-demo-004',
      invoiceNumber: 'INV-2026-0004',
      quotationId: quote4.id,
      customerId: seededCustomers['cust-vertex-004'].id,
      customerName: 'Vertex Financial Services',
      customerEmail: 'procurement@vertexfin.com',
      customerPhone: '+1-555-0104',
      customerTier: CustomerTier.GOLD,
      customerRegion: 'US-East',
      status: InvoiceStatus.ISSUED,
      issueDate: new Date(Date.now() - 5 * 24 * 3600 * 1000),
      dueDate: new Date(Date.now() + 25 * 24 * 3600 * 1000),
      subtotal: 46000,
      totalDiscount: 4600,
      taxableAmount: 41400,
      taxAmount: 1450,
      totalAmount: 42850,
      notes: 'Initial billing invoice for SAN Storage and Annual Security Suite.',
      createdById: salesRepAlice.id,
    },
  });

  await prisma.invoiceLine.upsert({
    where: { id: 'invline-004-1' },
    update: {},
    create: {
      id: 'invline-004-1',
      invoiceId: inv4.id,
      productId: seededProducts['prod-str-001'].id,
      productName: 'High-Perf SAN Storage Array',
      productSku: 'SKU-STR-SAN',
      quantity: 1,
      listPrice: 15000,
      unitPrice: 15000,
      proposedDiscountPercent: 10,
      discountAmount: 1500,
      taxRate: 0.08,
      taxAmount: 1080,
      taxableAmount: 13500,
      lineTotal: 14580,
    },
  });

  const inv9 = await prisma.invoice.upsert({
    where: { quotationId: quote9.id },
    update: { status: InvoiceStatus.PAID },
    create: {
      id: 'inv-demo-009',
      invoiceNumber: 'INV-2026-0009',
      quotationId: quote9.id,
      customerId: seededCustomers['cust-greengrid-009'].id,
      customerName: 'GreenGrid Energy Corp',
      customerEmail: 'systems@greengrid.com',
      customerPhone: '+1-555-0109',
      customerTier: CustomerTier.BRONZE,
      customerRegion: 'US-East',
      status: InvoiceStatus.PAID,
      issueDate: new Date(Date.now() - 14 * 24 * 3600 * 1000),
      dueDate: new Date(Date.now() - 2 * 24 * 3600 * 1000),
      subtotal: 50000,
      totalDiscount: 5000,
      taxableAmount: 45000,
      taxAmount: 3600,
      totalAmount: 48600,
      notes: 'Paid in full via ACH wire transfer.',
      createdById: salesRepCharlie.id,
    },
  });

  await prisma.payment.upsert({
    where: { id: 'pmt-demo-009' },
    update: {},
    create: {
      id: 'pmt-demo-009',
      invoiceId: inv9.id,
      amount: 48600,
      method: 'ACH Wire Transfer',
      reference: 'WIRE-REF-99201',
      status: PaymentStatus.COMPLETED,
      recordedById: seededUsers['finance@dealflow360.com'].id,
      createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000),
    },
  });

  // ==========================================
  // 10. DEAL HEALTH ALERTS
  // ==========================================
  console.log('🚨 Seeding Deal Health Operational Alerts...');

  await prisma.dealAlert.upsert({
    where: { id: 'alert-demo-010-1' },
    update: {},
    create: {
      id: 'alert-demo-010-1',
      quotationId: quote10.id,
      alertType: 'STALLED_DEAL',
      severity: 'WARNING',
      message: 'Quotation QT-2026-0010 has remained in PENDING_MANAGER status for over 25 days.',
      isResolved: false,
    },
  });

  await prisma.dealAlert.upsert({
    where: { id: 'alert-demo-010-2' },
    update: {},
    create: {
      id: 'alert-demo-010-2',
      quotationId: quote10.id,
      alertType: 'DISCOUNT_ANOMALY',
      severity: 'HIGH',
      message: 'Unusually high discount of 25.0% detected on QT-2026-0010 (historical average is 8.5%).',
      isResolved: false,
    },
  });

  await prisma.dealAlert.upsert({
    where: { id: 'alert-demo-003-1' },
    update: {},
    create: {
      id: 'alert-demo-003-1',
      quotationId: quote3.id,
      alertType: 'DELIVERY_SLIPPAGE',
      severity: 'HIGH',
      message: 'Smart UPS Power Backup line item has 10 backordered units delaying order completion.',
      isResolved: false,
    },
  });

  // ==========================================
  // 11. AUDIT LOG LEDGER
  // ==========================================
  console.log('📊 Seeding Audit Trail Ledger...');

  const auditEvents = [
    {
      id: 'audit-001',
      eventType: 'QUOTE_CREATED',
      action: 'Create Quotation',
      entityType: 'Quotation',
      entityId: quote1.id,
      actorId: salesRepBob.id,
      actorName: salesRepBob.name,
      actorRole: Role.SALES_REP,
      metadata: { quoteNumber: 'QT-2026-0001', status: 'DRAFT' },
    },
    {
      id: 'audit-002',
      eventType: 'DISCOUNT_UPDATED',
      action: 'Update Line Discounts',
      entityType: 'Quotation',
      entityId: quote1.id,
      actorId: salesRepBob.id,
      actorName: salesRepBob.name,
      actorRole: Role.SALES_REP,
      metadata: { proposedDiscountPercent: 18.0 },
    },
    {
      id: 'audit-003',
      eventType: 'QUOTE_SUBMITTED',
      action: 'Submit Quote for Governance Approval',
      entityType: 'Quotation',
      entityId: quote1.id,
      actorId: salesRepBob.id,
      actorName: salesRepBob.name,
      actorRole: Role.SALES_REP,
      metadata: { status: 'PENDING_MANAGER', riskScore: 7.8 },
    },
    {
      id: 'audit-004',
      eventType: 'COUNTEROFFER_SUBMITTED',
      action: 'Submit Customer Counter-Offer',
      entityType: 'CounterOffer',
      entityId: 'counter-demo-005',
      actorId: seededUsers['customer.nova@dealflow360.com']?.id || salesRepCharlie.id,
      actorName: 'Acme Procurement',
      actorRole: Role.CUSTOMER,
      metadata: { proposedDiscountPercent: 18.0, quoteNumber: 'QT-2026-0005' },
    },
    {
      id: 'audit-005',
      eventType: 'FULFILLMENT_ALLOCATED',
      action: 'Allocate Warehouse Stock',
      entityType: 'FulfillmentAllocation',
      entityId: alloc1.id,
      actorId: seededUsers['admin@dealflow360.com'].id,
      actorName: 'System Admin',
      actorRole: Role.ADMIN,
      metadata: { allocatedQuantity: 15, warehouseCode: 'WH-EAST' },
    },
    {
      id: 'audit-006',
      eventType: 'INVOICE_GENERATED',
      action: 'Issue Commercial Invoice',
      entityType: 'Invoice',
      entityId: inv4.id,
      actorId: salesRepAlice.id,
      actorName: salesRepAlice.name,
      actorRole: Role.SALES_REP,
      metadata: { invoiceNumber: 'INV-2026-0004', totalAmount: 42850 },
    },
  ];

  for (const log of auditEvents) {
    await prisma.auditLog.upsert({
      where: { id: log.id },
      update: log,
      create: log,
    });
  }

  console.log('✅ Connected Demo Seed Data Population Complete!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
