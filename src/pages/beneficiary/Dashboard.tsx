import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ShoppingBasket, FileText, Coins, LogOut } from "lucide-react";
import { ProductsBrowser } from "@/components/beneficiary/ProductsBrowser";
import { NeedsRequestForm } from "@/components/beneficiary/NeedsRequestForm";
import { DignityCreditsTracker } from "@/components/producer/DignityCreditsTracker";

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
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Community Dashboard</h1>
            <p className="text-sm text-muted-foreground">Welcome, {user.email}</p>
          </div>
          <Button variant="outline" onClick={signOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="products" className="flex items-center gap-2">
              <ShoppingBasket className="w-4 h-4" />
              <span className="hidden sm:inline">Products</span>
            </TabsTrigger>
            <TabsTrigger value="needs" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Request</span>
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

          <TabsContent value="credits">
            <DignityCreditsTracker userId={user.id} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
