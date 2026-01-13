import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ShoppingBasket, FileText, Coins, LogOut, Home, Gift } from "lucide-react";
import { ProductsBrowser } from "@/components/beneficiary/ProductsBrowser";
import { NeedsRequestForm } from "@/components/beneficiary/NeedsRequestForm";
import { DignityCreditsTracker } from "@/components/producer/DignityCreditsTracker";
import { FulfilledNeedsList } from "@/components/beneficiary/FulfilledNeedsList";
import { WelcomeTour } from "@/components/tour/WelcomeTour";
import { NotificationBell } from "@/components/notifications/NotificationBell";

export default function BeneficiaryDashboard() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <WelcomeTour userType="beneficiary" userId={user.id} />
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Community Dashboard</h1>
            <p className="text-sm text-muted-foreground">Welcome, {user.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell userId={user.id} />
            <Button variant="ghost" onClick={() => navigate("/")} size="sm">
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
            <Button variant="outline" onClick={signOut} size="sm">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 max-w-lg">
            <TabsTrigger value="products" className="flex items-center gap-2">
              <ShoppingBasket className="w-4 h-4" />
              <span className="hidden sm:inline">Products</span>
            </TabsTrigger>
            <TabsTrigger value="needs" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Request</span>
            </TabsTrigger>
            <TabsTrigger value="fulfilled" className="flex items-center gap-2">
              <Gift className="w-4 h-4" />
              <span className="hidden sm:inline">Received</span>
            </TabsTrigger>
            <TabsTrigger value="credits" className="flex items-center gap-2">
              <Coins className="w-4 h-4" />
              <span className="hidden sm:inline">Credits</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <ProductsBrowser />
          </TabsContent>

          <TabsContent value="needs">
            <NeedsRequestForm userId={user.id} />
          </TabsContent>

          <TabsContent value="fulfilled">
            <FulfilledNeedsList userId={user.id} />
          </TabsContent>

          <TabsContent value="credits">
            <DignityCreditsTracker userId={user.id} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
