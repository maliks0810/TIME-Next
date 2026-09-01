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
  edit_any_security_setup_request: boolean;
  edit_field_after_request_submitted_aladdin_cdi_id?: boolean;
  edit_field_after_request_submitted_identifier?: boolean;
  edit_field_after_request_submitted_description?: boolean;
  edit_field_after_request_submitted_tranche?: boolean;
  edit_field_after_request_submitted_sector?: boolean;
  edit_field_after_request_submitted_callable?: boolean;
  edit_field_after_request_submitted_call_date?: boolean;
  edit_field_after_request_submitted_price?: boolean;
  edit_field_after_request_submitted_prepayment_type?: boolean;
  edit_field_after_request_submitted_default_type?: boolean;
  edit_field_after_request_submitted_prepayment_speed?: boolean;
  edit_field_after_request_submitted_default_speed?: boolean;
  edit_field_after_request_submitted_severity?: boolean;
  edit_field_after_request_submitted_deliquency?: boolean;
  edit_field_after_request_submitted_notes?: boolean;
  edit_field_after_request_submitted_tcw_esg?: boolean;
  edit_field_after_request_submitted_esg_collateral_type?: boolean;
  edit_field_after_request_submitted_tcw_esg_type?: boolean;
  edit_field_after_request_submitted_slicer_type?: boolean;
  edit_field_after_request_submitted_mbs_type?: boolean;
  edit_field_after_request_submitted_loan_credit?: boolean;
  edit_field_after_request_submitted_mbs_collateral?: boolean;
  edit_field_after_request_submitted_mbs_collateral_sub?: boolean;
  edit_field_after_request_submitted_sr_most_cash_flow?: boolean;
  edit_field_after_request_submitted_tranche_type?: boolean;
  edit_field_after_request_submitted_loan_category?: boolean;
  edit_field_after_request_submitted_collateral?: boolean;
  edit_field_after_request_submitted_eu_securitization_status?: boolean;
  edit_field_after_request_submitted_eu_securitization_tip_eu_id?: boolean;
  edit_field_after_request_submitted_erisa_status?: boolean;
}