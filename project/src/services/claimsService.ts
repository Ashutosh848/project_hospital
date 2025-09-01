import api from '../utils/api';
import { Claim, DashboardStats, ChartData } from '../types';

export interface ClaimsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Claim[];
}

export interface CreateClaimRequest {
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
  approval_letter_uploaded: boolean;
  physical_file_dispatch: 'pending' | 'dispatched' | 'received' | 'not_required';
  physical_file_uploaded: boolean;
  query_on_claim_uploaded: boolean;
  query_reply_uploaded: boolean;
  query_reply_date: string;
  settlement_date: string;
  tds: number;
  amount_settled_in_ac: number;
  total_settled_amount: number;
  reason_less_settlement: string;
  claim_settled_software: boolean;
  receipt_verified_bank: boolean;
}

export const claimsService = {
  async getClaims(page: number = 1, search?: string): Promise<ClaimsResponse> {
    const params = new URLSearchParams();
    if (page > 1) params.append('page', page.toString());
    if (search) params.append('search', search);
    
    const response = await api.get<ClaimsResponse>(`/api/claims/?${params.toString()}`);
    return response.data;
  },

  async getAllClaims(): Promise<Claim[]> {
    let allClaims: Claim[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('page_size', '100'); // Request 100 items per page
      
      const response = await api.get<ClaimsResponse>(`/api/claims/?${params.toString()}`);
      allClaims = [...allClaims, ...response.data.results];
      
      // Check if there are more pages
      hasMore = response.data.next !== null;
      page++;
      
      // Safety check to prevent infinite loops
      if (page > 50) {
        console.warn('Reached maximum page limit while fetching all claims');
        break;
      }
    }
    
    return allClaims;
  },

  async getClaim(id: string): Promise<Claim> {
    const response = await api.get<Claim>(`/api/claims/${id}/`);
    return response.data;
  },

  async createClaim(claimData: CreateClaimRequest): Promise<Claim> {
    const response = await api.post<Claim>('/api/claims/', claimData);
    return response.data;
  },

  async updateClaim(id: string, claimData: Partial<CreateClaimRequest>): Promise<Claim> {
    const response = await api.patch<Claim>(`/api/claims/${id}/`, claimData);
    return response.data;
  },

  async deleteClaim(id: string): Promise<void> {
    await api.delete(`/api/claims/${id}/`);
  },

  async updateFileStatus(claimId: string, fileField: string, uploaded: boolean): Promise<void> {
    await api.patch(`/api/claims/${claimId}/update-file-status/${fileField}/`, { uploaded });
  },

  async getDashboardStats(params?: string): Promise<DashboardStats> {
    const url = params ? `/api/claims/dashboard/summary/?${params}` : '/api/claims/dashboard/summary/';
    const response = await api.get<DashboardStats>(url);
    return response.data;
  },

  async getMonthwiseData(params?: string): Promise<ChartData[]> {
    const url = params ? `/api/claims/dashboard/monthwise/?${params}` : '/api/claims/dashboard/monthwise/';
    const response = await api.get<ChartData[]>(url);
    return response.data;
  },

  async getCompanywiseData(params?: string): Promise<ChartData[]> {
    const url = params ? `/api/claims/dashboard/companywise/?${params}` : '/api/claims/dashboard/companywise/';
    const response = await api.get<ChartData[]>(url);
    return response.data;
  },
};
