import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { generateAccessToken } from '../auth/token.js';

vi.mock('@dealflow360/db', () => {
  const approvalRequestsMap = new Map<string, any>();
  const approvalStepsMap = new Map<string, any>();
  const usersMap = new Map<string, any>();

  usersMap.set('usr-rep-1', { id: 'usr-rep-1', name: 'Alice Rep', role: 'SALES_REP' });
  usersMap.set('usr-mgr-1', { id: 'usr-mgr-1', name: 'Bob Manager', role: 'SALES_MANAGER' });
  usersMap.set('usr-fin-1', { id: 'usr-fin-1', name: 'Carol Finance', role: 'FINANCE_OPERATIONS' });
  usersMap.set('usr-adm-1', { id: 'usr-adm-1', name: 'David Admin', role: 'ADMIN' });

  return {
    Role: {
      ADMIN: 'ADMIN',
      SALES_MANAGER: 'SALES_MANAGER',
      SALES_REP: 'SALES_REP',
      FINANCE_OPERATIONS: 'FINANCE_OPERATIONS',
      CUSTOMER: 'CUSTOMER',
    },
    db: {
      $transaction: vi.fn(async (callback: (tx: any) => Promise<any>) => {
        return callback({
          user: {
            findUnique: vi.fn(async ({ where }: { where: { id: string } }) => usersMap.get(where.id) || { id: where.id, name: 'Test User', role: 'SALES_REP' }),
          },
          approvalRequest: {
            findUnique: vi.fn(async ({ where }: { where: { id: string } }) => {
              const req = approvalRequestsMap.get(where.id);
              if (!req) return null;
              const steps = Array.from(approvalStepsMap.values()).filter((s) => s.approvalRequestId === where.id);
              return { ...req, steps };
            }),
            update: vi.fn(async ({ where, data }: { where: { id: string }; data: any }) => {
              const existing = approvalRequestsMap.get(where.id);
              if (!existing) return null;
              const updated = { ...existing, ...data, updatedAt: new Date() };
              approvalRequestsMap.set(where.id, updated);
              return updated;
            }),
            updateMany: vi.fn(async () => ({ count: 0 })),
            findMany: vi.fn(async () => []),
            create: vi.fn(async ({ data }: { data: any }) => {
              const id = data.id || `appreq-${Date.now()}`;
              const steps = Array.isArray(data.steps?.create)
                ? data.steps.create.map((s: any, idx: number) => ({
                    id: `step-${id}-${idx + 1}`,
                    approvalRequestId: id,
                    sequence: s.sequence || idx + 1,
                    requiredRole: s.requiredRole,
                    status: s.status || 'PENDING',
                    actedById: null,
                    actedBy: null,
                    actedAt: null,
                    comments: null,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                  }))
                : [];
              steps.forEach((st: any) => approvalStepsMap.set(st.id, st));
              const record = { ...data, id, steps, currentStepSequence: data.currentStepSequence ?? 1, createdAt: new Date(), updatedAt: new Date() };
              approvalRequestsMap.set(id, record);
              return record;
            }),
          },
          approvalStep: {
            updateMany: vi.fn(async ({ where, data }: { where: { id: string }; data: any }) => {
              const existing = approvalStepsMap.get(where.id);
              if (existing) {
                const updated = { ...existing, ...data, updatedAt: new Date() };
                approvalStepsMap.set(where.id, updated);
                const req = approvalRequestsMap.get(existing.approvalRequestId);
                if (req && Array.isArray(req.steps)) {
                  const stepIdx = req.steps.findIndex((s: any) => s.id === where.id);
                  if (stepIdx !== -1) req.steps[stepIdx] = updated;
                }
              }
              return { count: 1 };
            }),
            findMany: vi.fn(async ({ where }: { where: { approvalRequestId: string } }) =>
              Array.from(approvalStepsMap.values()).filter((s) => s.approvalRequestId === where.approvalRequestId)
            ),
            findUnique: vi.fn(async ({ where }: { where: { id: string } }) => approvalStepsMap.get(where.id) || null),
            update: vi.fn(async ({ where, data }: { where: { id: string }; data: any }) => {
              const existing = approvalStepsMap.get(where.id);
              if (!existing) return null;
              const actedBy = usersMap.get(data.actedById) || null;
              const updated = { ...existing, ...data, actedBy, updatedAt: new Date() };
              approvalStepsMap.set(where.id, updated);

              // Update step in request parent as well
              const req = approvalRequestsMap.get(existing.approvalRequestId);
              if (req) {
                const stepIdx = req.steps.findIndex((s: any) => s.id === where.id);
                if (stepIdx !== -1) {
                  req.steps[stepIdx] = updated;
                }
              }
              return updated;
            }),
          },
          quotation: {
            findUnique: vi.fn(async () => ({ id: 'q-1', status: 'DRAFT' })),
            update: vi.fn(async () => ({})),
            updateMany: vi.fn(async () => ({ count: 0 })),
            findMany: vi.fn(async () => []),
          },
        });
      }),
      user: {
        findUnique: vi.fn(async ({ where }: { where: { id: string } }) => usersMap.get(where.id) || null),
      },
      quotation: {
        findUnique: vi.fn(async () => null),
        update: vi.fn(async () => ({})),
      },
      approvalRequest: {
        create: vi.fn(async ({ data }: { data: any }) => {
          const reqId = `appreq-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
          const steps: any[] = [];
          if (data.steps && data.steps.create) {
            data.steps.create.forEach((stepInput: any, idx: number) => {
              const stepId = `step-${reqId}-${idx + 1}`;
              const newStep = {
                id: stepId,
                approvalRequestId: reqId,
                sequence: stepInput.sequence,
                requiredRole: stepInput.requiredRole,
                status: stepInput.status,
                actedById: null,
                actedBy: null,
                actedAt: null,
                comments: null,
                createdAt: new Date(),
                updatedAt: new Date(),
              };
              approvalStepsMap.set(stepId, newStep);
              steps.push(newStep);
            });
          }

          const requestedBy = usersMap.get(data.requestedById) || null;
          const newRequest = {
            id: reqId,
            quotationId: data.quotationId || null,
            quotation: null,
            requestedById: data.requestedById,
            requestedBy,
            status: data.status,
            riskScore: data.riskScore,
            riskLevel: data.riskLevel,
            netTotal: data.netTotal,
            marginAmount: data.marginAmount,
            marginPercentage: data.marginPercentage,
            violations: data.violations || [],
            commercialSummary: data.commercialSummary || null,
            currentStepSequence: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
            steps,
          };
          approvalRequestsMap.set(reqId, newRequest);
          return newRequest;
        }),
        findUnique: vi.fn(async ({ where }: { where: { id: string } }) => approvalRequestsMap.get(where.id) || null),
        findFirst: vi.fn(async () => null),
        findMany: vi.fn(async ({ where }: { where?: any } = {}) => {
          let list = Array.from(approvalRequestsMap.values());
          if (where && where.status) {
            list = list.filter((r) => r.status === where.status);
          }
          return list;
        }),
        count: vi.fn(async () => approvalRequestsMap.size),
        update: vi.fn(async ({ where, data }: { where: { id: string }; data: any }) => {
          const existing = approvalRequestsMap.get(where.id);
          if (!existing) return null;
          const updated = { ...existing, ...data, updatedAt: new Date() };
          approvalRequestsMap.set(where.id, updated);
          return updated;
        }),
      },
      approvalStep: {
        updateMany: vi.fn(async () => ({ count: 0 })),
        update: vi.fn(async ({ where, data }: { where: { id: string }; data: any }) => {
          const existing = approvalStepsMap.get(where.id);
          if (!existing) return null;
          const updated = { ...existing, ...data, updatedAt: new Date() };
          approvalStepsMap.set(where.id, updated);
          return updated;
        }),
      },
    },
  };
});

describe('Module A4: Approval Workflow Engine & Approval Inbox API', () => {
  let adminToken: string;
  let salesManagerToken: string;
  let financeToken: string;
  let salesRepToken: string;

  beforeEach(() => {
    adminToken = generateAccessToken({ sub: 'usr-adm-1', email: 'admin@dealflow.com', role: 'ADMIN' });
    salesManagerToken = generateAccessToken({ sub: 'usr-mgr-1', email: 'mgr@dealflow.com', role: 'SALES_MANAGER' });
    financeToken = generateAccessToken({ sub: 'usr-fin-1', email: 'fin@dealflow.com', role: 'FINANCE_OPERATIONS' });
    salesRepToken = generateAccessToken({ sub: 'usr-rep-1', email: 'rep@dealflow.com', role: 'SALES_REP' });
  });

  it('POST /api/v1/approvals creates approval request with sequential steps', async () => {
    const res = await request(app)
      .post('/api/v1/approvals')
      .set('Authorization', `Bearer ${salesRepToken}`)
      .send({
        evaluation: {
          netTotal: 150000,
          marginAmount: 15000,
          marginPercentage: 10.0,
          riskScore: 7.5,
          riskLevel: 'HIGH',
          violations: [
            {
              ruleName: 'Min Margin Requirement',
              violatedField: 'MIN_MARGIN',
              allowedValue: 20.0,
              proposedValue: 10.0,
              severity: 'VIOLATION',
              message: 'Margin below threshold',
            },
          ],
          requiredApprovalRoles: ['SALES_MANAGER', 'FINANCE_OPERATIONS'],
          requiresApproval: true,
          evaluatedAt: new Date().toISOString(),
        },
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('PENDING');
    expect(res.body.data.steps).toHaveLength(2);
    expect(res.body.data.steps[0].requiredRole).toBe('SALES_MANAGER');
    expect(res.body.data.steps[1].requiredRole).toBe('FINANCE_OPERATIONS');
  });

  it('GET /api/v1/approvals lists pending approval requests for inbox', async () => {
    const res = await request(app)
      .get('/api/v1/approvals?status=PENDING')
      .set('Authorization', `Bearer ${salesManagerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('Progresses multi-step approval: Step 1 (Sales Manager) -> Step 2 (Finance) -> APPROVED', async () => {
    // 1. Create Request
    const createRes = await request(app)
      .post('/api/v1/approvals')
      .set('Authorization', `Bearer ${salesRepToken}`)
      .send({
        evaluation: {
          netTotal: 120000,
          marginAmount: 12000,
          marginPercentage: 10.0,
          riskScore: 7.0,
          riskLevel: 'HIGH',
          violations: [],
          requiredApprovalRoles: ['SALES_MANAGER', 'FINANCE_OPERATIONS'],
          requiresApproval: true,
          evaluatedAt: new Date().toISOString(),
        },
      });

    const reqId = createRes.body.data.id;

    // 2. Step 1: Sales Manager Approves
    const approve1Res = await request(app)
      .post(`/api/v1/approvals/${reqId}/approve`)
      .set('Authorization', `Bearer ${salesManagerToken}`)
      .send({ comments: 'Approved by Sales Manager' });

    expect(approve1Res.status).toBe(200);
    expect(approve1Res.body.data.status).toBe('PENDING');
    expect(approve1Res.body.data.currentStepSequence).toBe(2);
    expect(approve1Res.body.data.steps[0].status).toBe('APPROVED');

    // 3. Step 2: Finance Operations Approves
    const approve2Res = await request(app)
      .post(`/api/v1/approvals/${reqId}/approve`)
      .set('Authorization', `Bearer ${financeToken}`)
      .send({ comments: 'Approved by Finance Operations' });

    expect(approve2Res.status).toBe(200);
    expect(approve2Res.body.data.status).toBe('APPROVED');
    expect(approve2Res.body.data.steps[1].status).toBe('APPROVED');
  });

  it('Rejects approval step with required rejection reason', async () => {
    // 1. Create Request
    const createRes = await request(app)
      .post('/api/v1/approvals')
      .set('Authorization', `Bearer ${salesRepToken}`)
      .send({
        evaluation: {
          netTotal: 80000,
          marginAmount: 4000,
          marginPercentage: 5.0,
          riskScore: 8.5,
          riskLevel: 'HIGH',
          violations: [],
          requiredApprovalRoles: ['SALES_MANAGER'],
          requiresApproval: true,
          evaluatedAt: new Date().toISOString(),
        },
      });

    const reqId = createRes.body.data.id;

    // 2. Reject request
    const rejectRes = await request(app)
      .post(`/api/v1/approvals/${reqId}/reject`)
      .set('Authorization', `Bearer ${salesManagerToken}`)
      .send({ reason: 'Margin of 5% is unacceptable.' });

    expect(rejectRes.status).toBe(200);
    expect(rejectRes.body.data.status).toBe('REJECTED');
    expect(rejectRes.body.data.steps[0].status).toBe('REJECTED');
    expect(rejectRes.body.data.steps[0].comments).toBe('Margin of 5% is unacceptable.');
  });

  it('Forbids Sales Rep from taking approval actions (403 Forbidden)', async () => {
    const createRes = await request(app)
      .post('/api/v1/approvals')
      .set('Authorization', `Bearer ${salesRepToken}`)
      .send({
        evaluation: {
          netTotal: 50000,
          marginAmount: 5000,
          marginPercentage: 10.0,
          riskScore: 4.0,
          riskLevel: 'MEDIUM',
          violations: [],
          requiredApprovalRoles: ['SALES_MANAGER'],
          requiresApproval: true,
          evaluatedAt: new Date().toISOString(),
        },
      });

    const reqId = createRes.body.data.id;

    const actionRes = await request(app)
      .post(`/api/v1/approvals/${reqId}/approve`)
      .set('Authorization', `Bearer ${salesRepToken}`)
      .send({});

    expect(actionRes.status).toBe(403);
  });
});
