"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const handleSubmit = () => {
    router.push("/login");
  };
  return (
    <main className="p-10">
      <h1 className="text-3xl font-bold mb-4">Welcome to My Care Website</h1>
      <Button onClick={handleSubmit}>Get Started</Button>
    </main>
  );
}
