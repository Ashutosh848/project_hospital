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
  approval_letter?: File;
  physical_file_dispatch: 'pending' | 'dispatched' | 'received' | 'not_required';
  physical_file_upload?: File;
  query_on_claim?: File;
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
    
    const response = await api.get<ClaimsResponse>(`/claims/?${params.toString()}`);
    return response.data;
  },

  async getClaim(id: string): Promise<Claim> {
    const response = await api.get<Claim>(`/claims/${id}/`);
    return response.data;
  },

  async createClaim(claimData: CreateClaimRequest | FormData): Promise<Claim> {
    let formData: FormData;
    
    if (claimData instanceof FormData) {
      formData = claimData;
    } else {
      formData = new FormData();
      
      // Add all text fields
      Object.entries(claimData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (value instanceof File) {
            formData.append(key, value);
          } else {
            formData.append(key, String(value));
          }
        }
      });
    }

    const response = await api.post<Claim>('/claims/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async updateClaim(id: string, claimData: Partial<CreateClaimRequest> | FormData): Promise<Claim> {
    let formData: FormData;
    
    if (claimData instanceof FormData) {
      formData = claimData;
    } else {
      formData = new FormData();
      
      // Add all text fields
      Object.entries(claimData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (value instanceof File) {
            formData.append(key, value);
          } else {
            formData.append(key, String(value));
          }
        }
      });
    }

    const response = await api.patch<Claim>(`/claims/${id}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async deleteClaim(id: string): Promise<void> {
    await api.delete(`/claims/${id}/`);
  },

  async getDashboardStats(): Promise<DashboardStats> {
    const response = await api.get<DashboardStats>('/claims/dashboard/summary/');
    return response.data;
  },

  async getMonthwiseData(): Promise<ChartData[]> {
    const response = await api.get<ChartData[]>('/claims/dashboard/monthwise/');
    return response.data;
  },

  async getCompanywiseData(): Promise<ChartData[]> {
    const response = await api.get<ChartData[]>('/claims/dashboard/companywise/');
    return response.data;
  },
};
