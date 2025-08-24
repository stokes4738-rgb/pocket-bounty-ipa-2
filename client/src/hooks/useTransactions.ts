import { useQuery } from "@tanstack/react-query";
import { useDemo } from "@/contexts/DemoContext";

export function useTransactions() {
  const { isDemoMode, demoTransactions } = useDemo();
  
  const { data: realTransactions = [], isLoading } = useQuery({
    queryKey: ["/api/user/transactions"],
    retry: false,
    enabled: !isDemoMode,
  });

  return {
    transactions: isDemoMode ? demoTransactions : realTransactions,
    isLoading: isDemoMode ? false : isLoading,
  };
}