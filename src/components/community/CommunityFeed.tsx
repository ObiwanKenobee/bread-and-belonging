import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { Heart, Package, Star, Users } from "lucide-react";

interface FulfillmentStory {
  id: string;
  quantity_fulfilled: number;
  created_at: string;
  product_name: string;
  product_category: string;
  producer_name: string;
  beneficiary_initial: string;
}

interface ImpactStats {
  totalMeals: number;
  totalPeopleHelped: number;
  totalFulfillments: number;
}

export function CommunityFeed() {
  const [stories, setStories] = useState<FulfillmentStory[]>([]);
  const [stats, setStats] = useState<ImpactStats>({
    totalMeals: 0,
    totalPeopleHelped: 0,
    totalFulfillments: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFulfillmentStories();
    fetchImpactStats();
  }, []);

  const fetchFulfillmentStories = async () => {
    try {
      const { data, error } = await supabase
        .from("match_fulfillments")
        .select(`
          id,
          quantity_fulfilled,
          created_at,
          products!inner(name, category),
          profiles!match_fulfillments_producer_id_fkey(full_name)
        `)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;

      const formattedStories: FulfillmentStory[] = (data || []).map((item: any) => ({
        id: item.id,
        quantity_fulfilled: item.quantity_fulfilled,
        created_at: item.created_at,
        product_name: item.products?.name || "Item",
        product_category: item.products?.category || "general",
        producer_name: item.profiles?.full_name || "A Local Producer",
        beneficiary_initial: "C", // Community member
      }));

      setStories(formattedStories);
    } catch (error) {
      console.error("Error fetching fulfillment stories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchImpactStats = async () => {
    try {
      const { data, error } = await supabase
        .from("impact_metrics_monthly")
        .select("*")
        .order("month", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setStats({
          totalMeals: data.meals_distributed || 0,
          totalPeopleHelped: data.people_helped || 0,
          totalFulfillments: data.needs_fulfilled || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching impact stats:", error);
    }
  };

  const getCategoryEmoji = (category: string) => {
    const emojiMap: Record<string, string> = {
      produce: "🥬",
      dairy: "🥛",
      bakery: "🍞",
      meat: "🥩",
      prepared: "🍲",
      beverages: "🧃",
      general: "📦",
    };
    return emojiMap[category?.toLowerCase()] || "📦";
  };

  if (isLoading) {
    return (
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-64 bg-muted rounded mx-auto" />
            <div className="h-4 w-96 bg-muted rounded mx-auto" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Community Impact</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            See the real difference our community is making together. Every fulfillment
            represents a connection between neighbors.
          </p>
        </div>

        {/* Impact Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center">
            <CardContent className="pt-6">
              <Package className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-3xl font-bold">{stats.totalMeals.toLocaleString()}</div>
              <p className="text-muted-foreground">Meals Distributed</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-3xl font-bold">{stats.totalPeopleHelped.toLocaleString()}</div>
              <p className="text-muted-foreground">People Helped</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <Heart className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-3xl font-bold">{stats.totalFulfillments.toLocaleString()}</div>
              <p className="text-muted-foreground">Needs Fulfilled</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Stories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              Recent Community Stories
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stories.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No fulfillment stories yet. Be the first to make a difference!
              </p>
            ) : (
              <div className="space-y-4">
                {stories.map((story) => (
                  <div
                    key={story.id}
                    className="flex items-start gap-4 p-4 rounded-lg bg-background border"
                  >
                    <Avatar>
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getCategoryEmoji(story.product_category)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-semibold">{story.producer_name}</span>
                        {" fulfilled "}
                        <span className="font-medium">
                          {story.quantity_fulfilled} {story.product_name}
                        </span>
                        {" for a community member"}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {story.product_category || "General"}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(story.created_at), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
