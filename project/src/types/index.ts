export interface User {
  id: string;
  username: string;
  email: string;
  role: 'data_entry' | 'manager';
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface Claim {
  id: string;
  month: string;
  date_of_admission: string;
  date_of_discharge: string;
  tpa_name: string;
  parent_insurance: string;
  claim_id: string;
  uhid_ip_no: string;
  patient_name: string;
  bill_amount: number;
  approved_amount: number;
  mou_discount: number;
  co_pay: number;
  consumable_deduction: number;
  hospital_discount: number;
  paid_by_patient: number;
  hospital_discount_authority: string;
  other_deductions: number;
  approval_letter?: File | string;
  physical_file_dispatch: 'pending' | 'dispatched' | 'received' | 'not_required';
  physical_file_upload?: File | string;
  query_on_claim?: File | string;
  query_reply_upload?: File | string;
  query_reply_date: string;
  settlement_date: string;
  tds: number;
  amount_settled_in_ac: number;
  total_settled_amount: number;
  difference_amount: number;
  reason_less_settlement: string;
  claim_settled_software: boolean;
  receipt_verified_bank: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClaimFormData {
  date_of_admission?: string;
  date_of_discharge?: string;
  tpa_name?: string;
  parent_insurance?: string;
  claim_id?: string;
  uhid_ip_no?: string;
  patient_name?: string;
  bill_amount?: number;
  approved_amount?: number;
  mou_discount?: number;
  co_pay?: number;
  consumable_deduction?: number;
  hospital_discount?: number;
  paid_by_patient?: number;
  hospital_discount_authority?: string;
  other_deductions?: number;
  approval_letter?: File;
  physical_file_dispatch?: 'pending' | 'dispatched' | 'received' | 'not_required';
  physical_file_upload?: File;
  query_on_claim?: File;
  query_reply_upload?: File;
  query_reply_date?: string;
  settlement_date?: string;
  tds?: number;
  amount_settled_in_ac?: number;
  total_settled_amount?: number;
  reason_less_settlement?: string;
  claim_settled_software?: boolean;
  receipt_verified_bank?: boolean;
}

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  role: 'data_entry' | 'manager';
  token: string;
}

export interface DashboardStats {
  totalBillAmount: number;
  totalApprovedAmount: number;
  totalTds: number;
  totalRejections: number;
  totalConsumables: number;
  totalPaidByPatients: number;
}

export interface ChartData {
  name: string;
  value: number;
  month?: string;
}