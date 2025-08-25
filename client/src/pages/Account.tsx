import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Elements, useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { usePaymentMethods } from "@/hooks/usePaymentMethods";
import { useDemo } from "@/contexts/DemoContext";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import DemoLockOverlay from "@/components/DemoLockOverlay";
import { CreditCard, Plus, Trash2, Star, DollarSign, History, Shield, Lock } from "lucide-react";

// Stripe setup
const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY ? 
  loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY) : null;

function AddPaymentMethodForm({ onSuccess }: { onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const setupIntentMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/payments/setup-intent", {});
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to initialize card setup",
        variant: "destructive",
      });
    },
  });

  const saveMethodMutation = useMutation({
    mutationFn: async (paymentMethodId: string) => {
      return apiRequest("POST", "/api/payments/save-method", { paymentMethodId });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Payment method added successfully!",
      });
      onSuccess();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to save payment method",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    try {
      const setupIntentResponse = await setupIntentMutation.mutateAsync();
      const setupIntentResult = await setupIntentResponse.json();
      const cardElement = elements.getElement(CardElement);

      if (!cardElement) {
        throw new Error("Card element not found");
      }

      const { error, setupIntent } = await stripe.confirmCardSetup(
        setupIntentResult.clientSecret,
        {
          payment_method: {
            card: cardElement,
          }
        }
      );

      if (error) {
        toast({
          title: "Payment Error",
          description: error.message,
          variant: "destructive",
        });
      } else if (setupIntent.payment_method && typeof setupIntent.payment_method === 'string') {
        await saveMethodMutation.mutateAsync(setupIntent.payment_method);
      }
    } catch (error) {
      console.error("Error adding payment method:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border rounded-lg">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
            },
          }}
        />
      </div>
      <Button 
        type="submit" 
        disabled={!stripe || isLoading} 
        className="w-full"
        data-testid="button-add-payment-method"
      >
        {isLoading ? "Adding..." : "Add Payment Method"}
      </Button>
    </form>
  );
}

interface PaymentMethodType {
  id: string;
  stripePaymentMethodId: string;
  brand: string;
  last4: string;
  isDefault: boolean;
  expiryMonth: number;
  expiryYear: number;
}

