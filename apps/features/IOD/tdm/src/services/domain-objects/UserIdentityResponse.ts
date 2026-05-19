export interface IUserIdentity {
  userId: number;
  userEmail: string;
  userName: string;
  roles: string[];
  rolePermissions: Record<string, string[]>;
}
