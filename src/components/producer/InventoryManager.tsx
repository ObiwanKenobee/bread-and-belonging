import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Package, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

interface Product {
  id: string;
  name: string;
  unit: string;
}

interface InventoryItem {
  id: string;
  product_id: string;
  quantity: number;
  available_quantity: number;
  reserved_quantity: number;
  expiry_date: string | null;
  location: string | null;
  last_updated: string;
  products: Product;
}

export function InventoryManager({ userId }: { userId: string }) {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    product_id: "",
    quantity: "",
    location: "",
    expiry_date: "",
  });

  useEffect(() => {
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    const [inventoryRes, productsRes] = await Promise.all([
      supabase
        .from("inventory")
        .select("*, products(id, name, unit)")
        .order("last_updated", { ascending: false }),
      supabase.from("products").select("id, name, unit").eq("producer_id", userId),
    ]);

    if (inventoryRes.error) {
      toast({ title: "Error loading inventory", description: inventoryRes.error.message, variant: "destructive" });
    } else {
      setInventory(inventoryRes.data as unknown as InventoryItem[] || []);
    }

    if (productsRes.data) {
      setProducts(productsRes.data);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const quantity = parseFloat(formData.quantity);
    const inventoryData = {
      product_id: formData.product_id,
      quantity,
      available_quantity: quantity,
      reserved_quantity: 0,
      location: formData.location || null,
      expiry_date: formData.expiry_date || null,
    };

    const { error } = await supabase.from("inventory").insert(inventoryData);

    if (error) {
      toast({ title: "Error adding inventory", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Inventory added!" });
      fetchData();
    }

    setFormData({ product_id: "", quantity: "", location: "", expiry_date: "" });
    setDialogOpen(false);
  };

  const updateQuantity = async (id: string, newQuantity: number) => {
    const item = inventory.find((i) => i.id === id);
    if (!item) return;

    const availableQuantity = newQuantity - item.reserved_quantity;

    const { error } = await supabase
      .from("inventory")
      .update({ quantity: newQuantity, available_quantity: availableQuantity })
      .eq("id", id);

    if (error) {
      toast({ title: "Error updating inventory", description: error.message, variant: "destructive" });
    } else {
      fetchData();
    }
  };

  const isExpiringSoon = (date: string | null) => {
    if (!date) return false;
    const expiryDate = new Date(date);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  };

  const isExpired = (date: string | null) => {
    if (!date) return false;
    return new Date(date) < new Date();
  };

  if (loading) {
    return <div className="text-center py-8">Loading inventory...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Inventory Management</h2>
          <p className="text-muted-foreground">Track your stock levels and availability</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={products.length === 0}>
              <Plus className="w-4 h-4 mr-2" />
              Add Stock
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Inventory Stock</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Product *</Label>
                <Select value={formData.product_id} onValueChange={(v) => setFormData({ ...formData, product_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    step="0.01"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., Warehouse A"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiry">Expiry Date</Label>
                <Input
                  id="expiry"
                  type="date"
                  value={formData.expiry_date}
                  onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                />
              </div>
              <Button type="submit" className="w-full">Add Stock</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {products.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Add products first before managing inventory.</p>
          </CardContent>
        </Card>
      ) : inventory.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-muted-foreground">No inventory records yet. Add stock to get started!</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Current Stock</CardTitle>
            <CardDescription>Manage quantities and track expiry dates</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Available</TableHead>
                  <TableHead>Reserved</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.products?.name}</TableCell>
                    <TableCell>
                      <span className="text-green-600 font-semibold">
                        {item.available_quantity} {item.products?.unit}
                      </span>
                    </TableCell>
                    <TableCell>
                      {item.reserved_quantity > 0 && (
                        <span className="text-amber-600">{item.reserved_quantity} {item.products?.unit}</span>
                      )}
                    </TableCell>
                    <TableCell>{item.quantity} {item.products?.unit}</TableCell>
                    <TableCell>{item.location || "-"}</TableCell>
                    <TableCell>
                      {item.expiry_date ? (
                        <div className="flex items-center gap-2">
                          {isExpired(item.expiry_date) ? (
                            <Badge variant="destructive">Expired</Badge>
                          ) : isExpiringSoon(item.expiry_date) ? (
                            <>
                              <AlertTriangle className="w-4 h-4 text-amber-500" />
                              <span className="text-amber-600">{format(new Date(item.expiry_date), "MMM d")}</span>
                            </>
                          ) : (
                            <span>{format(new Date(item.expiry_date), "MMM d, yyyy")}</span>
                          )}
                        </div>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          className="w-20 h-8"
                          defaultValue={item.quantity}
                          onBlur={(e) => {
                            const newVal = parseFloat(e.target.value);
                            if (newVal !== item.quantity) {
                              updateQuantity(item.id, newVal);
                            }
                          }}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
