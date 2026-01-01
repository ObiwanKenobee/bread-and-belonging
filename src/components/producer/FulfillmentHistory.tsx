import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, Coins, Package, Calendar as CalendarIcon, MapPin, Loader2, Search, X, Filter } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

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

const CATEGORIES = ["all", "vegetables", "fruits", "dairy", "grains", "protein", "bread", "eggs", "other"];

export function FulfillmentHistory({ userId }: { userId: string }) {
  const [fulfillments, setFulfillments] = useState<Fulfillment[]>([]);
  const [credits, setCredits] = useState<CreditTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCredits, setTotalCredits] = useState(0);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [showFilters, setShowFilters] = useState(false);

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

  // Filter fulfillments based on search, category, and date range
  const filteredFulfillments = useMemo(() => {
    return fulfillments.filter((fulfillment) => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery || 
        fulfillment.community_need?.title.toLowerCase().includes(searchLower) ||
        fulfillment.product?.name.toLowerCase().includes(searchLower) ||
        fulfillment.community_need?.location?.toLowerCase().includes(searchLower) ||
        fulfillment.notes?.toLowerCase().includes(searchLower);

      // Category filter
      const matchesCategory = categoryFilter === "all" || 
        fulfillment.community_need?.category === categoryFilter;

      // Date range filter
      const fulfillmentDate = new Date(fulfillment.fulfilled_at);
      const matchesStartDate = !startDate || fulfillmentDate >= startDate;
      const matchesEndDate = !endDate || fulfillmentDate <= new Date(endDate.setHours(23, 59, 59, 999));

      return matchesSearch && matchesCategory && matchesStartDate && matchesEndDate;
    });
  }, [fulfillments, searchQuery, categoryFilter, startDate, endDate]);

  // Calculate filtered stats
  const filteredStats = useMemo(() => {
    const quantity = filteredFulfillments.reduce((sum, f) => sum + Number(f.quantity_fulfilled), 0);
    const filteredCredits = credits.filter(c => 
      filteredFulfillments.some(f => c.description?.includes(f.community_need?.title || ""))
    );
    const creditsTotal = filteredCredits.reduce((sum, c) => sum + Number(c.amount), 0);
    return { count: filteredFulfillments.length, quantity, credits: creditsTotal };
  }, [filteredFulfillments, credits]);

  const clearFilters = () => {
    setSearchQuery("");
    setCategoryFilter("all");
    setStartDate(undefined);
    setEndDate(undefined);
  };

  const hasActiveFilters = searchQuery || categoryFilter !== "all" || startDate || endDate;

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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Fulfillment History</CardTitle>
              <CardDescription>
                Your completed matches and community impact
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(hasActiveFilters && "border-primary")}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2">
                  Active
                </Badge>
              )}
            </Button>
          </div>

          {/* Filters Section */}
          {showFilters && (
            <div className="mt-4 p-4 border rounded-lg bg-muted/30 space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 space-y-2">
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search by need, product, or location..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                {/* Category */}
                <div className="w-full sm:w-48 space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat === "all" ? "All Categories" : cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                {/* Start Date */}
                <div className="space-y-2">
                  <Label>From Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full sm:w-[200px] justify-start text-left font-normal",
                          !startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* End Date */}
                <div className="space-y-2">
                  <Label>To Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full sm:w-[200px] justify-start text-left font-normal",
                          !endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Clear Filters */}
                {hasActiveFilters && (
                  <div className="flex items-end">
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      <X className="h-4 w-4 mr-2" />
                      Clear Filters
                    </Button>
                  </div>
                )}
              </div>

              {/* Filtered Stats */}
              {hasActiveFilters && (
                <div className="flex flex-wrap gap-4 pt-2 text-sm text-muted-foreground border-t">
                  <span>
                    Showing <strong className="text-foreground">{filteredStats.count}</strong> of {fulfillments.length} fulfillments
                  </span>
                  <span>•</span>
                  <span>
                    <strong className="text-foreground">{filteredStats.quantity.toLocaleString()}</strong> units
                  </span>
                  <span>•</span>
                  <span>
                    <strong className="text-foreground">{filteredStats.credits.toLocaleString()}</strong> DC earned
                  </span>
                </div>
              )}
            </div>
          )}
        </CardHeader>
        <CardContent>
          {filteredFulfillments.length === 0 ? (
            <div className="py-12 text-center">
              <CheckCircle2 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {hasActiveFilters ? "No Matching Fulfillments" : "No Fulfillments Yet"}
              </h3>
              <p className="text-muted-foreground">
                {hasActiveFilters 
                  ? "Try adjusting your filters to find what you're looking for."
                  : "Accept and fulfill matches to see your impact history here."}
              </p>
              {hasActiveFilters && (
                <Button variant="outline" className="mt-4" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFulfillments.map((fulfillment) => {
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
                          <CalendarIcon className="h-4 w-4" />
                          {formatDate(fulfillment.fulfilled_at)}
                        </div>

                        <Badge variant="outline" className="text-xs">
                          {fulfillment.community_need?.category}
                        </Badge>
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
