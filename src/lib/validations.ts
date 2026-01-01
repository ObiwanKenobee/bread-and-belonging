import { z } from "zod";

// Auth validation schemas
export const signInSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }).max(255, { message: "Email must be less than 255 characters" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }).max(72, { message: "Password must be less than 72 characters" }),
});

export const signUpSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }).max(255, { message: "Email must be less than 255 characters" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }).max(72, { message: "Password must be less than 72 characters" }),
  fullName: z.string().trim().min(2, { message: "Name must be at least 2 characters" }).max(100, { message: "Name must be less than 100 characters" }),
  userType: z.enum(["producer", "beneficiary", "partner"], { required_error: "Please select a role" }),
});

// Community needs validation schema
export const communityNeedSchema = z.object({
  title: z.string().trim().min(3, { message: "Title must be at least 3 characters" }).max(200, { message: "Title must be less than 200 characters" }),
  description: z.string().max(1000, { message: "Description must be less than 1000 characters" }).optional().nullable(),
  category: z.enum(["vegetables", "fruits", "dairy", "grains", "protein", "bread", "eggs", "other"], { required_error: "Please select a category" }),
  quantity_needed: z.number().positive({ message: "Quantity must be positive" }).optional().nullable(),
  unit: z.string().max(50, { message: "Unit must be less than 50 characters" }).optional().nullable(),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  location: z.string().max(200, { message: "Location must be less than 200 characters" }).optional().nullable(),
});

export type SignInFormData = z.infer<typeof signInSchema>;
export type SignUpFormData = z.infer<typeof signUpSchema>;
export type CommunityNeedFormData = z.infer<typeof communityNeedSchema>;
