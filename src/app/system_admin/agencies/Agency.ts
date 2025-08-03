import { User } from "@/lib/auth";

export interface Agency {
  id: string;
  name: string;
  allowEvv?: boolean;
  status?: "Active" | "Inactive" | "Suspended";
  state?: string;
  subscriptionPlan?: string;
  paymentMethod?: string;
  createdAt?: string;
  updatedAt?: string;
  numberOfUsers?: number;
  timeSpent?: string;
  email?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  addressLine3?: string;
  city?: string;
  zipCode?: string;
  addressState?: string;
  code?: string; // Added for agency code
  numEmployees?: number; // Added for number of employees
  users?: User[]; // Optional: List of users associated with the agency
  billingEmail?: string; // Optional: Billing contact email
  billingPhone?: string; // Optional: Billing contact phone
  numVisits?: number; // Optional: Number of visits
  numClients?: number; // Optional: Number of clients
  paymentStatus?: "Paid" | "Pending" | "Failed" | "Not Required"; // Optional: Payment status
  agencyAdminId?: string; // Optional: ID of the agency admin
  agencyAdmin?: User; // Optional: Agency admin user object
  santraxID?: string; // Optional: Santrax ID for integration
}
