import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Package, ArrowRight, Coins } from "lucide-react";

interface FulfillmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  match: {
    need_id: string;
    inventory_id: string;
    product_name: string;
    need_title: string;
    need_quantity: number;
    need_unit: string;
    available_quantity: number;
    product_id?: string;
  } | null;
  onSuccess: () => void;
}

interface FulfillmentResponse {
  success: boolean;
  fulfillment?: {
    id: string;
    quantityFulfilled: number;
    creditsEarned: number;
    needTitle: string;
    productName: string;
  };
  error?: string;
}

export function FulfillmentDialog({
  open,
  onOpenChange,
  match,
  onSuccess,
}: FulfillmentDialogProps) {
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleFulfill = async () => {
    if (!match) return;

    const quantityNum = parseFloat(quantity);
    if (isNaN(quantityNum) || quantityNum <= 0) {
      toast({
        title: "Invalid Quantity",
        description: "Please enter a valid quantity greater than 0.",
        variant: "destructive",
      });
      return;
    }

    if (quantityNum > match.available_quantity) {
      toast({
        title: "Insufficient Inventory",
        description: `You only have ${match.available_quantity} available.`,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke<FulfillmentResponse>("fulfill-match", {
        body: {
          needId: match.need_id,
          productId: match.product_id || match.inventory_id,
          inventoryId: match.inventory_id,
          quantityFulfilled: quantityNum,
          notes: notes || undefined,
        },
      });

      if (error) throw error;

      if (data?.error) {
        toast({
          title: "Fulfillment Failed",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      if (data?.success && data.fulfillment) {
        toast({
          title: "Match Fulfilled! 🎉",
          description: `You've distributed ${data.fulfillment.quantityFulfilled} units and earned ${data.fulfillment.creditsEarned} Dignity Credits!`,
        });
        onSuccess();
        onOpenChange(false);
        setQuantity("");
        setNotes("");
      }
    } catch (error) {
      console.error("Error fulfilling match:", error);
      toast({
        title: "Error",
        description: "Failed to complete fulfillment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const estimatedCredits = quantity ? Math.round(parseFloat(quantity) * 10) : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Confirm Fulfillment</DialogTitle>
          <DialogDescription>
            Complete this match by specifying the quantity you're distributing.
          </DialogDescription>
        </DialogHeader>

        {match && (
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Package className="h-4 w-4" />
                  Your Product
                </div>
                <p className="font-medium">{match.product_name}</p>
                <p className="text-sm text-muted-foreground">
                  {match.available_quantity} available
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <div className="text-sm text-muted-foreground mb-1">Community Need</div>
                <p className="font-medium">{match.need_title}</p>
                <p className="text-sm text-muted-foreground">
                  {match.need_quantity} {match.need_unit} needed
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity to Fulfill</Label>
              <Input
                id="quantity"
                type="number"
                placeholder={`Max: ${match.available_quantity}`}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                max={match.available_quantity}
                min={1}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any notes about this fulfillment..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            {estimatedCredits > 0 && (
              <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg text-primary">
                <Coins className="h-5 w-5" />
                <span className="font-medium">
                  You'll earn {estimatedCredits} Dignity Credits
                </span>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleFulfill} disabled={loading || !quantity}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Confirm Fulfillment"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}