import { queryClient } from "@/lib/queryClient";

export const forcePointsUpdate = () => {
  // Immediately refetch user data for live updates
  queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
  queryClient.refetchQueries({ queryKey: ["/api/auth/user"] });
};

export const usePointsAwarding = () => {
  return {
    onPointsEarned: () => {
      // Force immediate update
      forcePointsUpdate();
    }
  };
};