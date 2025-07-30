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
import { useEffect, useState } from "react";
import { Agency } from "@/app/system_admin/agencies/Agency";
import StateSelect from "@/components/StateSelect";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import { time } from "console";

export default function AgencyDetailPage() {
  const [agency, setAgency] = useState<Agency | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { agency_id } = useParams();

  useEffect(() => {
    const fetchAgency = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/agencies/${agency_id}`
        );
        if (!res.ok) throw new Error("Failed to fetch agency");
        const data = await res.json();
        setAgency(data);
      } catch (err: any) {
        setError(err.message || "Error loading agency");
      } finally {
        setLoading(false);
      }
    };

    if (agency_id) fetchAgency();
  }, [agency_id]);

  const timespent = (() => {
    if (!agency?.createdAt) return "";
    const now = new Date();
    const created = new Date(agency.createdAt);
    let years = now.getFullYear() - created.getFullYear();
    let months = now.getMonth() - created.getMonth();
    let days = now.getDate() - created.getDate();

    if (days < 0) {
      months -= 1;
      // Get days in previous month
      const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }

    if (years > 0) return `${years} year${years > 1 ? "s" : ""}`;
    if (months > 0) return `${months} month${months > 1 ? "s" : ""}`;
    return `${days} day${days !== 1 ? "s" : ""}`;
  })();

  const numUsers = agency?.users?.length || 0;

  return (
    <div className="space-y-6">
      <Tabs defaultValue="info" className="w-full">
        <div className="flex justify-between items-center px-2">
          <TabsList>
            <TabsTrigger value="info">Agency Info</TabsTrigger>
            <TabsTrigger value="billing">Billing Info</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-4">
            <GoBackButton />
            <Button variant="secondary">Save Changes</Button>
          </div>
        </div>

        {/* TAB: AGENCY INFO */}
        <TabsContent value="info">
          <Card>
            <CardHeader>
              <CardTitle>Agency Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="mb-1">Agency Code</Label>
                <Input value={agency?.code || ""} disabled />
              </div>
              <div>
                <Label className="mb-1">Agency Name</Label>
                <Input value={agency?.name || ""} onChange={() => {}} />
              </div>
              <div>
                <Label className="mb-1">Status</Label>
                <Select disabled>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={agency?.status || "Select Status"}
                    />
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
                    <SelectValue
                      placeholder={agency?.allowEvv ? "Yes" : "No"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1">Settings State</Label>
                <Input
                  value={agency?.state || ""}
                  onChange={() => {}}
                  disabled
                />
              </div>
              <div>
                <Label className="mb-1">Time With Unity</Label>
                <Input value={timespent} onChange={() => {}} disabled />
              </div>
              <div>
                <Label className="mb-1">Number of Visits</Label>
                <Input
                  value={agency?.numVisits || 0}
                  onChange={() => {}}
                  disabled
                />
              </div>
              <div>
                <Label className="mb-1">Number of Clients</Label>
                <Input
                  value={agency?.numClients || 0}
                  onChange={() => {}}
                  disabled
                />
              </div>
              <div>
                <Label className="mb-1">Number of Employees</Label>
                <Input
                  value={agency?.numEmployees || 0}
                  onChange={() => {}}
                  disabled
                />
              </div>
              <div>
                <Label className="mb-1">Number of Users</Label>
                <Input value={numUsers || 0} onChange={() => {}} disabled />
              </div>
              <div>
                <Label className="mb-1">Sandata ID</Label>
                <Input
                  value={agency?.santraxId || "N/A"}
                  onChange={() => {}}
                  disabled
                />
              </div>
              <div>
                <Label className="mb-1">State Settings</Label>
                <Input placeholder="e.g., Sandata Integration, Time Rules..." />
              </div>
              <div>
                <Label className="mb-1">Address Line 1</Label>
                <Input
                  value={agency?.addressLine1 || "N/A"}
                  onChange={() => {}}
                />
              </div>
              <div>
                <Label className="mb-1">Address Line 2</Label>
                <Input value={agency?.addressLine2 || ""} onChange={() => {}} />
              </div>
              <div>
                <Label className="mb-1">Address Line 3</Label>
                <Input value={agency?.addressLine3 || ""} onChange={() => {}} />
              </div>
              <div>
                <Label className="mb-1">City</Label>
                <Input value={agency?.city || "N/A"} onChange={() => {}} />
              </div>
              <div>
                <Label className="mb-1">State</Label>
                <Select
                  value={agency?.addressState || ""}
                  onValueChange={() => {}}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={agency?.addressState || "Select State"}
                    />
                  </SelectTrigger>
                  <StateSelect />
                </Select>
              </div>
              <div>
                <Label className="mb-1">Zip Code</Label>
                <Input value={agency?.zipCode || "N/A"} onChange={() => {}} />
              </div>
              {/* Additional fields when needed */}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: BILLING INFO */}
        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Billing Info</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="mb-2">Subscription Plan</Label>
                <Input
                  value={agency?.subscriptionPlan || "Standard"}
                  disabled
                />
              </div>
              <div>
                <Label className="mb-2">Payment Method</Label>
                <Input
                  value={agency?.paymentMethod || "Unavailable"}
                  disabled
                />
              </div>
              <div>
                <Label className="mb-2">Billing Contact Email</Label>
                <Input
                  value={agency?.billingEmail || agency?.email || "N/A"}
                  onChange={() => {}}
                />
              </div>
              <div>
                <Label className="mb-2">Billing Contact Phone</Label>
                <Input
                  value={agency?.billingPhone || "N/A"}
                  onChange={() => {}}
                />
              </div>
              <div>
                <Label className="mb-2">Billing Cycle</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Monthly" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1">Last Pay Date</Label>
                <Input value={agency?.updatedAt || "N/A"} onChange={() => {}} />
              </div>
              <div>
                <Label className="mb-1">Next Pay Date</Label>
                <Input value={agency?.updatedAt || "N/A"} onChange={() => {}} />
              </div>
              <div>
                <Label className="mb-1">Billing Address Line 1</Label>
                <Input
                  value={agency?.addressLine1 || "N/A"}
                  onChange={() => {}}
                />
              </div>
              <div>
                <Label className="mb-1">Billing Address Line 2</Label>
                <Input value={agency?.addressLine2 || ""} onChange={() => {}} />
              </div>
              <div>
                <Label className="mb-1">Billing Address Line 3</Label>
                <Input value={agency?.addressLine3 || ""} onChange={() => {}} />
              </div>
              <div>
                <Label className="mb-1">Billing City</Label>
                <Input value={agency?.city || "N/A"} onChange={() => {}} />
              </div>
              <div>
                <Label className="mb-1">Billing State</Label>
                <Select
                  value={agency?.addressState || ""}
                  onValueChange={() => {}}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={agency?.addressState || "Select State"}
                    />
                  </SelectTrigger>
                  <StateSelect />
                </Select>
              </div>
              <div>
                <Label className="mb-1">Billing Zip Code</Label>
                <Input value={agency?.zipCode || "N/A"} onChange={() => {}} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: INVOICES */}
        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <CardTitle>Invoices</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Invoice list will appear here. For now, this is static.
              </div>
              <div className="border rounded p-4 bg-muted text-muted-foreground">
                <p>No invoices found for this agency.</p>
                <p className="text-xs mt-1">
                  Billing starts after plan activation.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
