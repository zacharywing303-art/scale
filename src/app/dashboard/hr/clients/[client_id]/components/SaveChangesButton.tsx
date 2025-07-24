"use client";

import { Button } from "@/components/ui/button";

export default function SaveChangesButton() {
  const handleSave = () => {
    // Logic to save changes will go here later
    console.log("Save changes clicked");
    alert("Changes will be saved (stub)");
  };

  return (
    <div className="mt-6 flex justify-end">
      <Button onClick={handleSave}>Save Changes</Button>
    </div>
  );
}
