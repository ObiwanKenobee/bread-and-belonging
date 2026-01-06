import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search, UserCog, Shield, Users, Briefcase } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

const roleConfig: Record<AppRole, { label: string; icon: typeof Shield; color: string }> = {
  admin: { label: "Admin", icon: Shield, color: "bg-destructive text-destructive-foreground" },
  producer: { label: "Producer", icon: Briefcase, color: "bg-primary text-primary-foreground" },
  partner: { label: "Partner", icon: Users, color: "bg-accent text-accent-foreground" },
  beneficiary: { label: "Beneficiary", icon: UserCog, color: "bg-secondary text-secondary-foreground" },
};

interface UserWithRoles {
  id: string;
  full_name: string | null;
  user_type: string | null;
  roles: AppRole[];
}

export function UserRoleManager() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<AppRole | "all">("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all profiles with their roles
  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users", searchTerm, selectedRole],
    queryFn: async () => {
      // Fetch profiles
      let profilesQuery = supabase
        .from("profiles")
        .select("id, full_name, user_type")
        .order("created_at", { ascending: false });

      if (searchTerm) {
        profilesQuery = profilesQuery.ilike("full_name", `%${searchTerm}%`);
      }

      const { data: profiles, error: profilesError } = await profilesQuery;

      if (profilesError) throw profilesError;

      // Fetch all roles
      const { data: allRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (rolesError) throw rolesError;

      // Map roles to users
      const usersWithRoles: UserWithRoles[] = (profiles || []).map((profile) => ({
        ...profile,
        roles: (allRoles || [])
          .filter((r) => r.user_id === profile.id)
          .map((r) => r.role) as AppRole[],
      }));

      // Filter by selected role if needed
      if (selectedRole !== "all") {
        return usersWithRoles.filter((u) => u.roles.includes(selectedRole));
      }

      return usersWithRoles;
    },
  });

  // Add role mutation
  const addRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast({ title: "Role added successfully" });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Failed to add role", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  // Remove role mutation
  const removeRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role", role);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast({ title: "Role removed successfully" });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Failed to remove role", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const handleAddRole = (userId: string, role: AppRole) => {
    addRoleMutation.mutate({ userId, role });
  };

  const handleRemoveRole = (userId: string, role: AppRole) => {
    removeRoleMutation.mutate({ userId, role });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCog className="h-5 w-5" />
          User Role Management
        </CardTitle>
        <CardDescription>
          Manage user roles and permissions. Assign producer, partner, or admin roles.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as AppRole | "all")}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admins</SelectItem>
              <SelectItem value="producer">Producers</SelectItem>
              <SelectItem value="partner">Partners</SelectItem>
              <SelectItem value="beneficiary">Beneficiaries</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Users table */}
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : users && users.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Current Roles</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{user.full_name || "Unnamed User"}</p>
                        <p className="text-sm text-muted-foreground">
                          Type: {user.user_type || "Not set"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.roles.length > 0 ? (
                          user.roles.map((role) => {
                            const config = roleConfig[role];
                            return (
                              <Badge
                                key={role}
                                variant="secondary"
                                className={`${config.color} cursor-pointer hover:opacity-80`}
                                onClick={() => handleRemoveRole(user.id, role)}
                                title="Click to remove"
                              >
                                {config.label} ×
                              </Badge>
                            );
                          })
                        ) : (
                          <span className="text-sm text-muted-foreground">No roles assigned</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Select
                        onValueChange={(role) => handleAddRole(user.id, role as AppRole)}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue placeholder="Add role" />
                        </SelectTrigger>
                        <SelectContent>
                          {(Object.keys(roleConfig) as AppRole[])
                            .filter((role) => !user.roles.includes(role))
                            .map((role) => (
                              <SelectItem key={role} value={role}>
                                {roleConfig[role].label}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No users found matching your criteria.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
