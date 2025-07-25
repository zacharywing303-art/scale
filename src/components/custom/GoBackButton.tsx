import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { ArrowLeft } from "lucide-react";

export default function GoBackButton() {
  const router = useRouter();

  return (
    <Button onClick={() => router.back()}>
      <ArrowLeft className="w-4 h-4" />
      Go Back
    </Button>
  );
}
