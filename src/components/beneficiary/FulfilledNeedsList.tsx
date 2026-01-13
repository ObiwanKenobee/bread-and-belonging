import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Heart, Package } from "lucide-react";
import { ProducerRatingDialog } from "@/components/ratings/ProducerRatingDialog";
import { formatDistanceToNow } from "date-fns";

interface FulfilledNeed {
  id: string;
  title: string;
  quantity_fulfilled: number;
  created_at: string;
  product_name: string;
  producer_id: string;
  producer_name: string;
  has_rating: boolean;
  fulfillment_id: string;
}

interface FulfilledNeedsProps {
  userId: string;
}

export function FulfilledNeedsList({ userId }: FulfilledNeedsProps) {
  const [needs, setNeeds] = useState<FulfilledNeed[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFulfilledNeeds();
  }, [userId]);

  const fetchFulfilledNeeds = async () => {
    try {
      // Get the user's fulfilled community needs with fulfillment details
      const { data: fulfillments, error } = await supabase
        .from("match_fulfillments")
        .select(`
          id,
          quantity_fulfilled,
          created_at,
          producer_id,
          need_id,
          product_id,
          community_needs!inner(
            id,
            title,
            created_by
          ),
          products(name),
          profiles!match_fulfillments_producer_id_fkey(full_name)
        `)
        .eq("community_needs.created_by", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get existing ratings by this user
      const { data: ratings } = await supabase
        .from("producer_ratings")
        .select("fulfillment_id")
        .eq("beneficiary_id", userId);

      const ratedFulfillmentIds = new Set(ratings?.map((r) => r.fulfillment_id) || []);

      const formattedNeeds: FulfilledNeed[] = (fulfillments || []).map((f: any) => ({
        id: f.need_id,
        fulfillment_id: f.id,
        title: f.community_needs?.title || "Need",
        quantity_fulfilled: f.quantity_fulfilled,
        created_at: f.created_at,
        product_name: f.products?.name || "Item",
        producer_id: f.producer_id,
        producer_name: f.profiles?.full_name || "Producer",
        has_rating: ratedFulfillmentIds.has(f.id),
      }));

      setNeeds(formattedNeeds);
    } catch (error) {
      console.error("Error fetching fulfilled needs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRatingSubmitted = () => {
    fetchFulfilledNeeds();
  };

  if (loading) {
    return <p className="text-muted-foreground">Loading fulfilled needs...</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Fulfilled Needs</h2>
        <p className="text-muted-foreground">
          Needs that have been fulfilled by community producers
        </p>
      </div>

      {needs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              No fulfilled needs yet. Submit a request and wait for a producer to help!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {needs.map((need) => (
            <Card key={need.fulfillment_id}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <div className="space-y-1">
                      <h3 className="font-medium text-foreground">{need.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {need.quantity_fulfilled} {need.product_name} from{" "}
                        <span className="font-medium">{need.producer_name}</span>
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">
                          Fulfilled
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(need.created_at), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    {need.has_rating ? (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        <Heart className="w-3 h-3 mr-1 fill-current" />
                        Thanked
                      </Badge>
                    ) : (
                      <ProducerRatingDialog
                        fulfillmentId={need.fulfillment_id}
                        producerId={need.producer_id}
                        beneficiaryId={userId}
                        productName={need.product_name}
                        onRatingSubmitted={handleRatingSubmitted}
                      />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
