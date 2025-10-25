"use client";

import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { ArrowLeft } from "lucide-react";

interface GoBackButtonProps {
  hasUnsavedChanges?: boolean;
  onTriggerModal?: () => void;
}

export default function GoBackButton({
  hasUnsavedChanges = false,
  onTriggerModal,
}: GoBackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (hasUnsavedChanges && onTriggerModal) {
      onTriggerModal();
    } else {
      router.back();
    }
  };

  return (
    <Button onClick={handleClick}>
      <ArrowLeft className="w-4 h-4 mr-1" />
      Go Back
    </Button>
  );
}
// "use client";

// import { useRouter } from "next/navigation";
// import { Button } from "../ui/button";
// import { ArrowLeft } from "lucide-react";

// interface GoBackButtonProps {
//   hasUnsavedChanges: boolean;
//   onTriggerModal: () => void;
// }

// export default function GoBackButton({
//   hasUnsavedChanges,
//   onTriggerModal,
// }: GoBackButtonProps) {
//   const router = useRouter();

//   const handleClick = () => {
//     if (hasUnsavedChanges) {
//       onTriggerModal();
//     } else {
//       router.back();
//     }
//   };

//   return (
//     <Button onClick={handleClick}>
//       <ArrowLeft className="w-4 h-4 mr-1" />
//       Go Back
//     </Button>
//   );
// }
