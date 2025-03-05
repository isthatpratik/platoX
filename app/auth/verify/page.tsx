"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";

export default function Verify() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const router = useRouter();

  // Handle OTP verification
  const verifyCode = async () => {
    if (otp.length !== 6) {
      toast.error("Enter a valid 6-digit code.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post("/api/auth/verify", { code: otp });

      if (response.data.success) {
        toast.success("Account verified! Redirecting...");
        setTimeout(() => router.push("/auth/login"), 1500);
      } else {
        toast.error(response.data.error || "Invalid code. Try again.");
      }
    } catch {
      toast.error("Something went wrong.");
    }
    setLoading(false);
  };

  // Resend OTP function
  const resendCode = async () => {
    if (resendTimer > 0) return;

    try {
      await axios.post("/api/auth/resend-code");
      toast.success("New verification code sent!");
      setResendTimer(30);
    } catch {
      toast.error("Failed to resend code.");
    }
  };

  // Countdown timer for resending OTP
  useEffect(() => {
    if (resendTimer > 0) {
      const interval = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [resendTimer]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow">
        <h2 className="text-center text-2xl font-semibold">Verify Your Account</h2>
        <p className="text-center text-gray-600 mt-2">
          Enter the 6-digit code sent to your email.
        </p>

        {/* OTP Input */}
        <div className="mt-6 flex justify-center">
          <InputOTP maxLength={6} value={otp} onChange={setOtp}>
            <InputOTPGroup>
              {[...Array(6)].map((_, index) => (
                <InputOTPSlot key={index} index={index} />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>

        {/* Verify Button */}
        <Button onClick={verifyCode} disabled={loading} className="w-full mt-4">
          {loading ? "Verifying..." : "Verify"}
        </Button>

        {/* Resend Code */}
        <p className="text-center text-sm mt-4">
          Didn't receive the code?{" "}
          <button
            onClick={resendCode}
            disabled={resendTimer > 0}
            className={`text-blue-600 ${resendTimer > 0 ? "opacity-50" : ""}`}
          >
            Resend {resendTimer > 0 && `(${resendTimer}s)`}
          </button>
        </p>
      </div>
    </div>
  );
}
