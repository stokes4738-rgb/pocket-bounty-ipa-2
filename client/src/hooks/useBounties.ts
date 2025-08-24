import { useQuery } from "@tanstack/react-query";
import { useDemo } from "@/contexts/DemoContext";

export function useBounties() {
  const { isDemoMode, demoBounties } = useDemo();
  
  const { data: realBounties = [], isLoading } = useQuery({
    queryKey: ["/api/bounties"],
    retry: false,
    enabled: !isDemoMode,
  });

  return {
    bounties: isDemoMode ? demoBounties : realBounties,
    isLoading: isDemoMode ? false : isLoading,
  };
}