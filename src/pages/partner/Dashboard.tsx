import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from "recharts";
import { 
  Building2, LogOut, Users, Utensils, Leaf, TrendingUp, 
  Package, Heart, ArrowUpRight, ArrowDownRight 
} from "lucide-react";

// Mock data for charts - in production, this would come from aggregated database queries
const monthlyImpactData = [
  { month: "Jan", meals: 1200, people: 400, sustainability: 72 },
  { month: "Feb", meals: 1800, people: 580, sustainability: 74 },
  { month: "Mar", meals: 2400, people: 720, sustainability: 78 },
  { month: "Apr", meals: 3100, people: 950, sustainability: 80 },
  { month: "May", meals: 3800, people: 1150, sustainability: 82 },
  { month: "Jun", meals: 4200, people: 1320, sustainability: 85 },
];

const categoryDistribution = [
  { name: "Vegetables", value: 35, color: "hsl(var(--chart-1))" },
  { name: "Fruits", value: 25, color: "hsl(var(--chart-2))" },
  { name: "Dairy", value: 20, color: "hsl(var(--chart-3))" },
  { name: "Grains", value: 15, color: "hsl(var(--chart-4))" },
  { name: "Other", value: 5, color: "hsl(var(--chart-5))" },
];

const weeklyTrend = [
  { day: "Mon", distributed: 145, needs: 120 },
  { day: "Tue", distributed: 168, needs: 150 },
  { day: "Wed", distributed: 190, needs: 180 },
  { day: "Thu", distributed: 210, needs: 195 },
  { day: "Fri", distributed: 250, needs: 230 },
  { day: "Sat", distributed: 180, needs: 160 },
  { day: "Sun", distributed: 120, needs: 100 },
];

interface StatCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  description: string;
}

