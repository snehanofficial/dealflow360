import { z } from 'zod';

export const ApprovalDecisionSchema = z.object({
  comments: z.string().optional(),
});

export type ApprovalDecision = z.infer<typeof ApprovalDecisionSchema>;
