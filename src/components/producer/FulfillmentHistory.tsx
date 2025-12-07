import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, Coins, Package, Calendar, MapPin, Loader2 } from "lucide-react";

interface Fulfillment {
  id: string;
  quantity_fulfilled: number;
  fulfilled_at: string;
  notes: string | null;
  community_need: {
    id: string;
    title: string;
    location: string | null;
    category: string;
  } | null;
  product: {
    id: string;
    name: string;
    unit: string;
  } | null;
}

interface CreditTransaction {
  id: string;
  amount: number;
  created_at: string;
  description: string | null;
  source: string | null;
}

export function FulfillmentHistory({ userId }: { userId: string }) {
  const [fulfillments, setFulfillments] = useState<Fulfillment[]>([]);
  const [credits, setCredits] = useState<CreditTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCredits, setTotalCredits] = useState(0);

  useEffect(() => {
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch fulfillments with related data
      const { data: fulfillmentData, error: fulfillmentError } = await supabase
        .from("match_fulfillments")
        .select(`
          id,
          quantity_fulfilled,
          fulfilled_at,
          notes,
          community_need:community_needs (
            id,
            title,
            location,
            category
          ),
          product:products (
            id,
            name,
            unit
          )
        `)
        .eq("producer_id", userId)
        .order("fulfilled_at", { ascending: false });

      if (fulfillmentError) {
        console.error("Error fetching fulfillments:", fulfillmentError);
      } else {
        setFulfillments((fulfillmentData as unknown as Fulfillment[]) || []);
      }

      // Fetch credits earned from fulfillments
      const { data: creditsData, error: creditsError } = await supabase
        .from("dignity_credits")
        .select("id, amount, created_at, description, source")
        .eq("user_id", userId)
        .eq("source", "match_fulfillment")
        .order("created_at", { ascending: false });

      if (creditsError) {
        console.error("Error fetching credits:", creditsError);
      } else {
        setCredits(creditsData || []);
        const total = (creditsData || []).reduce((sum, c) => sum + Number(c.amount), 0);
        setTotalCredits(total);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          <p className="text-muted-foreground mt-2">Loading fulfillment history...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Fulfillments</CardDescription>
            <CardTitle className="text-3xl">{fulfillments.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Community needs fulfilled
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Credits Earned</CardDescription>
            <CardTitle className="text-3xl text-primary">{totalCredits.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Coins className="h-4 w-4 text-yellow-500" />
              Dignity Credits from fulfillments
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Quantity Distributed</CardDescription>
            <CardTitle className="text-3xl">
              {fulfillments.reduce((sum, f) => sum + Number(f.quantity_fulfilled), 0).toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Package className="h-4 w-4 text-blue-500" />
              Total units distributed
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fulfillment History */}
      <Card>
        <CardHeader>
          <CardTitle>Fulfillment History</CardTitle>
          <CardDescription>
            Your completed matches and community impact
          </CardDescription>
        </CardHeader>
        <CardContent>
          {fulfillments.length === 0 ? (
            <div className="py-12 text-center">
              <CheckCircle2 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-2">No Fulfillments Yet</h3>
              <p className="text-muted-foreground">
                Accept and fulfill matches to see your impact history here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {fulfillments.map((fulfillment) => {
                const creditEntry = credits.find(
                  (c) => c.description?.includes(fulfillment.community_need?.title || "")
                );

                return (
                  <div
                    key={fulfillment.id}
                    className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="font-medium">
                            {fulfillment.community_need?.title || "Unknown Need"}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Fulfilled with {fulfillment.product?.name || "Unknown Product"}
                          </p>
                        </div>

                        {creditEntry && (
                          <Badge variant="secondary" className="shrink-0">
                            <Coins className="h-3 w-3 mr-1 text-yellow-500" />
                            +{creditEntry.amount} DC
                          </Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Package className="h-4 w-4" />
                          {fulfillment.quantity_fulfilled} {fulfillment.product?.unit || "units"}
                        </div>

                        {fulfillment.community_need?.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {fulfillment.community_need.location}
                          </div>
                        )}

                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(fulfillment.fulfilled_at)}
                        </div>
                      </div>

                      {fulfillment.notes && (
                        <p className="mt-2 text-sm italic text-muted-foreground">
                          "{fulfillment.notes}"
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}