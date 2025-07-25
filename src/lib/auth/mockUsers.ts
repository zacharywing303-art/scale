export type UserRole = "system_admin" | "agency_admin";

export interface MockUser {
  id: string;
  email: string;
  password: string;
  role: UserRole;
  name: string;
  agencyCode?: string; // for agency admins
  isMainAdmin?: boolean; // for system_admins
}

export const mockUsers: MockUser[] = [
  {
    id: "1",
    email: "admin@unitycare.com",
    password: "admin",
    role: "system_admin",
    name: "Main Admin",
    isMainAdmin: true,
  },
  {
    id: "2",
    email: "support@unitycare.com",
    password: "support123",
    role: "system_admin",
    name: "Support Admin",
  },
  {
    id: "3",
    email: "agency@unitycare.com",
    password: "agency123",
    role: "agency_admin",
    name: "Agency Admin",
    agencyCode: "UCC45678",
  },
];
