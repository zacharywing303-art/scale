"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { mockUsers } from "@/lib/auth/mockUsers";
import { useAuth } from "../context/AuthContext";
import { User } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agencyCode, setAgencyCode] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();

  const handleLogin = () => {
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    const user = mockUsers.find(
      (u) =>
        u.email.toLowerCase() === email.toLowerCase() &&
        u.password === password &&
        (u.role === "system_admin" || u.agencyCode === agencyCode)
    );

    if (!user) {
      setError("Invalid credentials or agency code.");
      return;
    }

    login(user as unknown as User); // Sets the context and handles session

    if (user.role === "system_admin") {
      router.push("/system_admin");
    } else {
      router.push("/dashboard");
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
              <Label htmlFor="agency-code" className="mb-2">
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
              <Label htmlFor="email" className="mb-2">
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
              <Label htmlFor="password" className="mb-2">
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
              className="w-full bg-gray-700 hover:bg-green-600 text-white font-semibold"
            >
              Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
