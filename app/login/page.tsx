"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/contexts/ToastContext";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const toast = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      toast.success(`Welcome back, ${data.user.name}!`);
      router.push(callbackUrl);
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Invalid credentials";
      toast.error(msg);
      setLoading(false);
    }
  };

  const fillQuickCreds = (userType: "admin" | "demo") => {
    if (userType === "admin") {
      setEmail("admin@example.com");
      setPassword("AdminPass123!");
    } else {
      setEmail("demo@example.com");
      setPassword("DemoPass123!");
    }
  };

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-black text-[#1C1C1C]">Sign In to Zwiggy</h1>
        <p className="text-xs text-[#696969] mt-1">
          Enjoy live food delivery from top restaurants
        </p>
      </div>

      {/* Quick Fill Credentials Buttons for easy testing */}
      <div className="mb-5 p-3 rounded-[8px] bg-[#FAF9F6] border border-[#E8E8E8] text-xs">
        <p className="font-bold text-[#1C1C1C] mb-2 text-[11px]">Quick Credentials Demo:</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => fillQuickCreds("demo")}
            className="flex-1 py-1 px-2 rounded-[6px] bg-[#FFFFFF] border border-[#E8E8E8] font-semibold text-[#1C1C1C] hover:border-[#1C1C1C] cursor-pointer"
          >
            Demo User
          </button>
          <button
            type="button"
            onClick={() => fillQuickCreds("admin")}
            className="flex-1 py-1 px-2 rounded-[6px] bg-[#FFFFFF] border border-[#E8E8E8] font-semibold text-[#E23744] hover:border-[#E23744] cursor-pointer"
          >
            Admin User
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-[#1C1C1C] mb-1">Email Address</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            className="w-full rounded-[8px] border border-[#E8E8E8] bg-[#FAF9F6] px-3 py-2 text-xs text-[#1C1C1C] focus:outline-none focus:border-[#E23744] focus:bg-[#FFFFFF]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#1C1C1C] mb-1">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-[8px] border border-[#E8E8E8] bg-[#FAF9F6] px-3 py-2 text-xs text-[#1C1C1C] focus:outline-none focus:border-[#E23744] focus:bg-[#FFFFFF]"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-[8px] bg-[#E23744] text-[#FFFFFF] text-xs font-bold hover:opacity-95 disabled:opacity-50 cursor-pointer shadow-xs transition-opacity"
        >
          {loading ? "Signing In..." : "Continue"}
        </button>
      </form>

      <p className="text-center text-xs text-[#696969] mt-6">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-bold text-[#E23744] hover:underline">
          Sign Up
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-[calc(100vh-64px)] grid grid-cols-1 md:grid-cols-2">
      {/* Left Column: Form */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <Suspense
          fallback={
            <div className="w-full max-w-sm h-64 bg-[#FAF9F6] rounded-[8px] animate-pulse" />
          }
        >
          <LoginForm />
        </Suspense>
      </div>

      {/* Right Column: Visual brand panel */}
      <div className="hidden md:flex flex-col items-center justify-center bg-[#FAF9F6] border-l border-[#E8E8E8] p-12 text-center">
        <div className="w-20 h-20 rounded-full bg-[#E23744] text-[#FFFFFF] flex items-center justify-center font-black text-3xl shadow-md mb-6">
          FD
        </div>
        <h2 className="text-2xl font-black text-[#1C1C1C] max-w-xs">
          Craving Delicious Food?
        </h2>
        <p className="text-xs text-[#696969] mt-2 max-w-sm">
          Get freshly prepared biryanis, crispy pizzas, and tiffins delivered right to your door in minutes with live telemetry tracking.
        </p>
      </div>
    </main>
  );
}
