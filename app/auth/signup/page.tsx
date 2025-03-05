"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

import { Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";

const personalEmailDomains = [
  "gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "aol.com",
  "icloud.com", "protonmail.com", "zoho.com", "gmx.com", "mail.com",
];
const disposableEmailPattern = /(tempmail|10minutemail|guerrillamail|mailinator|yopmail|fakemail|trashmail|maildrop|sharklasers|mailnesia|getnada|mytemp|throwawaymail)/i;

// Zod Validation Schema
const SignupSchema = z.object({
  email: z.string().email({ message: "Invalid email format" }).refine((email) => {
    const domain = email.split("@")[1];
    return domain && !personalEmailDomains.includes(domain) && !disposableEmailPattern.test(domain);
  }, { message: "Use a company email (No personal/disposable emails)" }),

  password: z.string().min(8, "At least 8 characters"),
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isTypingPassword, setIsTypingPassword] = useState(false);

  const email = form.watch("email");
  const password = form.watch("password");

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
      setEmailError("Something went wrong");
    }
  };

  useEffect(() => {
    let strength = 0;
    if (password.length >= 8) strength += 20;
    if (/[A-Z]/.test(password)) strength += 20;
    if (/[a-z]/.test(password)) strength += 15;
    if (/[0-9]/.test(password)) strength += 20;
    if (/[\W_]/.test(password)) strength += 25;

    setPasswordStrength(strength);
  }, [password]);

  const getStrengthColor = () => {
    if (passwordStrength < 40) return "bg-yellow-400";  // Weak (Yellow)
    if (passwordStrength < 70) return "bg-green-400";   // Moderate (Light Green)
    return "bg-green-600";  // Strong (Dark Green)
  };

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

                  <AnimatePresence>
                    {emailError && (
                      <motion.p 
                        className="text-red-500 text-sm mt-1"
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                      >
                        {emailError}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password Field */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <Label>Password</Label>
                  <div className="relative">
                    <FormControl>
                      <Input 
                        {...field} 
                        type={showPassword ? "text" : "password"} 
                        placeholder="Enter password" 
                        onFocus={() => setIsTypingPassword(true)} 
                        onChange={(e) => {
                          field.onChange(e);
                          setIsTypingPassword(e.target.value.length > 0);
                        }}
                      />
                    </FormControl>
                    <button type="button" className="absolute right-3 top-2.5 text-gray-500" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  <AnimatePresence>
                    {isTypingPassword && (
                      <>
                        {/* Password Strength Bar */}
                        <motion.div
                          className="mt-2 w-full bg-gray-200 rounded h-2 overflow-hidden"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "8px" }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <div className={`h-full transition-all duration-300 ${getStrengthColor()}`} style={{ width: `${passwordStrength}%` }} />
                        </motion.div>

                        {/* Password Hints */}
                        <motion.div
                          className="mt-2 space-y-1 text-sm"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          {[
                            { label: "At least 8 characters", regex: /.{8,}/ },
                            { label: "Uppercase letter", regex: /[A-Z]/ },
                            { label: "Number", regex: /[0-9]/ },
                            { label: "Special character", regex: /[\W_]/ },
                          ].map(({ label, regex }) => (
                            <div key={label} className="flex items-center gap-2">
                              {regex.test(password) ? <CheckCircle className="text-green-500" size={14} /> : <XCircle className="text-red-500" size={14} />}
                              <span>{label}</span>
                            </div>
                          ))}
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </FormItem>
              )}
            />

            <Button type="submit" disabled={loading} className="w-full">{loading ? "Signing up..." : "Signup"}</Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
