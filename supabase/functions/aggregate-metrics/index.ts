import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.86.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Verify user is authenticated (JWT is verified by Supabase when verify_jwt = true)
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    console.error("No authorization header provided");
    return new Response(
      JSON.stringify({ error: "Authentication required" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing Supabase configuration");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    console.log("Starting metrics aggregation...");

    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    
    // Calculate week start (Monday)
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() + mondayOffset);
    const weekStartStr = weekStart.toISOString().split("T")[0];
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    const weekEndStr = weekEnd.toISOString().split("T")[0];
    
    // Month start
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthStartStr = monthStart.toISOString().split("T")[0];

    // Fetch all relevant data for aggregation
    const [productsResult, inventoryResult, needsResult, creditsResult] = await Promise.all([
      supabase.from("products").select("*"),
      supabase.from("inventory").select("*"),
      supabase.from("community_needs").select("*"),
      supabase.from("dignity_credits").select("*"),
    ]);

    if (productsResult.error) console.error("Products fetch error:", productsResult.error);
    if (inventoryResult.error) console.error("Inventory fetch error:", inventoryResult.error);
    if (needsResult.error) console.error("Needs fetch error:", needsResult.error);
    if (creditsResult.error) console.error("Credits fetch error:", creditsResult.error);

    const products = productsResult.data || [];
    const inventory = inventoryResult.data || [];
    const needs = needsResult.data || [];
    const credits = creditsResult.data || [];

    console.log(`Fetched: ${products.length} products, ${inventory.length} inventory, ${needs.length} needs, ${credits.length} credits`);

    // Helper function to filter by date range
    const filterByDateRange = (items: any[], dateField: string, startDate: string, endDate?: string) => {
      return items.filter(item => {
        const itemDate = item[dateField]?.split("T")[0];
        if (!itemDate) return false;
        if (endDate) {
          return itemDate >= startDate && itemDate <= endDate;
        }
        return itemDate === startDate;
      });
    };

    // Calculate metrics for a given dataset
    const calculateMetrics = (
      filteredNeeds: any[],
      filteredCredits: any[],
      filteredProducts: any[],
      allInventory: any[]
    ) => {
      const fulfilledNeeds = filteredNeeds.filter(n => n.status === "fulfilled");
      const matchedNeeds = filteredNeeds.filter(n => n.matched_product_id !== null);
      
      // Calculate meals distributed (estimate: each fulfilled need = avg 10 meals)
      const mealsDistributed = fulfilledNeeds.reduce((sum, n) => {
        return sum + (n.quantity_needed || 1) * 10;
      }, 0);
      
      // People helped - unique beneficiaries from fulfilled needs
      const peopleHelped = new Set(fulfilledNeeds.map(n => n.created_by)).size * 5; // Estimate 5 people per household
      
      // Products matched
      const productsMatched = matchedNeeds.length;
      
      // Total quantity distributed
      const totalQuantityDistributed = fulfilledNeeds.reduce((sum, n) => sum + (n.quantity_needed || 0), 0);
      
      // Average sustainability score from products
      const productsWithScores = filteredProducts.filter(p => p.sustainability_score !== null);
      const avgSustainabilityScore = productsWithScores.length > 0
        ? productsWithScores.reduce((sum, p) => sum + p.sustainability_score, 0) / productsWithScores.length
        : null;
      
      // Match success rate
      const successfulMatches = matchedNeeds.filter(n => n.status === "fulfilled").length;
      const totalMatchAttempts = matchedNeeds.length || 1;
      
      // Dignity credits issued
      const dignityCreditsIssued = filteredCredits
        .filter(c => c.transaction_type === "earned" || c.transaction_type === "bonus")
        .reduce((sum, c) => sum + (c.amount || 0), 0);
      
      // New community needs
      const newCommunityNeeds = filteredNeeds.length;
      
      // Needs fulfilled
      const needsFulfilled = fulfilledNeeds.length;

      return {
        meals_distributed: Math.round(mealsDistributed),
        people_helped: Math.round(peopleHelped),
        products_matched: productsMatched,
        total_quantity_distributed: totalQuantityDistributed,
        avg_sustainability_score: avgSustainabilityScore,
        successful_matches: successfulMatches,
        total_match_attempts: totalMatchAttempts,
        dignity_credits_issued: dignityCreditsIssued,
        new_community_needs: newCommunityNeeds,
        needs_fulfilled: needsFulfilled,
      };
    };

    // Calculate category and location breakdowns for monthly
    const calculateBreakdowns = (filteredNeeds: any[]) => {
      const categoryCount: Record<string, number> = {};
      const locationCount: Record<string, number> = {};
      
      filteredNeeds.forEach(need => {
        if (need.category) {
          categoryCount[need.category] = (categoryCount[need.category] || 0) + 1;
        }
        if (need.location) {
          locationCount[need.location] = (locationCount[need.location] || 0) + 1;
        }
      });
      
      const topCategories = Object.entries(categoryCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));
      
      const topLocations = Object.entries(locationCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));
      
      return { topCategories, topLocations };
    };

    // DAILY METRICS
    const dailyNeeds = filterByDateRange(needs, "created_at", todayStr);
    const dailyCredits = filterByDateRange(credits, "created_at", todayStr);
    const dailyProducts = filterByDateRange(products, "created_at", todayStr);
    
    const dailyMetrics = {
      date: todayStr,
      ...calculateMetrics(dailyNeeds, dailyCredits, dailyProducts, inventory),
    };

    console.log("Daily metrics calculated:", dailyMetrics);

    // Upsert daily metrics
    const { error: dailyError } = await supabase
      .from("impact_metrics_daily")
      .upsert(dailyMetrics, { onConflict: "date" });
    
    if (dailyError) {
      console.error("Error upserting daily metrics:", dailyError);
    } else {
      console.log("Daily metrics saved successfully");
    }

    // WEEKLY METRICS
    const weeklyNeeds = filterByDateRange(needs, "created_at", weekStartStr, weekEndStr);
    const weeklyCredits = filterByDateRange(credits, "created_at", weekStartStr, weekEndStr);
    const weeklyProducts = filterByDateRange(products, "created_at", weekStartStr, weekEndStr);
    
    const weeklyMetrics = {
      week_start: weekStartStr,
      week_end: weekEndStr,
      ...calculateMetrics(weeklyNeeds, weeklyCredits, weeklyProducts, inventory),
    };

    console.log("Weekly metrics calculated:", weeklyMetrics);

    const { error: weeklyError } = await supabase
      .from("impact_metrics_weekly")
      .upsert(weeklyMetrics, { onConflict: "week_start" });
    
    if (weeklyError) {
      console.error("Error upserting weekly metrics:", weeklyError);
    } else {
      console.log("Weekly metrics saved successfully");
    }

    // MONTHLY METRICS
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const monthEndStr = monthEnd.toISOString().split("T")[0];
    
    const monthlyNeeds = filterByDateRange(needs, "created_at", monthStartStr, monthEndStr);
    const monthlyCredits = filterByDateRange(credits, "created_at", monthStartStr, monthEndStr);
    const monthlyProducts = filterByDateRange(products, "created_at", monthStartStr, monthEndStr);
    
    const breakdowns = calculateBreakdowns(monthlyNeeds);
    
    const monthlyMetrics = {
      month: monthStartStr,
      ...calculateMetrics(monthlyNeeds, monthlyCredits, monthlyProducts, inventory),
      top_categories: breakdowns.topCategories,
      top_locations: breakdowns.topLocations,
    };

    console.log("Monthly metrics calculated:", monthlyMetrics);

    const { error: monthlyError } = await supabase
      .from("impact_metrics_monthly")
      .upsert(monthlyMetrics, { onConflict: "month" });
    
    if (monthlyError) {
      console.error("Error upserting monthly metrics:", monthlyError);
    } else {
      console.log("Monthly metrics saved successfully");
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Metrics aggregation completed",
        daily: dailyMetrics,
        weekly: weeklyMetrics,
        monthly: monthlyMetrics,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Metrics aggregation error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
