export type UserRole = {
  role: string;
  users: {
    id: string;
    firstName?: string;
    lastName?: string;
    email: string;
    phone: string;
  }[];
};
