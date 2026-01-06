import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAdminRole } from "@/hooks/useAdminRole";
import { UserRoleManager } from "@/components/admin/UserRoleManager";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Shield, ArrowLeft, Users, Briefcase, UserCog } from "lucide-react";

export default function AdminDashboard() {
  const { isAdmin, loading, userId } = useAdminRole();
  const navigate = useNavigate();

  // Fetch role counts
  const { data: roleCounts } = useQuery({
    queryKey: ["admin-role-counts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role");
      
      if (error) throw error;

      const counts = { admin: 0, producer: 0, partner: 0, beneficiary: 0, total: 0 };
      data?.forEach((row) => {
        counts[row.role as keyof typeof counts]++;
        counts.total++;
      });
      
      return counts;
    },
    enabled: isAdmin,
  });

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate("/auth");
    }
  }, [loading, isAdmin, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-destructive/10 rounded-full flex items-center justify-center">
              <Shield className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">Manage users and system settings</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Stats overview */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{roleCounts?.total ?? "—"}</div>
              <p className="text-xs text-muted-foreground">Users with assigned roles</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Producers</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{roleCounts?.producer ?? "—"}</div>
              <p className="text-xs text-muted-foreground">Active producer accounts</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Partners</CardTitle>
              <UserCog className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{roleCounts?.partner ?? "—"}</div>
              <p className="text-xs text-muted-foreground">Impact partner accounts</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Admins</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{roleCounts?.admin ?? "—"}</div>
              <p className="text-xs text-muted-foreground">System administrators</p>
            </CardContent>
          </Card>
        </div>

        {/* User Role Manager */}
        <UserRoleManager />
      </main>
    </div>
  );
}
