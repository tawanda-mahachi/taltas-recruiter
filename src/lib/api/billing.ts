import api from './client';
import type { CreditPack, BillingPeriod, CreditSummary, PaginatedResponse } from '@/types/api';

export const billingApi = {
  getCredits: () =>
    api.get<CreditSummary>('/principals/me/credits').then((r) => r.data),

  purchaseCredits: (packSize: number) =>
    api.post<CreditPack>('/billing/credits/purchase', { packSize }).then((r) => r.data),

  getCreditPacks: () =>
    api.get<PaginatedResponse<CreditPack>>('/billing/credits').then((r) => r.data),

  getBillingPeriods: () =>
    api.get<PaginatedResponse<BillingPeriod>>('/billing/periods').then((r) => r.data),
};
