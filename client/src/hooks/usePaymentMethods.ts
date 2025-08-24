import { useQuery } from "@tanstack/react-query";
import { useDemo } from "@/contexts/DemoContext";

export function usePaymentMethods() {
  const { isDemoMode, demoPaymentMethods } = useDemo();
  
  const { data: realPaymentMethods = [], isLoading } = useQuery({
    queryKey: ["/api/payments/methods"],
    retry: false,
    enabled: !isDemoMode,
  });

  return {
    paymentMethods: isDemoMode ? demoPaymentMethods : realPaymentMethods,
    isLoading: isDemoMode ? false : isLoading,
  };
}