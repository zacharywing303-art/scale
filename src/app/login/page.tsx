"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useState } from "react";
import { useRouter } from "next/navigation";

const unityBlue = "#007AFF";
const unityGreen = "#34C759";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agencyCode, setAgencyCode] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }
    // Simulate login logic
    setError("");
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md shadow-xl border border-[${unityGreen}]">
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
              <Label htmlFor="email">Agnecy Code</Label>
              <Input
                id="agency-code"
                type="number"
                placeholder="UCC45678"
                value={agencyCode}
                onChange={(e) => setAgencyCode(e.target.value)}
                style={{ marginTop: "0.5rem" }}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ marginTop: "0.5rem" }}
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ marginTop: "0.5rem" }}
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <Button
              onClick={handleLogin}
              className="w-full bg-gray-500 hover:bg-green-600 text-white font-semibold"
            >
              Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
