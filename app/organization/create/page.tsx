"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

// Zod Schema for validation
const organizationSchema = z.object({
  name: z
    .string()
    .min(3, "Organization name must be at least 3 characters long")
    .max(50, "Organization name must be under 50 characters"),
});

export default function CreateOrganization() {
  const { data: session } = useSession();
  const router = useRouter();
  const [error, setError] = useState("");

  // React Hook Form with Zod Validation
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(organizationSchema),
  });

  const handleCreate = async (data: { name: string }) => {
    if (!session?.user?.id) {
      setError("Not authenticated");
      return;
    }

    const response = await fetch("/api/organization", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: data.name, userId: session.user.id }),
    });

    const resData = await response.json();
    if (response.ok) {
      toast.success("Organization created successfully!");
      router.push(`/dashboard/${resData.slug}`);
    } else {
      setError(resData.error || "Could not create organization");
    }
  };

  return (
    <Card className="max-w-md mx-auto p-6">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Create Organization</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleCreate)} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Organization Name</label>
            <Input {...register("name")} placeholder="Enter name" />
            {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
          </div>
          {error && <p className="text-red-500">{error}</p>}
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Creating..." : "Create Organization"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}