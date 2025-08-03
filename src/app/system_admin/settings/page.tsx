"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function SystemAdminSettingsPage() {
  const [platformName, setPlatformName] = useState("MyCarePro");
  const [require2FA, setRequire2FA] = useState(true);
  const [defaultTimezone, setDefaultTimezone] = useState("America/New_York");
  const [defaultState, setDefaultState] = useState("NY");
  const [autoSuspendInactiveAgencies, setAutoSuspendInactiveAgencies] =
    useState(false);
  const [supportEmail, setSupportEmail] = useState("support@mycarepro.com");

  const handleSave = () => {
    const payload = {
      platformName,
      require2FA,
      defaultTimezone,
      defaultState,
      autoSuspendInactiveAgencies,
      supportEmail,
    };

    console.log("Saving System Admin Settings:", payload);
    // TODO: Send to backend
  };

  return (
    <ProtectedRoute allowedRoles={["MAIN_ADMIN"]}>
      <div className="p-6 space-y-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold">System Settings</h1>

        <Card>
          <CardContent className="space-y-6 p-6">
            {/* Platform Settings */}
            <div>
              <h2 className="text-lg font-semibold mb-2">Platform Settings</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="platformName" className="mb-1">
                    Platform Name
                  </Label>
                  <Input
                    id="platformName"
                    value={platformName}
                    onChange={(e) => setPlatformName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="supportEmail" className="mb-1">
                    Support Contact Email
                  </Label>
                  <Input
                    id="supportEmail"
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="border-t my-6" />

            {/* Security Settings */}
            <div>
              <h2 className="text-lg font-semibold mb-2">Security Settings</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="require-2fa"
                    checked={require2FA}
                    onCheckedChange={(val) => setRequire2FA(Boolean(val))}
                  />
                  <Label htmlFor="require-2fa">
                    Require Two-Factor Authentication
                  </Label>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="auto-suspend"
                    checked={autoSuspendInactiveAgencies}
                    onCheckedChange={(val) =>
                      setAutoSuspendInactiveAgencies(Boolean(val))
                    }
                  />
                  <Label htmlFor="auto-suspend">
                    Auto Suspend Inactive Agencies After 60 Days
                  </Label>
                </div>
              </div>
            </div>

            <div className="border-t my-6" />

            {/* Defaults */}
            <div>
              <h2 className="text-lg font-semibold mb-2">
                Default Settings for New Agencies
              </h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="defaultTimezone" className="mb-1">
                    Default Timezone
                  </Label>
                  <Select
                    value={defaultTimezone}
                    onValueChange={setDefaultTimezone}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">
                        Eastern (EST)
                      </SelectItem>
                      <SelectItem value="America/Chicago">
                        Central (CST)
                      </SelectItem>
                      <SelectItem value="America/Denver">
                        Mountain (MST)
                      </SelectItem>
                      <SelectItem value="America/Los_Angeles">
                        Pacific (PST)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="defaultState" className="mb-1">
                    Default State
                  </Label>
                  <Input
                    id="defaultState"
                    value={defaultState}
                    onChange={(e) => setDefaultState(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={handleSave}>Save Settings</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
