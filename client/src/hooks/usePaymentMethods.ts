import { useQuery } from "@tanstack/react-query";
import { useDemo } from "@/contexts/DemoContext";
import type { PaymentMethod } from "@shared/schema";

export function usePaymentMethods() {
  const { isDemoMode, demoPaymentMethods } = useDemo();
  
  const { data: realPaymentMethods = [], isLoading } = useQuery<PaymentMethod[]>({
    queryKey: ["/api/payments/methods"],
    retry: false,
    enabled: !isDemoMode,
  });

  return {
    paymentMethods: (isDemoMode ? demoPaymentMethods : realPaymentMethods) as PaymentMethod[],
    isLoading: isDemoMode ? false : isLoading,
  };
}