import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";
import { useDemo } from "@/contexts/DemoContext";

export function useAuth() {
  const { isDemoMode, demoUser } = useDemo();
  
  const { data: realUser, isLoading } = useQuery<User>({
    queryKey: ["/api/user"],
    retry: false,
    enabled: !isDemoMode, // Only fetch real user data when not in demo mode
    refetchInterval: false, // Disable automatic polling
    staleTime: 300000, // Consider data fresh for 5 minutes
    refetchOnWindowFocus: true, // Only refetch when user focuses the window
  });

  // Return demo user data when in demo mode, otherwise real user data
  const user = isDemoMode ? demoUser : realUser;
  const isAuthenticated = isDemoMode ? true : !!realUser;

  return {
    user,
    isLoading: isDemoMode ? false : isLoading,
    isAuthenticated,
  };
}
