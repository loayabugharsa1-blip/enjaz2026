export type Role = "admin" | "employee" | "staff";

export interface User {
  id: string;
  username: string;
  passwordHash: string;
  role: Role;
  name: string;
  createdAt: string;
}

export interface Session {
  userId: string;
  username: string;
  role: Role;
  name: string;
  loginAt: string;
}
