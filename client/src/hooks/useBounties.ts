import { useQuery } from "@tanstack/react-query";
import { useDemo } from "@/contexts/DemoContext";
import type { Bounty } from "@shared/schema";

export function useBounties() {
  const { isDemoMode, demoBounties } = useDemo();
  
  const { data: realBounties = [], isLoading } = useQuery<Bounty[]>({
    queryKey: ["/api/bounties"],
    retry: false,
    enabled: !isDemoMode,
  });

  return {
    bounties: isDemoMode ? demoBounties : realBounties,
    isLoading: isDemoMode ? false : isLoading,
  };
}