import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { CreatorStatsModal } from "@/components/CreatorStatsModal";
import { 
  DollarSign, 
  TrendingUp, 
  Activity, 
  Users, 
  Target, 
  BarChart3,
  Calendar,
  Percent,
  ArrowUpRight,
  ArrowDownRight,
  Crown,
  CreditCard,
  Wallet,
  ShoppingCart
} from "lucide-react";

interface CreatorStats {
  revenue: {
    data: Array<{
      id: string;
      amount: string;
      source: string;
      description: string;
      createdAt: string;
    }>;
    total: string;
    transactionCount: number;
    avgPerTransaction: string;
  };
  users: {
    total: number;
    active: number;
    totalBalance: string;
    newLast30Days: number;
    growthRate: string;
  };
  bounties: {
    total: number;
    active: number;
    completed: number;
    totalValue: string;
    completionRate: string;
  };
  transactions: {
    total: number;
    totalVolume: string;
    deposits: number;
    withdrawals: number;
    avgTransactionSize: string;
  };
  spending: {
    totalUserSpent: string;
    pointPurchases: {
      total: string;
      count: number;
      avgPurchase: string;
    };
    withdrawals: {
      total: string;
      count: number;
      avgWithdrawal: string;
    };
    refunds: {
      total: string;
      count: number;
    };
    breakdown: Record<string, number>;
    last30Days: {
      pointPurchases: string;
      spending: string;
    };
  };
  activity: Array<{
    id: string;
    type: string;
    description: string;
    createdAt: string;
    userId: string;
  }>;
}

