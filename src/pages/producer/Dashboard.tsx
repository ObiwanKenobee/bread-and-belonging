import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ProductsList } from "@/components/producer/ProductsList";
import { InventoryManager } from "@/components/producer/InventoryManager";
import { DignityCreditsTracker } from "@/components/producer/DignityCreditsTracker";
import { CommunityNeeds } from "@/components/producer/CommunityNeeds";
import { MatchAndMultiply } from "@/components/producer/MatchAndMultiply";
import { FulfillmentHistory } from "@/components/producer/FulfillmentHistory";
import { Wheat, LogOut, Package, Boxes, Coins, Heart, Sparkles, History } from "lucide-react";

export default function ProducerDashboard() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

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
              <Wheat className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-semibold text-lg">Producer Dashboard</h1>
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
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="matches" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:inline-grid">
            <TabsTrigger value="matches" className="gap-2">
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">AI Match</span>
            </TabsTrigger>
            <TabsTrigger value="fulfillments" className="gap-2">
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">Fulfillments</span>
            </TabsTrigger>
            <TabsTrigger value="products" className="gap-2">
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">Products</span>
            </TabsTrigger>
            <TabsTrigger value="inventory" className="gap-2">
              <Boxes className="w-4 h-4" />
              <span className="hidden sm:inline">Inventory</span>
            </TabsTrigger>
            <TabsTrigger value="credits" className="gap-2">
              <Coins className="w-4 h-4" />
              <span className="hidden sm:inline">Credits</span>
            </TabsTrigger>
            <TabsTrigger value="needs" className="gap-2">
              <Heart className="w-4 h-4" />
              <span className="hidden sm:inline">Needs</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="matches">
            <MatchAndMultiply />
          </TabsContent>

          <TabsContent value="fulfillments">
            <FulfillmentHistory userId={user.id} />
          </TabsContent>

          <TabsContent value="products">
            <ProductsList userId={user.id} />
          </TabsContent>

          <TabsContent value="inventory">
            <InventoryManager userId={user.id} />
          </TabsContent>

          <TabsContent value="credits">
            <DignityCreditsTracker userId={user.id} />
          </TabsContent>

          <TabsContent value="needs">
            <CommunityNeeds userId={user.id} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
