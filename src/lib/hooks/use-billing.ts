import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { billingApi } from '@/lib/api/billing';

export function useCreditSummary() {
  return useQuery({
    queryKey: ['billing', 'credits'],
    queryFn: billingApi.getCredits,
    staleTime: 30_000,
  });
}

export function useCreditPacks() {
  return useQuery({
    queryKey: ['billing', 'packs'],
    queryFn: billingApi.getCreditPacks,
    staleTime: 60_000,
  });
}

export function useBillingPeriods() {
  return useQuery({
    queryKey: ['billing', 'periods'],
    queryFn: billingApi.getBillingPeriods,
    staleTime: 60_000,
  });
}

export function usePurchaseCredits() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (packSize: number) => billingApi.purchaseCredits(packSize),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['billing'] });
      qc.invalidateQueries({ queryKey: ['me'] });
    },
  });
}