function StatCard({ title, value, change, icon, description }: StatCardProps) {
  const isPositive = change >= 0;
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="p-2 bg-primary/10 rounded-lg">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center gap-1 text-xs mt-1">
          {isPositive ? (
            <ArrowUpRight className="h-3 w-3 text-green-600" />
          ) : (
            <ArrowDownRight className="h-3 w-3 text-red-600" />
          )}
          <span className={isPositive ? "text-green-600" : "text-red-600"}>
            {isPositive ? "+" : ""}{change}%
          </span>
          <span className="text-muted-foreground">{description}</span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function PartnerDashboard() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalMeals: 0,
    peopleHelped: 0,
    avgSustainability: 0,
    activeProducers: 0,
    openNeeds: 0,
    matchRate: 0,
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      // Fetch real stats from database
      const [inventoryRes, needsRes, productsRes] = await Promise.all([
        supabase.from("inventory").select("available_quantity, products(sustainability_score)"),
        supabase.from("community_needs").select("status, quantity_needed"),
        supabase.from("products").select("producer_id").eq("is_active", true),
      ]);

      const totalQuantity = inventoryRes.data?.reduce((sum, i) => sum + (i.available_quantity || 0), 0) || 0;
      const openNeeds = needsRes.data?.filter(n => n.status === "open").length || 0;
      const matchedNeeds = needsRes.data?.filter(n => n.status === "matched").length || 0;
      const totalNeeds = needsRes.data?.length || 1;
      
      const sustainabilityScores = inventoryRes.data
        ?.map(i => (i.products as any)?.sustainability_score)
        .filter(Boolean) || [];
      const avgSustainability = sustainabilityScores.length 
        ? Math.round(sustainabilityScores.reduce((a, b) => a + b, 0) / sustainabilityScores.length)
        : 0;

      const uniqueProducers = new Set(productsRes.data?.map(p => p.producer_id)).size;

      // Estimate meals (1 unit ≈ 2 meals on average)
      const estimatedMeals = Math.round(totalQuantity * 2);
      // Estimate people helped (1 meal = 1 person served)
      const peopleHelped = Math.round(estimatedMeals * 0.8);

      setStats({
        totalMeals: estimatedMeals,
        peopleHelped: peopleHelped,
        avgSustainability: avgSustainability,
        activeProducers: uniqueProducers,
        openNeeds: openNeeds,
        matchRate: Math.round((matchedNeeds / totalNeeds) * 100),
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-semibold text-lg">Partner Analytics Dashboard</h1>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => navigate("/")} size="sm">
              Home
            </Button>
            <Button variant="outline" onClick={signOut} size="sm">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Meals Distributed"
            value={stats.totalMeals.toLocaleString()}
            change={12.5}
            icon={<Utensils className="h-4 w-4 text-primary" />}
            description="vs last month"
          />
          <StatCard
            title="People Helped"
            value={stats.peopleHelped.toLocaleString()}
            change={8.2}
            icon={<Users className="h-4 w-4 text-primary" />}
            description="vs last month"
          />
          <StatCard
            title="Avg Sustainability Score"
            value={`${stats.avgSustainability}/100`}
            change={3.1}
            icon={<Leaf className="h-4 w-4 text-primary" />}
            description="improvement"
          />
          <StatCard
            title="Match Success Rate"
            value={`${stats.matchRate}%`}
            change={5.4}
            icon={<TrendingUp className="h-4 w-4 text-primary" />}
            description="vs last month"
          />
        </div>

        {/* Additional Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Producers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeProducers}</div>
              <p className="text-xs text-muted-foreground">Contributing to the network</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Open Needs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.openNeeds}</div>
              <p className="text-xs text-muted-foreground">Awaiting fulfillment</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Network Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+24%</div>
              <p className="text-xs text-muted-foreground">Month over month</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <Tabs defaultValue="impact" className="space-y-6">
          <TabsList>
            <TabsTrigger value="impact">Impact Over Time</TabsTrigger>
            <TabsTrigger value="distribution">Distribution</TabsTrigger>
            <TabsTrigger value="weekly">Weekly Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="impact" className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Meals Distributed & People Helped</CardTitle>
                  <CardDescription>Monthly impact metrics over the past 6 months</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={monthlyImpactData}>
                      <defs>
                        <linearGradient id="colorMeals" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorPeople" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "hsl(var(--card))", 
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px"
                        }} 
                      />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="meals" 
                        stroke="hsl(var(--primary))" 
                        fillOpacity={1} 
                        fill="url(#colorMeals)" 
                        name="Meals"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="people" 
                        stroke="hsl(var(--chart-2))" 
                        fillOpacity={1} 
                        fill="url(#colorPeople)" 
                        name="People"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Sustainability Score Trend</CardTitle>
                  <CardDescription>Average sustainability score progression</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyImpactData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis domain={[60, 100]} className="text-xs" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "hsl(var(--card))", 
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px"
                        }} 
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="sustainability" 
                        stroke="hsl(142 76% 36%)" 
                        strokeWidth={3}
                        dot={{ fill: "hsl(142 76% 36%)", strokeWidth: 2 }}
                        name="Sustainability Score"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="distribution" className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Distribution by Category</CardTitle>
                  <CardDescription>Breakdown of distributed products by category</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={categoryDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {categoryDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "hsl(var(--card))", 
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px"
                        }} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Category Details</CardTitle>
                  <CardDescription>Detailed breakdown with metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {categoryDistribution.map((category, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: category.color }}
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{category.name}</span>
                            <span className="text-sm text-muted-foreground">{category.value}%</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full transition-all"
                              style={{ 
                                width: `${category.value}%`, 
                                backgroundColor: category.color 
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="weekly" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Distribution vs Needs</CardTitle>
                <CardDescription>Comparison of products distributed against community needs</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={weeklyTrend}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="day" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }} 
                    />
                    <Legend />
                    <Bar dataKey="distributed" fill="hsl(var(--primary))" name="Distributed" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="needs" fill="hsl(var(--chart-4))" name="Needs Fulfilled" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Impact Summary */}
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              Community Impact Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">
                  {Math.round(stats.totalMeals * 0.4)} kg
                </div>
                <p className="text-sm text-muted-foreground">Food waste prevented</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">
                  {Math.round(stats.totalMeals * 2.5)} kg
                </div>
                <p className="text-sm text-muted-foreground">CO₂ emissions saved</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">
                  ${Math.round(stats.totalMeals * 3.5).toLocaleString()}
                </div>
                <p className="text-sm text-muted-foreground">Economic value created</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
