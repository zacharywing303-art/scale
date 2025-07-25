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
  address?: string;
}
