import type { OperatorReview } from '../types'

/** No ㉕-7 policy has been implemented. Missing policy never grants approval. */
export function unresolvedOperatorReview(policyId: string): OperatorReview {
  return { policyId, operatorApprovalRequired: 'unresolved', status: 'blocked', reasonCodes: ['REVIEW_POLICY_UNMAPPED'] }
}
