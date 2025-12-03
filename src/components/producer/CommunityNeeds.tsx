import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Heart, MapPin, Clock, HandHeart } from "lucide-react";
import { format } from "date-fns";

interface CommunityNeed {
  id: string;
  title: string;
  description: string | null;
  category: string;
  quantity_needed: number | null;
  unit: string | null;
  priority: string;
  location: string | null;
  status: string;
  created_at: string;
}

interface Product {
  id: string;
  name: string;
  category: string;
}

export function CommunityNeeds({ userId }: { userId: string }) {
  const [needs, setNeeds] = useState<CommunityNeed[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    const [needsRes, productsRes] = await Promise.all([
      supabase
        .from("community_needs")
        .select("*")
        .eq("status", "open")
        .order("priority", { ascending: false })
        .order("created_at", { ascending: false }),
      supabase.from("products").select("id, name, category").eq("producer_id", userId),
    ]);

    if (needsRes.error) {
      toast({ title: "Error loading needs", description: needsRes.error.message, variant: "destructive" });
    } else {
      setNeeds(needsRes.data || []);
    }

    if (productsRes.data) {
      setProducts(productsRes.data);
    }
    setLoading(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-700 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const canMatch = (need: CommunityNeed) => {
    return products.some((p) => p.category === need.category);
  };

  const matchingProducts = (need: CommunityNeed) => {
    return products.filter((p) => p.category === need.category);
  };

  const handleOffer = async (needId: string, productId: string) => {
    const { error } = await supabase
      .from("community_needs")
      .update({ matched_product_id: productId, status: "matched" })
      .eq("id", needId);

    if (error) {
      toast({ title: "Error matching need", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Offer submitted!", description: "You've matched with this community need." });
      fetchData();
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading community needs...</div>;
  }

  const matchableNeeds = needs.filter(canMatch);
  const otherNeeds = needs.filter((n) => !canMatch(n));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Community Needs</h2>
        <p className="text-muted-foreground">See what the community needs and offer your products</p>
      </div>

      {/* Matchable Needs */}
      {matchableNeeds.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <HandHeart className="w-5 h-5 text-primary" />
            Needs You Can Fulfill
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {matchableNeeds.map((need) => (
              <Card key={need.id} className="border-primary/20 bg-primary/5">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{need.title}</CardTitle>
                      <CardDescription>{need.category}</CardDescription>
                    </div>
                    <Badge className={getPriorityColor(need.priority)}>
                      {need.priority}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {need.description && (
                    <p className="text-sm text-muted-foreground mb-3">{need.description}</p>
                  )}
                  <div className="flex flex-wrap gap-2 mb-4 text-sm text-muted-foreground">
                    {need.quantity_needed && (
                      <span className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        {need.quantity_needed} {need.unit} needed
                      </span>
                    )}
                    {need.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {need.location}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {format(new Date(need.created_at), "MMM d")}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Your matching products:</p>
                    <div className="flex flex-wrap gap-2">
                      {matchingProducts(need).map((product) => (
                        <Button
                          key={product.id}
                          size="sm"
                          onClick={() => handleOffer(need.id, product.id)}
                        >
                          Offer {product.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Other Needs */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Heart className="w-5 h-5 text-muted-foreground" />
          All Open Needs ({otherNeeds.length})
        </h3>
        {otherNeeds.length === 0 && matchableNeeds.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Heart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No open community needs at the moment.</p>
              <p className="text-sm text-muted-foreground">Check back later to see how you can help!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {otherNeeds.map((need) => (
              <Card key={need.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{need.title}</CardTitle>
                      <CardDescription>{need.category}</CardDescription>
                    </div>
                    <Badge className={getPriorityColor(need.priority)} variant="outline">
                      {need.priority}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {need.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{need.description}</p>
                  )}
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    {need.quantity_needed && (
                      <span>{need.quantity_needed} {need.unit}</span>
                    )}
                    {need.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {need.location}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
