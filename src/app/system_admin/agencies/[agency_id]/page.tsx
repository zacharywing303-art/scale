"use client";

import { useParams } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import GoBackButton from "@/components/custom/GoBackButton";
import { Button } from "@/components/ui/button";

export default function AgencyDetailPage() {
  const { agency_id } = useParams();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Agency Information</CardTitle>
        </CardHeader>
        <div className="flex justify-between items-center p-4">
          <GoBackButton />
          <Button variant="secondary">Save Changes</Button>
        </div>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="mb-1">Agency ID</Label>
            <Input value={agency_id} disabled />
          </div>
          <div>
            <Label className="mb-1">Agency Name</Label>
            <Input defaultValue="Example Agency" />
          </div>
          <div>
            <Label className="mb-1">Status</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-1">Allow EVV</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select Option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-1">State</Label>
            <Input defaultValue="PA" />
          </div>
          <div>
            <Label className="mb-1">State Settings</Label>
            <Input placeholder="e.g., Sandata Integration, Time Rules..." />
          </div>
          <div>
            <Label className="mb-1">Subscription Plan</Label>
            <Input defaultValue="Enterprise" />
          </div>
          <div>
            <Label className="mb-1">Payment Method</Label>
            <Input defaultValue="Visa **** 1234" />
          </div>
          <div>
            <Label className="mb-1">Time Spent (This Month)</Label>
            <Input defaultValue="123 hrs" disabled />
          </div>
          <div>
            <Label className="mb-1">Number of Users</Label>
            <Input defaultValue="45" disabled />
          </div>
          {/* Add any additional fields as needed */}
        </CardContent>
      </Card>
    </div>
  );
}
