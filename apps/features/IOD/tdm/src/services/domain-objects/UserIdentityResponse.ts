export interface IUserIdentity {
  userId: string;
  userFullName: string;
  userEmail: string;
  permissionsAllowed: IUserAuthPermissions;
}
export interface IUserAuthPermissions {
  cancel_request: boolean;
  cancel_request_after_submission: boolean;
  confirm_request: boolean;
  duplicate_request: boolean;
  explicit_dm_analyst_assignment: boolean;
  ssap_release: boolean;
}