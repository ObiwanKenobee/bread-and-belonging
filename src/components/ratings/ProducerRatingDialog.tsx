import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Star, Heart } from "lucide-react";

interface ProducerRatingDialogProps {
  fulfillmentId: string;
  producerId: string;
  beneficiaryId: string;
  productName: string;
  onRatingSubmitted?: () => void;
  trigger?: React.ReactNode;
}

export function ProducerRatingDialog({
  fulfillmentId,
  producerId,
  beneficiaryId,
  productName,
  onRatingSubmitted,
  trigger,
}: ProducerRatingDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [thankYouMessage, setThankYouMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: "Please select a rating",
        description: "Choose how many stars you'd like to give.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("producer_ratings").insert({
        fulfillment_id: fulfillmentId,
        producer_id: producerId,
        beneficiary_id: beneficiaryId,
        rating,
        thank_you_message: thankYouMessage || null,
      });

      if (error) throw error;

      toast({
        title: "Thank you sent! 💝",
        description: "Your appreciation has been shared with the producer.",
      });

      setIsOpen(false);
      setRating(0);
      setThankYouMessage("");
      onRatingSubmitted?.();
    } catch (error) {
      console.error("Error submitting rating:", error);
      toast({
        title: "Error",
        description: "Failed to submit your rating. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Heart className="mr-2 h-4 w-4" />
            Say Thanks
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            Thank Your Producer
          </DialogTitle>
          <DialogDescription>
            Show your appreciation for receiving {productName}. Your feedback helps
            build trust in our community.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Star Rating */}
          <div className="space-y-2">
            <label className="text-sm font-medium">How was your experience?</label>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="transition-transform hover:scale-110"
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(star)}
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoveredRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground"
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-center text-sm text-muted-foreground">
              {rating === 1 && "Could be better"}
              {rating === 2 && "Okay"}
              {rating === 3 && "Good"}
              {rating === 4 && "Great!"}
              {rating === 5 && "Amazing! 🌟"}
            </p>
          </div>

          {/* Thank You Message */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Add a personal thank you (optional)
            </label>
            <Textarea
              placeholder="Write a message to the producer..."
              value={thankYouMessage}
              onChange={(e) => setThankYouMessage(e.target.value)}
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">
              {thankYouMessage.length}/500
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || rating === 0}>
            {isSubmitting ? "Sending..." : "Send Thanks"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
