import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Clock, CheckCircle, XCircle } from "lucide-react";
import { communityNeedSchema, type CommunityNeedFormData } from "@/lib/validations";

interface NeedRequest {
  id: string;
  title: string;
  description: string | null;
  category: string;
  quantity_needed: number | null;
  unit: string | null;
  priority: string | null;
  status: string | null;
  created_at: string | null;
}

const CATEGORIES = ["vegetables", "fruits", "dairy", "grains", "protein", "bread", "eggs", "other"] as const;
const PRIORITIES = ["low", "medium", "high", "urgent"] as const;

export function NeedsRequestForm({ userId }: { userId: string }) {
  const [requests, setRequests] = useState<NeedRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    quantity_needed: "",
    unit: "",
    priority: "medium",
    location: "",
  });

  useEffect(() => {
    fetchMyRequests();
  }, [userId]);

  const fetchMyRequests = async () => {
    const { data, error } = await supabase
      .from("community_needs")
      .select("*")
      .eq("created_by", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching requests:", error);
    } else {
      setRequests(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Prepare data for validation
    const dataToValidate: CommunityNeedFormData = {
      title: formData.title,
      description: formData.description || null,
      category: formData.category as CommunityNeedFormData["category"],
      quantity_needed: formData.quantity_needed ? parseFloat(formData.quantity_needed) : null,
      unit: formData.unit || null,
      priority: (formData.priority || "medium") as CommunityNeedFormData["priority"],
      location: formData.location || null,
    };

    const validation = communityNeedSchema.safeParse(dataToValidate);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0].toString()] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);

    const { error } = await supabase.from("community_needs").insert({
      title: validation.data.title,
      description: validation.data.description,
      category: validation.data.category,
      quantity_needed: validation.data.quantity_needed,
      unit: validation.data.unit,
      priority: validation.data.priority,
      location: validation.data.location,
      created_by: userId,
      status: "open",
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to submit request. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Request Submitted",
        description: "Your need has been posted to the community.",
      });
      setFormData({
        title: "",
        description: "",
        category: "",
        quantity_needed: "",
        unit: "",
        priority: "medium",
        location: "",
      });
      setShowForm(false);
      fetchMyRequests();
    }
    setSubmitting(false);
  };

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case "open":
        return <Clock className="w-4 h-4 text-amber-500" />;
      case "matched":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "fulfilled":
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      default:
        return <XCircle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string | null) => {
    const variants: Record<string, string> = {
      open: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
      matched: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      fulfilled: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    };
    return variants[status || ""] || "bg-muted text-muted-foreground";
  };

  if (loading) {
    return <p className="text-muted-foreground">Loading your requests...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-foreground">My Requests</h2>
          <p className="text-muted-foreground">Submit needs and track their status</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" />
          New Request
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Submit a Need Request</CardTitle>
            <CardDescription>Let the community know what you need</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">What do you need? *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Fresh vegetables for family"
                    className={errors.title ? "border-destructive" : ""}
                  />
                  {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger className={errors.category ? "border-destructive" : ""}>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && <p className="text-sm text-destructive">{errors.category}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide more details about your need..."
                  rows={3}
                  className={errors.description ? "border-destructive" : ""}
                />
                {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={formData.quantity_needed}
                    onChange={(e) => setFormData({ ...formData, quantity_needed: e.target.value })}
                    placeholder="e.g., 5"
                    className={errors.quantity_needed ? "border-destructive" : ""}
                  />
                  {errors.quantity_needed && <p className="text-sm text-destructive">{errors.quantity_needed}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit</Label>
                  <Input
                    id="unit"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="e.g., kg, bags"
                    className={errors.unit ? "border-destructive" : ""}
                  />
                  {errors.unit && <p className="text-sm text-destructive">{errors.unit}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => setFormData({ ...formData, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITIES.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p.charAt(0).toUpperCase() + p.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Your Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Downtown Community Center"
                  className={errors.location ? "border-destructive" : ""}
                />
                {errors.location && <p className="text-sm text-destructive">{errors.location}</p>}
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit Request"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {requests.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">You haven't submitted any requests yet.</p>
            <Button className="mt-4" onClick={() => setShowForm(true)}>
              Submit Your First Request
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <Card key={request.id}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {getStatusIcon(request.status)}
                    <div>
                      <h3 className="font-medium text-foreground">{request.title}</h3>
                      {request.description && (
                        <p className="text-sm text-muted-foreground mt-1">{request.description}</p>
                      )}
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="outline">{request.category}</Badge>
                        {request.quantity_needed && request.unit && (
                          <Badge variant="secondary">
                            {request.quantity_needed} {request.unit}
                          </Badge>
                        )}
                        <Badge className={getStatusBadge(request.status)}>
                          {request.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {request.created_at && new Date(request.created_at).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
