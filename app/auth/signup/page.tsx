"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

import { Eye, EyeOff } from "lucide-react"; // Import eye icons

// List of common personal email providers
const personalEmailDomains = [
  "gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "aol.com",
  "icloud.com", "protonmail.com", "zoho.com", "gmx.com", "mail.com",
];

// Regex to detect disposable email domains
const disposableEmailPattern = /(tempmail|10minutemail|guerrillamail|mailinator|yopmail|fakemail|trashmail|maildrop|sharklasers|mailnesia|getnada|mytemp|throwawaymail)/i;

// Zod validation schema
const SignupSchema = z.object({
  email: z.string().email({ message: "Invalid email format" }).refine((email) => {
    const domain = email.split("@")[1];
    return domain && !personalEmailDomains.includes(domain) && !disposableEmailPattern.test(domain);
  }, { message: "Use a valid company email (No personal/disposable emails allowed)" }),

  password: z.string()
    .min(8, "At least 8 characters")
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[a-z]/, "Must contain a lowercase letter")
    .regex(/[0-9]/, "Must contain a number")
    .regex(/[\W_]/, "Must contain a special character"),

  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords must match",
  path: ["confirmPassword"],
});

export default function Signup() {
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(SignupSchema),
    defaultValues: { email: "", password: "", confirmPassword: "" },
  });

  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false); // 🔹 Toggle password visibility
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // 🔹 Toggle confirm password visibility

  const email = form.watch("email");
  const password = form.watch("password");

  // Validate email on blur
  const validateEmail = async () => {
    if (!email) return;

    try {
      const response = await axios.post("/api/auth/signup", { email, checkOnly: true });

      if (response.data.error) {
        setEmailError(response.data.error);
      } else {
        setEmailError("");
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.error) {
        setEmailError(error.response.data.error);
      } else {
        setEmailError("Something went wrong");
      }
    }
  };

  // Password strength calculation
  useEffect(() => {
    if (!password) {
      setPasswordStrength(0);
      return;
    }

    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[a-z]/.test(password)) strength += 15;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[\W_]/.test(password)) strength += 20;

    setPasswordStrength(strength);
  }, [password]);

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      await axios.post("/api/auth/signup", { email: data.email, password: data.password });
      toast.success("Verification code sent!");
      router.push("/auth/verify");
    } catch (err) {
      toast.error("Signup failed. Try again.");
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow">
        <h2 className="text-center text-2xl font-semibold">Sign Up</h2>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">

            {/* Email Field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <Label>Email</Label>
                  <FormControl>
                    <Input {...field} type="email" placeholder="Enter company email" onBlur={validateEmail} />
                  </FormControl>
                  {emailError && <p className="text-red-500 text-sm">{emailError}</p>}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password Field with Show/Hide Toggle */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <Label>Password</Label>
                  <div className="relative">
                    <FormControl>
                      <Input {...field} type={showPassword ? "text" : "password"} placeholder="Enter password" />
                    </FormControl>
                    {/* Toggle Button */}
                    <button
                      type="button"
                      className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {/* Password Strength Progress Bar */}
                  {password && (
                    <Progress
                      value={passwordStrength}
                      className={`h-1 mt-1 ${
                        passwordStrength < 50 ? "bg-red-500" : 
                        passwordStrength < 75 ? "bg-yellow-500" : 
                        passwordStrength < 100 ? "bg-green-500" : 
                        "bg-green-700"
                      }`}
                    />
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Confirm Password Field with Show/Hide Toggle */}
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <Label>Confirm Password</Label>
                  <div className="relative">
                    <FormControl>
                      <Input {...field} type={showConfirmPassword ? "text" : "password"} placeholder="Confirm password" />
                    </FormControl>
                    {/* Toggle Button */}
                    <button
                      type="button"
                      className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Signing up..." : "Signup"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}
