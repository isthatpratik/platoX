"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import slugify from "slugify";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

// Validation Schema
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
  const [slug, setSlug] = useState("");
  const [slugError, setSlugError] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [checkingSlug, setCheckingSlug] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(organizationSchema),
  });

  const name = watch("name");

  // Generate slug on name change
  useEffect(() => {
    if (name) {
      setSlug(slugify(name, { lower: true, strict: true }));
    } else {
      setSlug("");
    }
  }, [name]);

  // Check slug availability
  const checkSlugAvailability = async () => {
    if (!slug) return;
    setCheckingSlug(true);
    try {
      const response = await fetch(`/api/organization/check-slug?slug=${slug}`);
      const data = await response.json();
      if (data.available) {
        setSlugError("");
        setSuggestions([]);
      } else {
        setSlugError("This slug is already taken.");
        setSuggestions(data.suggestions || []);
      }
    } catch {
      setSlugError("Error checking slug availability.");
    }
    setCheckingSlug(false);
  };

  // Handle Organization Creation
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
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md p-6">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-center">Create Organization</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleCreate)} className="space-y-4">
            {/* Organization Name */}
            <div>
              <label className="text-sm font-medium">Organization Name</label>
              <Input {...register("name")} placeholder="Enter name" />
              {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
            </div>

            {/* Slug Field (Auto-Generated & Checked) */}
            <div>
              <label className="text-sm font-medium">Slug</label>
              <div className="relative">
                <Input
                  value={slug}
                  onChange={(e) => setSlug(slugify(e.target.value, { lower: true, strict: true }))}
                  onBlur={checkSlugAvailability}
                  placeholder="Generated slug"
                />
                {checkingSlug && <span className="absolute right-3 top-2 text-gray-500 text-sm">Checking...</span>}
              </div>
              {slugError && <p className="text-red-500 text-sm">{slugError}</p>}
              {suggestions.length > 0 && (
                <p className="text-gray-600 text-sm">
                  Try: {suggestions.map((s) => <span key={s} className="font-medium">{s} </span>)}
                </p>
              )}
            </div>

            {/* Error Message */}
            {error && <p className="text-red-500">{error}</p>}

            {/* Submit Button */}
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Creating..." : "Create Organization"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}