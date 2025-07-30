"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { User } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agencyCode, setAgencyCode] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();

  const handleLogin = async () => {
    setError("");

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    // If agencyCode is filled, require it to be non-empty (means agency user)
    if (agencyCode.trim() === "") {
      // No agency code — assuming admin login
      // No agencyCode sent in POST
    }

    setLoading(true);

    try {
      const bodyPayload: any = { email, password };
      if (agencyCode.trim() !== "") {
        bodyPayload.agencyCode = agencyCode.trim();
      }

      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      const user: User = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        agencyCode: data.user.agency?.code || "",
      };

      login(user);

      if (
        (user.role === "AGENCY_USER" || user.role === "AGENCY_ADMIN") &&
        !bodyPayload.agencyCode
      ) {
        setError("Agency code is required for agency users.");
        setLoading(false);
        return;
      }

      if (user.role === "SYSTEM_ADMIN" || user.role === "MAIN_ADMIN") {
        router.push("/system_admin");
      } else if (user.role === "AGENCY_USER" || user.role === "AGENCY_ADMIN") {
        router.push("/dashboard");
      } else {
        setError("Unknown user role.");
        setLoading(false);
        return;
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md shadow-xl border border-green-500">
        <CardHeader>
          <h1 className="text-2xl font-bold text-center text-primary">
            Welcome Back to UnityCare
          </h1>
          <p className="text-sm text-center text-gray-500">
            Please log in to your account
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="agency-code" className="mb-1">
                Agency Code
              </Label>
              <Input
                id="agency-code"
                type="text"
                placeholder="UCC45678"
                value={agencyCode}
                onChange={(e) => setAgencyCode(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="email" className="mb-1">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="password" className="mb-1">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                />
                <button
                  type="button"
                  className="absolute right-2 top-2 text-sm text-blue-600"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <Button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-gray-700 hover:bg-green-600 text-white font-semibold"
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
