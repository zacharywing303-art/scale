// /types/requests.ts

export type TimeOffType = "PTO" | "Sick" | "Vacation" | "Personal" | "Unpaid";

export type RequestType =
  | "TimeOff"
  | "AvailabilityChange"
  | "StatusChange"
  | "Sick"
  | "ClockAdjust"
  | "ClientAcceptance";

export type RequestStatus = "Pending" | "Approved" | "Declined";

export type EmployeeSummary = {
  id: string;
  name: string;
  status: string;
};

export type AvailabilityChangeEntry = {
  weekday: number; // 0–6
  start: string; // "09:00"
  end: string; // "17:00"
};

export type EmployeeRequest = {
  id: string;
  type: RequestType;
  status: RequestStatus;
  reason?: string | null;

  // Time off / sick
  startDate?: string | null;
  endDate?: string | null;
  timeOffType?: TimeOffType | null;

  // Availability change
  availabilityChanges?: AvailabilityChangeEntry[] | null;

  // Status change
  newStatus?: string | null;

  createdAt: string;

  employee: EmployeeSummary;
};
