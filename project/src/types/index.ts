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
  baseDateOfDischarge: string;
  dateOfAdmission: string;
  dateOfDischarge: string;
  tpaName: string;
  parentInsurance: string;
  claimId: string;
  uhidIpNo: string;
  patientName: string;
  billAmount: number;
  approvedAmount: number;
  mouDiscount: number;
  coPay: number;
  consumableDeduction: number;
  hospitalDiscount: number;
  paidByPatient: number;
  hospitalDiscountAuthority: string;
  otherDeductions: number;
  approvalLetterUpload?: File | string;
  physicalFileDispatch: 'pending' | 'dispatched' | 'received';
  physicalFileUpload?: File | string;
  dateOfUploadDispatch: string;
  podUpload?: File | string;
  queryOnClaim?: File | string;
  queryReplyDate: string;
  queryReplyUpload?: File | string;
  settlementDate: string;
  tds: number;
  amountSettledInAccount: number;
  totalSettledAmount: number;
  differenceApprovedSettled: number;
  reasonForLessSettlement: string;
  claimSettledOnSoftware: boolean;
  receiptAmountVerification: boolean;
  createdAt: string;
  updatedAt: string;
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