function DepositForm({ paymentMethods }: { paymentMethods: PaymentMethodType[] }) {
  const [amount, setAmount] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const depositMutation = useMutation({
    mutationFn: async (data: { amount: string; paymentMethodId: string }) => {
      return apiRequest("POST", "/api/payments/deposit", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Deposit completed successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/payments/history"] });
      setAmount("");
      setSelectedMethod("");
    },
    onError: (error: any) => {
      if (isUnauthorizedError(error)) {
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
      
      // Extract error message from response
      let errorMessage = "Failed to process deposit";
      try {
        const errorData = JSON.parse(error.message.split(': ').slice(1).join(': '));
        errorMessage = errorData.message || errorMessage;
      } catch {
        errorMessage = error.message || errorMessage;
      }
      
      toast({
        title: "Payment Failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !selectedMethod) {
      toast({
        title: "Error",
        description: "Please select amount and payment method",
        variant: "destructive",
      });
      return;
    }

    const numAmount = parseFloat(amount);
    if (numAmount < 1 || numAmount > 1000) {
      toast({
        title: "Error",
        description: "Amount must be between $1 and $1000",
        variant: "destructive",
      });
      return;
    }

    const paymentMethod = paymentMethods.find(pm => pm.stripePaymentMethodId === selectedMethod);
    if (!paymentMethod) {
      toast({
        title: "Error",
        description: "Invalid payment method selected",
        variant: "destructive",
      });
      return;
    }

    depositMutation.mutate({ amount, paymentMethodId: selectedMethod });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="amount">Amount ($)</Label>
        <Input
          id="amount"
          type="text"
          inputMode="decimal"
          pattern="[0-9]*\.?[0-9]*"
          value={amount}
          onChange={(e) => {
            // Only allow numbers and decimal point
            const value = e.target.value.replace(/[^0-9.]/g, '');
            // Prevent multiple decimal points
            const parts = value.split('.');
            if (parts.length > 2) {
              return; // Don't update if more than one decimal point
            }
            setAmount(value);
          }}
          onFocus={(e) => {
            // Force keyboard to show on mobile
            e.target.setAttribute('readonly', 'false');
            e.target.click();
          }}
          placeholder="Enter amount (e.g., 10.00)"
          data-testid="input-deposit-amount"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
        />
      </div>
      <div>
        <Label htmlFor="payment-method">Payment Method</Label>
        <select
          id="payment-method"
          value={selectedMethod}
          onChange={(e) => setSelectedMethod(e.target.value)}
          className="w-full p-2 border rounded-lg"
          data-testid="select-payment-method"
        >
          <option value="">Select payment method</option>
          {paymentMethods.map((method) => (
            <option key={method.stripePaymentMethodId} value={method.stripePaymentMethodId}>
              {method.brand?.toUpperCase()} •••• {method.last4} {method.isDefault ? "(Default)" : ""}
            </option>
          ))}
        </select>
      </div>
      <Button 
        type="submit" 
        disabled={depositMutation.isPending}
        className="w-full bg-green-600 hover:bg-green-700"
        data-testid="button-deposit"
      >
        {depositMutation.isPending ? "Processing..." : "Deposit"}
      </Button>
    </form>
  );
}

export default function Account() {
  const [showAddCard, setShowAddCard] = useState(false);
  const [showDemoLock, setShowDemoLock] = useState(false);
  const { user } = useAuth();
  const { isDemoMode } = useDemo();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { paymentMethods, isLoading: methodsLoading } = usePaymentMethods();

  const { data: paymentHistory = [] } = useQuery<any[]>({
    queryKey: ["/api/payments/history"],
    retry: false,
  });

  const setDefaultMutation = useMutation({
    mutationFn: async (paymentMethodId: string) => {
      return apiRequest("POST", "/api/payments/set-default", { paymentMethodId });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Default payment method updated",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/payments/methods"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to update default payment method",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/payments/methods/${id}`, {});
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Payment method removed",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/payments/methods"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to remove payment method",
        variant: "destructive",
      });
    },
  });

  const [testDepositAmount, setTestDepositAmount] = useState("");

  const testDepositMutation = useMutation({
    mutationFn: async (amount: string) => {
      return apiRequest("POST", "/api/test/deposit", { amount });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Test funds added to your account!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/transactions"] });
      setTestDepositAmount("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add test funds",
        variant: "destructive",
      });
    },
  });

  const handleTestDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(testDepositAmount);
    if (amount < 1 || amount > 1000) {
      toast({
        title: "Error",
        description: "Amount must be between $1 and $1000",
        variant: "destructive",
      });
      return;
    }
    testDepositMutation.mutate(testDepositAmount);
  };

  if (!stripePromise) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Account Management</h1>
        
        {/* Test Mode Banner */}
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100">Test Mode Active</h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Payment system running in test mode. Use the form below to add test funds.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Balance Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Current Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-pocket-gold">
              ${parseFloat(user?.balance || "0").toFixed(2)}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Available for bounties and withdrawals
            </p>
          </CardContent>
        </Card>

        {/* Test Deposit Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add Test Funds
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleTestDeposit} className="space-y-4">
              <div>
                <Label htmlFor="amount">Amount (USD)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="amount"
                    type="number"
                    min="1"
                    max="1000"
                    step="0.01"
                    placeholder="100.00"
                    value={testDepositAmount}
                    onChange={(e) => setTestDepositAmount(e.target.value)}
                    className="pl-8"
                    data-testid="input-deposit-amount"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Add between $1 and $1000 in test funds
                </p>
              </div>
              <Button 
                type="submit" 
                className="w-full"
                disabled={testDepositMutation.isPending}
                data-testid="button-add-funds"
              >
                {testDepositMutation.isPending ? "Adding..." : "Add Test Funds"}
              </Button>
            </form>
            
            {/* Quick Add Buttons */}
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm font-medium mb-2">Quick Add:</p>
              <div className="grid grid-cols-4 gap-2">
                {["10", "25", "50", "100"].map((amount) => (
                  <Button
                    key={amount}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setTestDepositAmount(amount);
                      testDepositMutation.mutate(amount);
                    }}
                    disabled={testDepositMutation.isPending}
                    data-testid={`button-quick-add-${amount}`}
                  >
                    +${amount}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Account Management</h1>
          <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20">
            Balance: ${user?.balance || "0.00"}
          </Badge>
        </div>

        {/* Account Balance & Deposit */}
        <Card className="theme-transition">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Account Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-sm text-muted-foreground">Current Balance</p>
                  <p className="text-3xl font-bold text-green-600">${user?.balance || "0.00"}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Lifetime Earned: ${user?.lifetimeEarned || "0.00"}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Add Funds</h3>
                {paymentMethods.length > 0 ? (
                  <DepositForm paymentMethods={paymentMethods} />
                ) : (
                  <div className="text-center p-4 border-2 border-dashed rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Add a payment method first to deposit funds
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card className="theme-transition">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Methods
              </div>
              <Button
                onClick={() => setShowAddCard(true)}
                size="sm"
                data-testid="button-add-card"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Card
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {showAddCard && (
              <div className="mb-6 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <h3 className="font-semibold mb-4">Add New Payment Method</h3>
                <AddPaymentMethodForm
                  onSuccess={() => {
                    setShowAddCard(false);
                    queryClient.invalidateQueries({ queryKey: ["/api/payments/methods"] });
                  }}
                />
                <Button
                  variant="outline"
                  onClick={() => setShowAddCard(false)}
                  className="w-full mt-2"
                  data-testid="button-cancel-add-card"
                >
                  Cancel
                </Button>
              </div>
            )}

            {paymentMethods.length === 0 ? (
              <div className="text-center p-6 text-muted-foreground">
                <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No payment methods added yet</p>
                <p className="text-sm mt-2">Add a card to start making deposits</p>
              </div>
            ) : (
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                    data-testid={`payment-method-${method.last4}`}
                  >
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium">
                          {method.brand?.toUpperCase()} •••• {method.last4}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Expires {method.expiryMonth}/{method.expiryYear}
                        </p>
                      </div>
                      {method.isDefault && (
                        <Badge variant="outline" className="ml-2">
                          <Star className="h-3 w-3 mr-1" />
                          Default
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {!method.isDefault && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDefaultMutation.mutate(method.id)}
                          disabled={setDefaultMutation.isPending}
                          data-testid={`button-set-default-${method.last4}`}
                        >
                          Set Default
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteMutation.mutate(method.id)}
                        disabled={deleteMutation.isPending}
                        data-testid={`button-delete-${method.last4}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment History */}
        <Card className="theme-transition">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Payment History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {paymentHistory.length === 0 ? (
              <div className="text-center p-6 text-muted-foreground">
                <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No payment history yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {paymentHistory.slice(0, 10).map((payment: any) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                    data-testid={`payment-history-${payment.id}`}
                  >
                    <div>
                      <p className="font-medium">{payment.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${
                        payment.type === 'deposit' ? 'text-green-600' : 'text-blue-600'
                      }`}>
                        {payment.type === 'deposit' ? '+' : ''}${payment.amount}
                      </p>
                      <Badge
                        variant={payment.status === 'succeeded' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {payment.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Elements>
  );
}