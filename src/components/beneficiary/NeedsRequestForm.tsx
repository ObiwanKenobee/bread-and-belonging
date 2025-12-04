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

const CATEGORIES = ["vegetables", "fruits", "dairy", "grains", "protein", "bread", "eggs", "other"];
const PRIORITIES = ["low", "medium", "high", "urgent"];

export function NeedsRequestForm({ userId }: { userId: string }) {
  const [requests, setRequests] = useState<NeedRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
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
    setSubmitting(true);

    const { error } = await supabase.from("community_needs").insert({
      title: formData.title,
      description: formData.description || null,
      category: formData.category,
      quantity_needed: formData.quantity_needed ? parseFloat(formData.quantity_needed) : null,
      unit: formData.unit || null,
      priority: formData.priority,
      location: formData.location || null,
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
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                    required
                  >
                    <SelectTrigger>
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
                />
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
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit</Label>
                  <Input
                    id="unit"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="e.g., kg, bags"
                  />
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
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={submitting || !formData.title || !formData.category}>
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
