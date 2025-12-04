import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Leaf, Search, Package } from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string | null;
  category: string;
  unit: string;
  price_per_unit: number | null;
  sustainability_score: number | null;
}

interface InventoryWithProduct {
  id: string;
  quantity: number;
  available_quantity: number;
  location: string | null;
  expiry_date: string | null;
  product: Product;
}

export function ProductsBrowser() {
  const [inventory, setInventory] = useState<InventoryWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  useEffect(() => {
    fetchAvailableProducts();
  }, []);

  const fetchAvailableProducts = async () => {
    const { data, error } = await supabase
      .from("inventory")
      .select(`
        id,
        quantity,
        available_quantity,
        location,
        expiry_date,
        product:products (
          id,
          name,
          description,
          category,
          unit,
          price_per_unit,
          sustainability_score
        )
      `)
      .gt("available_quantity", 0);

    if (error) {
      console.error("Error fetching products:", error);
    } else {
      const typedData = (data || []).map((item: any) => ({
        ...item,
        product: item.product as Product
      }));
      setInventory(typedData);
    }
    setLoading(false);
  };

  const categories = [...new Set(inventory.map((item) => item.product.category))];

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch = item.product.name.toLowerCase().includes(search.toLowerCase()) ||
      item.product.description?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || item.product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      vegetables: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      fruits: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      dairy: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      grains: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
      protein: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    };
    return colors[category.toLowerCase()] || "bg-muted text-muted-foreground";
  };

  if (loading) {
    return <p className="text-muted-foreground">Loading available products...</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Available Products</h2>
        <p className="text-muted-foreground">Browse products available in your community</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredInventory.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No products available matching your criteria</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredInventory.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{item.product.name}</CardTitle>
                  <Badge className={getCategoryColor(item.product.category)}>
                    {item.product.category}
                  </Badge>
                </div>
                <CardDescription>{item.product.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Available:</span>
                  <span className="font-medium text-foreground">
                    {item.available_quantity} {item.product.unit}
                  </span>
                </div>
                
                {item.location && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Location:</span>
                    <span className="text-foreground">{item.location}</span>
                  </div>
                )}

                {item.expiry_date && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Best before:</span>
                    <span className="text-foreground">
                      {new Date(item.expiry_date).toLocaleDateString()}
                    </span>
                  </div>
                )}

                {item.product.sustainability_score && (
                  <div className="flex items-center gap-2 pt-2 border-t">
                    <Leaf className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-muted-foreground">
                      Sustainability: {item.product.sustainability_score}/100
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
