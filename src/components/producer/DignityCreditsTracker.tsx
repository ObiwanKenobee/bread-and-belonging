import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Coins, TrendingUp, TrendingDown, ArrowRightLeft } from "lucide-react";
import { format } from "date-fns";

interface CreditTransaction {
  id: string;
  amount: number;
  transaction_type: string;
  source: string | null;
  description: string | null;
  created_at: string;
}

export function DignityCreditsTracker({ userId }: { userId: string }) {
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchCredits();
  }, [userId]);

  const fetchCredits = async () => {
    const { data, error } = await supabase
      .from("dignity_credits")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error loading credits", description: error.message, variant: "destructive" });
    } else {
      setTransactions(data || []);
    }
    setLoading(false);
  };

  const totalEarned = transactions
    .filter((t) => t.transaction_type === "earned")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalSpent = transactions
    .filter((t) => t.transaction_type === "spent")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalEarned - totalSpent;

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "earned":
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case "spent":
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      case "transferred":
        return <ArrowRightLeft className="w-4 h-4 text-blue-500" />;
      default:
        return <Coins className="w-4 h-4" />;
    }
  };

  const getTransactionBadge = (type: string) => {
    switch (type) {
      case "earned":
        return <Badge className="bg-green-100 text-green-700">Earned</Badge>;
      case "spent":
        return <Badge className="bg-red-100 text-red-700">Spent</Badge>;
      case "transferred":
        return <Badge className="bg-blue-100 text-blue-700">Transferred</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading credits...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Dignity Credits</h2>
        <p className="text-muted-foreground">Track your community credit balance and transactions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Current Balance</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <Coins className="w-6 h-6 text-primary" />
              {balance.toFixed(2)} DC
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Earned</CardDescription>
            <CardTitle className="text-2xl text-green-600 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              +{totalEarned.toFixed(2)} DC
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Spent</CardDescription>
            <CardTitle className="text-2xl text-red-600 flex items-center gap-2">
              <TrendingDown className="w-5 h-5" />
              -{totalSpent.toFixed(2)} DC
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Info Card */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
              <Coins className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">What are Dignity Credits?</h3>
              <p className="text-sm text-muted-foreground">
                Dignity Credits (DC) are community-issued, non-speculative credits earned for providing goods and services 
                to the network. They can be redeemed for essentials, training, or savings within the community ecosystem.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Your recent Dignity Credit activity</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Coins className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No transactions yet.</p>
              <p className="text-sm">Credits will appear here when you provide goods or services to the community.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      {getTransactionIcon(transaction.transaction_type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        {getTransactionBadge(transaction.transaction_type)}
                        {transaction.source && (
                          <span className="text-sm text-muted-foreground">{transaction.source}</span>
                        )}
                      </div>
                      {transaction.description && (
                        <p className="text-sm text-muted-foreground mt-1">{transaction.description}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(transaction.created_at), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                  </div>
                  <div className={`text-lg font-semibold ${
                    transaction.transaction_type === "earned" ? "text-green-600" : 
                    transaction.transaction_type === "spent" ? "text-red-600" : "text-blue-600"
                  }`}>
                    {transaction.transaction_type === "earned" ? "+" : "-"}{transaction.amount.toFixed(2)} DC
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