export default function CreatorDashboard() {
  const { toast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'users' | 'revenue' | 'bounties' | 'points' | 'spending' | null>(null);
  const [modalTitle, setModalTitle] = useState("");

  const openDetailsModal = (type: 'users' | 'revenue' | 'bounties' | 'points' | 'spending', title: string) => {
    setModalType(type);
    setModalTitle(title);
    setModalOpen(true);
  };

  const { data: stats, isLoading, error } = useQuery<CreatorStats>({
    queryKey: ["/api/creator/stats"],
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
          description: "You don't have creator permissions to view these analytics",
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Error",
        description: "Failed to load creator analytics",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Crown className="h-6 w-6 text-yellow-500" />
          Creator Analytics
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
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
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Crown className="h-6 w-6 text-yellow-500" />
          Creator Analytics
        </h1>
        <Card className="theme-transition">
          <CardContent className="p-6 text-center">
            <div className="text-muted-foreground">
              <div className="text-6xl mb-4">🚫</div>
              <h3 className="text-lg font-semibold mb-2">Access Restricted</h3>
              <p className="text-sm">You need creator permissions to view these analytics</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!stats) return null;

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'bounty_posted': return '📋';
      case 'bounty_applied': return '✋';
      case 'bounty_completed': return '✅';
      case 'friend_added': return '👥';
      case 'payment_made': return '💳';
      default: return '📱';
    }
  };

  const formatGrowthRate = (rate: string) => {
    const numRate = parseFloat(rate);
    if (numRate > 0) {
      return (
        <div className="flex items-center gap-1 text-green-600">
          <ArrowUpRight className="h-4 w-4" />
          +{rate}%
        </div>
      );
    } else if (numRate < 0) {
      return (
        <div className="flex items-center gap-1 text-red-600">
          <ArrowDownRight className="h-4 w-4" />
          {rate}%
        </div>
      );
    }
    return <span className="text-muted-foreground">0%</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Crown className="h-6 w-6 text-yellow-500" />
          Creator Analytics Dashboard
        </h1>
        <Badge variant="outline" className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300">
          Creator Access
        </Badge>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card className="theme-transition">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${parseFloat(stats.revenue.total).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              From {stats.revenue.transactionCount} fee transactions
            </p>
          </CardContent>
        </Card>

        <Card 
          className="theme-transition cursor-pointer hover:shadow-lg transition-all"
          onClick={() => openDetailsModal('users', 'User Details')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.users.total.toLocaleString()}
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-muted-foreground">{stats.users.active} active</span>
              {formatGrowthRate(stats.users.growthRate)}
            </div>
            <p className="text-xs text-blue-600 mt-1">Click for details →</p>
          </CardContent>
        </Card>

        <Card 
          className="theme-transition cursor-pointer hover:shadow-lg transition-all"
          onClick={() => openDetailsModal('bounties', 'Bounty Details')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Bounties</CardTitle>
            <Target className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {stats.bounties.active}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.bounties.completionRate}% completion rate
            </p>
            <p className="text-xs text-blue-600 mt-1">Click for details →</p>
          </CardContent>
        </Card>

        <Card 
          className="theme-transition cursor-pointer hover:shadow-lg transition-all"
          onClick={() => openDetailsModal('points', 'Points Purchase Details')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Points Sales</CardTitle>
            <CreditCard className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ${parseFloat(stats.spending.pointPurchases.total).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.spending.pointPurchases.count} sales made
            </p>
            <p className="text-xs text-blue-600 mt-1">Click for details →</p>
          </CardContent>
        </Card>

        <Card 
          className="theme-transition cursor-pointer hover:shadow-lg transition-all"
          onClick={() => openDetailsModal('spending', 'User Spending Details')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User Spending</CardTitle>
            <ShoppingCart className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${parseFloat(stats.spending.totalUserSpent).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Total money spent by users
            </p>
            <p className="text-xs text-blue-600 mt-1">Click for details →</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Analytics */}
        <Card className="theme-transition">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Analytics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Total Users</p>
                <p className="text-2xl font-bold">{stats.users.total.toLocaleString()}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Active (7 days)</p>
                <p className="text-2xl font-bold">{stats.users.active}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">New (30 days)</p>
                <p className="text-2xl font-bold">{stats.users.newLast30Days}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Growth Rate</p>
                <div className="text-lg font-bold">
                  {formatGrowthRate(stats.users.growthRate)}
                </div>
              </div>
            </div>
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total User Balance</span>
                <span className="font-bold text-green-600">
                  ${parseFloat(stats.users.totalBalance).toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bounty Analytics */}
        <Card className="theme-transition">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Bounty Analytics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Total Posted</p>
                <p className="text-2xl font-bold">{stats.bounties.total}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Active Now</p>
                <p className="text-2xl font-bold">{stats.bounties.active}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Completed</p>
                <p className="text-2xl font-bold">{stats.bounties.completed}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Success Rate</p>
                <p className="text-2xl font-bold">{stats.bounties.completionRate}%</p>
              </div>
            </div>
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Bounty Value</span>
                <span className="font-bold text-purple-600">
                  ${parseFloat(stats.bounties.totalValue).toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Points Sales Analysis */}
      <div className="mb-6">
        <Card className="theme-transition">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Points Sales Analytics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Total Sales</p>
                <p className="text-2xl font-bold text-blue-600">${parseFloat(stats.spending.pointPurchases.total).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">All time</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Total Transactions</p>
                <p className="text-2xl font-bold">{stats.spending.pointPurchases.count}</p>
                <p className="text-xs text-muted-foreground">Point purchases</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Average Sale</p>
                <p className="text-2xl font-bold">${stats.spending.pointPurchases.avgPurchase}</p>
                <p className="text-xs text-muted-foreground">Per transaction</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Last 30 Days</p>
                <p className="text-2xl font-bold text-green-600">${parseFloat(stats.spending.last30Days.pointPurchases).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Recent sales</p>
              </div>
            </div>
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Points sales represent direct platform revenue</span>
                <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300">
                  Direct Revenue
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue & Spending Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Breakdown */}
        <Card className="theme-transition">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Revenue Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {['bounty_posting', 'bounty_completion', 'deposit'].map((source) => {
                const sourceRevenue = stats.revenue.data.filter(r => r.source === source);
                const sourceTotal = sourceRevenue.reduce((sum, r) => sum + parseFloat(r.amount), 0);
                const percentage = stats.revenue.transactionCount > 0 
                  ? ((sourceRevenue.length / stats.revenue.transactionCount) * 100).toFixed(1)
                  : '0';

                const sourceLabel = source === 'bounty_posting' ? 'Bounty Posting' 
                  : source === 'bounty_completion' ? 'Bounty Completion' 
                  : 'Deposits';

                return (
                  <div key={source} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{sourceLabel}</p>
                      <p className="text-sm text-muted-foreground">
                        {sourceRevenue.length} transactions ({percentage}%)
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">${sourceTotal.toFixed(2)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="font-medium">Average Fee per Transaction</span>
                <span className="font-bold text-green-600">${stats.revenue.avgPerTransaction}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Spending Analytics */}
        <Card className="theme-transition">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              User Spending Analytics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Point Purchases</p>
                <p className="text-2xl font-bold text-blue-600">${parseFloat(stats.spending.pointPurchases.total).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">{stats.spending.pointPurchases.count} purchases</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Withdrawals</p>
                <p className="text-2xl font-bold text-red-600">${parseFloat(stats.spending.withdrawals.total).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">{stats.spending.withdrawals.count} withdrawals</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Avg Point Purchase</p>
                <p className="text-2xl font-bold">${stats.spending.pointPurchases.avgPurchase}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Avg Withdrawal</p>
                <p className="text-2xl font-bold">${stats.spending.withdrawals.avgWithdrawal}</p>
              </div>
            </div>
            <div className="pt-4 border-t space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total User Spending</span>
                <span className="font-bold text-red-600">${parseFloat(stats.spending.totalUserSpent).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Last 30 Days - Points</span>
                <span className="font-bold text-blue-600">${parseFloat(stats.spending.last30Days.pointPurchases).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Last 30 Days - Other</span>
                <span className="font-bold text-red-600">${parseFloat(stats.spending.last30Days.spending).toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transaction Analytics */}
        <Card className="theme-transition">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Transaction Analytics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Total Volume</p>
                <p className="text-2xl font-bold">${parseFloat(stats.transactions.totalVolume).toLocaleString()}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Total Count</p>
                <p className="text-2xl font-bold">{stats.transactions.total}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Earnings</p>
                <p className="text-2xl font-bold text-green-600">{stats.transactions.deposits}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Spendings</p>
                <p className="text-2xl font-bold text-red-600">{stats.transactions.withdrawals}</p>
              </div>
            </div>
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Average Transaction Size</span>
                <span className="font-bold">${stats.transactions.avgTransactionSize}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Feed */}
      <Card className="theme-transition">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Platform Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.activity.length === 0 ? (
            <div className="text-center p-6 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No recent activity</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {stats.activity.slice(0, 20).map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center gap-3 p-3 border rounded-lg"
                  data-testid={`activity-${activity.id}`}
                >
                  <span className="text-2xl" role="img">
                    {getActivityIcon(activity.type)}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(activity.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {activity.type.replace('_', ' ')}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Stats Detail Modal */}
      <CreatorStatsModal 
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setModalType(null);
        }}
        type={modalType}
        title={modalTitle}
      />
    </div>
  );
}