import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Transaction } from "@shared/schema";

export default function Bank() {
  const { user } = useAuth();
  
  const { data: transactions = [], isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/user/transactions"],
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-2.5">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-3 animate-pulse">
              <div className="h-4 bg-muted rounded mb-2"></div>
              <div className="h-6 bg-muted rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2.5">
        <Card className="theme-transition">
          <CardContent className="p-3">
            <h3 className="text-xs text-muted-foreground font-semibold mb-1.5">
              Available Balance
            </h3>
            <div className="text-lg font-bold text-pocket-gold" data-testid="text-balance">
              {formatCurrency(user?.balance || "0")}
            </div>
          </CardContent>
        </Card>
        
        <Card className="theme-transition">
          <CardContent className="p-3">
            <h3 className="text-xs text-muted-foreground font-semibold mb-1.5">
              Lifetime Earned
            </h3>
            <div className="text-lg font-bold text-pocket-gold" data-testid="text-lifetime-earned">
              {formatCurrency(user?.lifetimeEarned || "0")}
            </div>
          </CardContent>
        </Card>
        
        <Card className="theme-transition">
          <CardContent className="p-3">
            <h3 className="text-xs text-muted-foreground font-semibold mb-1.5">
              Points
            </h3>
            <div className="text-lg font-bold text-pocket-gold" data-testid="text-points">
              {user?.points || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="theme-transition">
        <CardContent className="p-3.5">
          <h3 className="text-sm font-semibold mb-3">Recent Transactions</h3>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <div className="text-2xl mb-2">💰</div>
              <div className="text-sm">No transactions yet</div>
              <div className="text-xs">Complete bounties to start earning!</div>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.slice(0, 5).map((transaction) => (
                <div 
                  key={transaction.id} 
                  className="flex justify-between items-center"
                  data-testid={`transaction-${transaction.id}`}
                >
                  <div>
                    <div className="text-sm font-medium">
                      {transaction.description}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(transaction.createdAt || new Date())}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-bold ${
                      transaction.type === "earning" ? "text-green-400" : "text-red-400"
                    }`}>
                      {transaction.type === "earning" ? "+" : "-"}
                      {formatCurrency(transaction.amount)}
                    </div>
                    <Badge 
                      variant={transaction.status === "completed" ? "default" : "secondary"}
                      className={transaction.status === "completed" 
                        ? "bg-pocket-gold text-gray-900" 
                        : "bg-orange-500 text-white"
                      }
                    >
                      {(transaction.status || 'pending').toUpperCase()}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cash Out Section */}
      <Card className="theme-transition">
        <CardContent className="p-3.5">
          <h3 className="text-sm font-semibold mb-3">Cash Out</h3>
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5">
                Payment Method
              </Label>
              <Select>
                <SelectTrigger data-testid="select-payment-method">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="venmo">Venmo</SelectItem>
                  <SelectItem value="bank">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5">
                Amount
              </Label>
              <Input 
                type="number" 
                placeholder="$0.00" 
                min="5" 
                max={user?.balance || 0}
                data-testid="input-payout-amount"
              />
            </div>
            
            <Button 
              className="w-full bg-pocket-red hover:bg-pocket-red-dark text-white"
              data-testid="button-request-payout"
            >
              Request Payout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
