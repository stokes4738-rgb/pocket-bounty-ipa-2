import { useQuery } from "@tanstack/react-query";
import { useDemo } from "@/contexts/DemoContext";
import type { PaymentMethod } from "@shared/schema";

export function usePaymentMethods() {
  const { isDemoMode, demoPaymentMethods } = useDemo();
  
  const { data: realPaymentMethods = [], isLoading, isError, refetch } = useQuery<PaymentMethod[]>({
    queryKey: ["/api/payments/methods"],
    retry: 1,
    enabled: !isDemoMode,
    staleTime: 5 * 60 * 1000 // Consider data fresh for 5 minutes
  });

  return {
    paymentMethods: (isDemoMode ? demoPaymentMethods : realPaymentMethods) as PaymentMethod[],
    isLoading: isDemoMode ? false : isLoading,
    isError: isDemoMode ? false : isError,
    refetch,
  };
}