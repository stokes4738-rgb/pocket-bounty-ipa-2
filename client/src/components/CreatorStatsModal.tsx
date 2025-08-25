import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency, formatDate } from "@/lib/utils";
import { 
  User, 
  DollarSign, 
  Calendar, 
  TrendingUp, 
  Activity,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'users' | 'revenue' | 'bounties' | 'points' | 'spending' | null;
  title: string;
}

interface ModalDetailsData {
  users?: any[];
  transactions?: any[];
  purchases?: any[];
  bounties?: any[];
  spending?: any[];
}

export function CreatorStatsModal({ isOpen, onClose, type, title }: StatsModalProps) {
  const [activeTab, setActiveTab] = useState("list");

  const { data: details, isLoading, error } = useQuery<ModalDetailsData | null>({
    queryKey: [`/api/creator/details/${type}`],
    enabled: isOpen && type !== null,
    queryFn: async () => {
      if (!type) return null;
      const response = await apiRequest("GET", `/api/creator/details/${type}`);
      const data = await response.json() as ModalDetailsData;
      console.log(`Modal data for ${type}:`, data);
      return data;
    },
    retry: false
  });

  if (!type) return null;

  const renderUsersList = () => {
    if (!details?.users) return <div className="text-center p-6 text-muted-foreground">No users found</div>;
    return (
      <div className="space-y-2">
        {details.users.map((user: any) => (
          <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                {user.firstName?.[0] || user.email[0].toUpperCase()}
              </div>
              <div>
                <div className="font-medium">{user.firstName} {user.lastName}</div>
                <div className="text-sm text-muted-foreground">{user.handle || user.email}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold">{user.points} pts</div>
              <div className="text-sm text-green-600">{formatCurrency(user.balance)}</div>
              <div className="text-xs text-muted-foreground">
                Joined {formatDate(user.createdAt)}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderRevenueList = () => {
    if (!details?.transactions) return <div className="text-center p-6 text-muted-foreground">No transactions found</div>;
    return (
      <div className="space-y-2">
        {details.transactions.map((transaction: any) => (
          <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${
                transaction.source === 'platform_fee' ? 'bg-green-100 text-green-600' : 
                transaction.source === 'point_purchase' ? 'bg-blue-100 text-blue-600' : 
                'bg-gray-100 text-gray-600'
              }`}>
                {transaction.source === 'platform_fee' ? <DollarSign className="h-4 w-4" /> : <CreditCard className="h-4 w-4" />}
              </div>
              <div>
                <div className="font-medium">{transaction.description}</div>
                <div className="text-sm text-muted-foreground">
                  {transaction.userName || 'Unknown User'}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-green-600">+{formatCurrency(transaction.amount)}</div>
              <div className="text-xs text-muted-foreground">
                {formatDate(transaction.createdAt)}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderPointsPurchases = () => {
    if (!details?.purchases) return <div className="text-center p-6 text-muted-foreground">No purchases found</div>;
    return (
      <div className="space-y-2">
        {details.purchases.map((purchase: any) => (
          <div key={purchase.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                <CreditCard className="h-4 w-4" />
              </div>
              <div>
                <div className="font-medium">{purchase.userName}</div>
                <div className="text-sm text-muted-foreground">
                  {purchase.userEmail}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-blue-600">{formatCurrency(purchase.amount)}</div>
              <div className="text-sm">{purchase.points} points</div>
              <div className="text-xs text-muted-foreground">
                {formatDate(purchase.createdAt)}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderBountiesList = () => {
    if (!details?.bounties) return <div className="text-center p-6 text-muted-foreground">No bounties found</div>;
    return (
      <div className="space-y-2">
        {details.bounties.map((bounty: any) => (
          <div key={bounty.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
            <div className="flex-1">
              <div className="font-medium">{bounty.title}</div>
              <div className="text-sm text-muted-foreground">
                Posted by {bounty.authorName || 'Unknown'}
              </div>
              <div className="flex gap-2 mt-1">
                <Badge variant={bounty.status === 'active' ? 'default' : 'secondary'}>
                  {bounty.status}
                </Badge>
                {bounty.boostLevel > 0 && (
                  <Badge className="bg-purple-100 text-purple-700">
                    Boost L{bounty.boostLevel}
                  </Badge>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-green-600">{formatCurrency(bounty.reward)}</div>
              <div className="text-xs text-muted-foreground">
                {formatDate(bounty.createdAt)}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderSpendingBreakdown = () => {
    if (!details?.spending) return <div className="text-center p-6 text-muted-foreground">No spending found</div>;
    return (
      <div className="space-y-2">
        {details.spending.map((spend: any) => (
          <div key={spend.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${
                spend.type === 'withdrawal' ? 'bg-red-100 text-red-600' : 
                spend.type === 'deposit' ? 'bg-green-100 text-green-600' : 
                spend.type === 'boost' ? 'bg-purple-100 text-purple-600' :
                'bg-gray-100 text-gray-600'
              }`}>
                {spend.type === 'withdrawal' ? <ArrowUpRight className="h-4 w-4" /> : 
                 spend.type === 'deposit' ? <ArrowDownRight className="h-4 w-4" /> :
                 <Activity className="h-4 w-4" />}
              </div>
              <div>
                <div className="font-medium">{spend.userName}</div>
                <div className="text-sm text-muted-foreground">
                  {spend.description}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className={`font-bold ${
                spend.type === 'withdrawal' ? 'text-red-600' : 
                spend.type === 'deposit' ? 'text-green-600' : 
                'text-purple-600'
              }`}>
                {spend.type === 'withdrawal' ? '-' : '+'}{formatCurrency(spend.amount)}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatDate(spend.createdAt)}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const getContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="text-red-500 mb-2">❌ Error loading data</div>
          <div className="text-sm text-muted-foreground">{error.message}</div>
          <div className="text-xs text-muted-foreground mt-2">Make sure you're logged in as a creator</div>
        </div>
      );
    }

    if (!details) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">No data available</div>
        </div>
      );
    }

    switch (type) {
      case 'users':
        return renderUsersList();
      case 'revenue':
        return renderRevenueList();
      case 'points':
        return renderPointsPurchases();
      case 'bounties':
        return renderBountiesList();
      case 'spending':
        return renderSpendingBreakdown();
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          {getContent()}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}