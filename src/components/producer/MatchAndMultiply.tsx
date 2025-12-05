import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, MapPin, Calendar, Leaf, Users, ArrowRight, RefreshCw, Loader2 } from "lucide-react";

interface Match {
  need_id: string;
  inventory_id: string;
  product_name: string;
  match_score: number;
  reasoning: string;
  impact_estimate: number;
  need_title: string;
  need_priority: string;
  need_location: string;
  need_quantity: number;
  need_unit: string;
  inventory_location: string;
  available_quantity: number;
  expiry_date: string | null;
  sustainability_score: number | null;
}

interface MatchResponse {
  matches: Match[];
  total_needs: number;
  total_inventory: number;
  message?: string;
  error?: string;
}

export function MatchAndMultiply() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<{ needs: number; inventory: number } | null>(null);
  const { toast } = useToast();

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke<MatchResponse>("match-and-multiply");

      if (error) {
        throw error;
      }

      if (data?.error) {
        toast({
          title: "AI Error",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      if (data?.message) {
        toast({
          title: "No Matches Available",
          description: data.message,
        });
        setMatches([]);
        return;
      }

      setMatches(data?.matches || []);
      setStats({
        needs: data?.total_needs || 0,
        inventory: data?.total_inventory || 0,
      });

      toast({
        title: "Matches Generated",
        description: `Found ${data?.matches?.length || 0} optimal matches`,
      });
    } catch (error) {
      console.error("Error fetching matches:", error);
      toast({
        title: "Error",
        description: "Failed to generate matches. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-destructive text-destructive-foreground";
      case "high":
        return "bg-orange-500 text-white";
      case "medium":
        return "bg-yellow-500 text-black";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-orange-600";
  };

  const handleAcceptMatch = async (match: Match) => {
    try {
      // Update the community need to mark it as matched
      const { error } = await supabase
        .from("community_needs")
        .update({
          status: "matched",
          matched_product_id: match.inventory_id,
        })
        .eq("id", match.need_id);

      if (error) throw error;

      toast({
        title: "Match Accepted",
        description: `You've committed to fulfilling "${match.need_title}"`,
      });

      // Remove the accepted match from the list
      setMatches((prev) => prev.filter((m) => m.need_id !== match.need_id));
    } catch (error) {
      console.error("Error accepting match:", error);
      toast({
        title: "Error",
        description: "Failed to accept match. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Match & Multiply AI</CardTitle>
                <CardDescription>
                  AI-powered matching of your products to community needs
                </CardDescription>
              </div>
            </div>
            <Button onClick={fetchMatches} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Generate Matches
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        {stats && (
          <CardContent>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span>Analyzing {stats.needs} open needs</span>
              <span>•</span>
              <span>{stats.inventory} available inventory items</span>
            </div>
          </CardContent>
        )}
      </Card>

      {matches.length === 0 && !loading && (
        <Card>
          <CardContent className="py-12 text-center">
            <Sparkles className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">No Matches Yet</h3>
            <p className="text-muted-foreground mb-4">
              Click "Generate Matches" to let AI find optimal matches between your
              inventory and community needs.
            </p>
          </CardContent>
        </Card>
      )}

      {matches.length > 0 && (
        <div className="grid gap-4">
          {matches.map((match, index) => (
            <Card key={`${match.need_id}-${match.inventory_id}`} className="overflow-hidden">
              <div className="flex">
                <div className="w-2 bg-primary" />
                <div className="flex-1 p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-xs">
                          #{index + 1}
                        </Badge>
                        <Badge className={getPriorityColor(match.need_priority)}>
                          {match.need_priority} priority
                        </Badge>
                        <div className="flex items-center gap-1">
                          <span className={`font-bold ${getScoreColor(match.match_score)}`}>
                            {match.match_score}%
                          </span>
                          <span className="text-sm text-muted-foreground">match</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex-1 p-3 bg-muted/50 rounded-lg">
                          <p className="text-sm text-muted-foreground mb-1">Product</p>
                          <p className="font-medium">{match.product_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {match.available_quantity} available
                          </p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-muted-foreground" />
                        <div className="flex-1 p-3 bg-primary/5 rounded-lg">
                          <p className="text-sm text-muted-foreground mb-1">Need</p>
                          <p className="font-medium">{match.need_title}</p>
                          <p className="text-sm text-muted-foreground">
                            {match.need_quantity} {match.need_unit} needed
                          </p>
                        </div>
                      </div>

                      <div className="p-3 bg-muted/30 rounded-lg">
                        <p className="text-sm">
                          <span className="font-medium">AI Reasoning: </span>
                          {match.reasoning}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm">
                        {match.need_location && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            {match.need_location}
                          </div>
                        )}
                        {match.expiry_date && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            Expires: {new Date(match.expiry_date).toLocaleDateString()}
                          </div>
                        )}
                        {match.sustainability_score && (
                          <div className="flex items-center gap-1 text-green-600">
                            <Leaf className="h-4 w-4" />
                            Sustainability: {match.sustainability_score}/100
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-primary">
                          <Users className="h-4 w-4" />
                          Est. {match.impact_estimate} people helped
                        </div>
                      </div>

                      <Progress value={match.match_score} className="h-2" />
                    </div>

                    <Button onClick={() => handleAcceptMatch(match)} className="shrink-0">
                      Accept Match
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
