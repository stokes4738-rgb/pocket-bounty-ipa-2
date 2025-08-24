import { lazy, Suspense } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { useAuth } from "@/hooks/useAuth";
import { DemoProvider } from "@/contexts/DemoContext";
import DemoIndicator from "@/components/DemoIndicator";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";

// Lazy load pages for better performance
const Landing = lazy(() => import("@/pages/Landing"));
const Login = lazy(() => import("@/pages/Login"));
const CreateAccount = lazy(() => import("@/pages/CreateAccount"));
const Home = lazy(() => import("@/pages/Home"));
const Profile = lazy(() => import("@/pages/Profile"));
const Account = lazy(() => import("@/pages/Account"));
const NotFound = lazy(() => import("@/pages/not-found"));

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="text-2xl mb-2">🪙</div>
          <div className="text-lg font-semibold text-pocket-gold">Pocket Bounty</div>
          <div className="text-sm text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="text-2xl mb-2">🪙</div>
          <div className="text-lg font-semibold text-pocket-gold">Pocket Bounty</div>
          <div className="text-sm text-muted-foreground">Loading...</div>
        </div>
      </div>
    }>
      <Switch>
        {!isAuthenticated ? (
          <>
            <Route path="/" component={Landing} />
            <Route path="/login" component={Login} />
            <Route path="/create-account" component={CreateAccount} />
          </>
        ) : (
          <>
            <Route path="/" component={Home} />
            <Route path="/profile" component={Profile} />
            <Route path="/account" component={Account} />
          </>
        )}
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <DemoProvider>
        <ThemeProvider>
          <TooltipProvider>
            <Toaster />
            <DemoIndicator />
            <div className="fixed top-4 left-4 right-4 z-50 pointer-events-none">
              <div className="pointer-events-auto">
                <PWAInstallPrompt />
              </div>
            </div>
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </DemoProvider>
    </QueryClientProvider>
  );
}

export default App;
