"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import Topbar from "@/components/TopBar";
import { ArrowLeft } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();

  const [websiteSettings, setWebsiteSettings] = useState({
    autoVerifyVisits: true,
    allowLateClockIn: false,
    allowLateClockOut: true,
    visitEditTimeLimit: "48", // in hours
    allowManualEntry: false,
    notifyForMissingCalls: true,
    timezone: "America/New_York",
    visitVerificationGrace: "10", // in minutes
  });

  const [appSettings, setAppSettings] = useState({
    enableGpsTracking: true,
    allowOfflineCheckIn: true,
    requireClientSignature: true,
    requireEmployeeSignature: false,
    alertOnGeofenceExit: true,
    enableNotifications: true,
    gpsAccuracyThreshold: "50", // in meters
    feedbackEnabled: true,
  });

  const handleWebsiteChange = (field: string, value: any) => {
    setWebsiteSettings({ ...websiteSettings, [field]: value });
  };

  const handleAppChange = (field: string, value: any) => {
    setAppSettings({ ...appSettings, [field]: value });
  };

  const handleSave = () => {
    console.log("Website Settings:", websiteSettings);
    console.log("App Settings:", appSettings);
    // Integrate with backend if needed
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Topbar */}
      <Topbar />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Go Back */}
        <div className="mb-4">
          <button
            onClick={() => router.back()}
            className="flex items-center text-blue-600 hover:underline"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Go Back
          </button>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold mb-4 text-[#007AFF]">
          Agency Settings
        </h2>

        {/* Website Settings */}
        <div className="bg-white rounded-lg shadow p-6 mb-8 border">
          <h3 className="text-xl font-semibold mb-4 text-[#007AFF]">
            Website Settings
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: "Auto Verify Visits", key: "autoVerifyVisits" },
              { label: "Allow Late Clock In", key: "allowLateClockIn" },
              { label: "Allow Late Clock Out", key: "allowLateClockOut" },
              { label: "Manual Visit Entry", key: "allowManualEntry" },
              {
                label: "Notify for Missing Calls",
                key: "notifyForMissingCalls",
              },
            ].map(({ label, key }) => (
              <div key={key}>
                <Label>{label}</Label>
                <Switch
                  checked={
                    websiteSettings[
                      key as keyof typeof websiteSettings
                    ] as boolean
                  }
                  onCheckedChange={(val) => handleWebsiteChange(key, val)}
                />
              </div>
            ))}

            <div>
              <Label>Visit Edit Time Limit (hrs)</Label>
              <Input
                type="number"
                value={websiteSettings.visitEditTimeLimit}
                onChange={(e) =>
                  handleWebsiteChange("visitEditTimeLimit", e.target.value)
                }
              />
            </div>

            <div>
              <Label>Timezone</Label>
              <Input
                value={websiteSettings.timezone}
                onChange={(e) =>
                  handleWebsiteChange("timezone", e.target.value)
                }
              />
            </div>

            <div>
              <Label>Visit Verification Grace Period (min)</Label>
              <Input
                type="number"
                value={websiteSettings.visitVerificationGrace}
                onChange={(e) =>
                  handleWebsiteChange("visitVerificationGrace", e.target.value)
                }
              />
            </div>
          </div>
        </div>

        {/* App Settings */}
        <div className="bg-white rounded-lg shadow p-6 mb-8 border">
          <h3 className="text-xl font-semibold mb-4 text-[#34C759]">
            App Settings
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: "Enable GPS Tracking", key: "enableGpsTracking" },
              { label: "Allow Offline Check-in", key: "allowOfflineCheckIn" },
              {
                label: "Require Client Signature",
                key: "requireClientSignature",
              },
              {
                label: "Require Employee Signature",
                key: "requireEmployeeSignature",
              },
              { label: "Alert on Geofence Exit", key: "alertOnGeofenceExit" },
              { label: "Enable Notifications", key: "enableNotifications" },
              { label: "Feedback Enabled", key: "feedbackEnabled" },
            ].map(({ label, key }) => (
              <div key={key}>
                <Label>{label}</Label>
                <Switch
                  checked={
                    appSettings[key as keyof typeof appSettings] as boolean
                  }
                  onCheckedChange={(val) => handleAppChange(key, val)}
                />
              </div>
            ))}

            <div>
              <Label>GPS Accuracy Threshold (meters)</Label>
              <Input
                type="number"
                value={appSettings.gpsAccuracyThreshold}
                onChange={(e) =>
                  handleAppChange("gpsAccuracyThreshold", e.target.value)
                }
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <Button
          className="bg-[#007AFF] hover:bg-blue-600 text-white"
          onClick={handleSave}
        >
          Save Settings
        </Button>
      </div>
    </div>
  );
}
