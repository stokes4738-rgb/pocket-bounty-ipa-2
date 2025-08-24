import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { DollarSign, TrendingUp, Activity, Calendar } from "lucide-react";

interface PlatformRevenueData {
  revenue: Array<{
    id: string;
    amount: string;
    source: string;
    description: string;
    createdAt: string;
  }>;
  totalRevenue: string;
  summary: {
    totalEarned: string;
    transactionCount: number;
    avgPerTransaction: string;
  };
}

export default function AdminDashboard() {
  const { toast } = useToast();

  const { data: revenueData, isLoading, error } = useQuery<PlatformRevenueData>({
    queryKey: ["/api/admin/platform-revenue"],
    retry: false,
  });

  // Handle errors
  useEffect(() => {
    if (error) {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      
      if (error.message.includes('403')) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to view platform revenue data",
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Error",
        description: "Failed to load platform revenue data",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Platform Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="theme-transition">
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Platform Dashboard</h1>
        <Card className="theme-transition">
          <CardContent className="p-6 text-center">
            <div className="text-muted-foreground">
              <div className="text-6xl mb-4">🚫</div>
              <h3 className="text-lg font-semibold mb-2">Access Restricted</h3>
              <p className="text-sm">You don't have permission to view this data</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!revenueData) return null;

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'bounty_posting': return '📋';
      case 'bounty_completion': return '✅';
      case 'deposit': return '💳';
      default: return '💰';
    }
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'bounty_posting': return 'Bounty Posting Fee';
      case 'bounty_completion': return 'Bounty Completion Fee';
      case 'deposit': return 'Deposit Fee';
      default: return source;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Platform Dashboard</h1>
        <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20">
          Creator Access
        </Badge>
      </div>

      {/* Revenue Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="theme-transition">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${parseFloat(revenueData.summary.totalEarned).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              5% platform fee from all transactions
            </p>
          </CardContent>
        </Card>

        <Card className="theme-transition">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {revenueData.summary.transactionCount}
            </div>
            <p className="text-xs text-muted-foreground">
              Fee-generating transactions
            </p>
          </CardContent>
        </Card>

        <Card className="theme-transition">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Fee</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              ${revenueData.summary.avgPerTransaction}
            </div>
            <p className="text-xs text-muted-foreground">
              Per transaction average
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Revenue Transactions */}
      <Card className="theme-transition">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Recent Revenue Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {revenueData.revenue.length === 0 ? (
            <div className="text-center p-6 text-muted-foreground">
              <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No revenue transactions yet</p>
              <p className="text-sm mt-2">Fees will appear here as users post bounties and make transactions</p>
            </div>
          ) : (
            <div className="space-y-3">
              {revenueData.revenue.slice(0, 20).map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                  data-testid={`revenue-transaction-${transaction.id}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl" role="img" aria-label={transaction.source}>
                      {getSourceIcon(transaction.source)}
                    </span>
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="outline" className="text-xs">
                          {getSourceLabel(transaction.source)}
                        </Badge>
                        <span>•</span>
                        <span>{new Date(transaction.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">
                      +${parseFloat(transaction.amount).toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">5% fee</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fee Breakdown */}
      <Card className="theme-transition">
        <CardHeader>
          <CardTitle>Revenue Breakdown by Source</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {['bounty_posting', 'bounty_completion', 'deposit'].map((source) => {
              const sourceRevenue = revenueData.revenue.filter(r => r.source === source);
              const sourceTotal = sourceRevenue.reduce((sum, r) => sum + parseFloat(r.amount), 0);
              const percentage = revenueData.summary.transactionCount > 0 
                ? ((sourceRevenue.length / revenueData.summary.transactionCount) * 100).toFixed(1)
                : '0';

              return (
                <div key={source} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{getSourceIcon(source)}</span>
                    <div>
                      <p className="font-medium">{getSourceLabel(source)}</p>
                      <p className="text-sm text-muted-foreground">
                        {sourceRevenue.length} transactions ({percentage}%)
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">${sourceTotal.toFixed(2)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}