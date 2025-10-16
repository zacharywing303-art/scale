import { Button } from "@/components/ui/button";
import { Pencil, Check, X } from "lucide-react";

export default function RequestActionButtons({
  onApprove,
  onDecline,
  onModify,
}: {
  onApprove: () => void;
  onDecline: () => void;
  onModify?: () => void;
}) {
  return (
    <div className="flex gap-2">
      <Button size="sm" variant="outline" onClick={onModify}>
        <Pencil className="w-4 h-4" />
      </Button>
      <Button size="sm" variant="secondary" onClick={onApprove}>
        <Check className="w-4 h-4" />
      </Button>
      <Button size="sm" variant="destructive" onClick={onDecline}>
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
}
