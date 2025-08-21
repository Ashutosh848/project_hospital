import { Claim, User, DashboardStats, ChartData } from '../types';
import { format, subDays, addDays } from 'date-fns';

export const mockUsers: User[] = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@hospital.com',
    role: 'manager',
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    username: 'dataentry',
    email: 'entry@hospital.com',
    role: 'data_entry',
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    username: 'john.doe',
    email: 'john.doe@hospital.com',
    role: 'data_entry',
    status: 'active',
    createdAt: '2024-01-15T00:00:00Z'
  },
  {
    id: '4',
    username: 'jane.smith',
    email: 'jane.smith@hospital.com',
    role: 'manager',
    status: 'inactive',
    createdAt: '2024-02-01T00:00:00Z'
  }
];

const generateMockClaims = (): Claim[] => {
  const tpaNames = ['TPA Healthcare', 'MediAssist', 'Vidal Health', 'Family Health Plan', 'Star Health'];
  const insuranceCompanies = ['HDFC ERGO', 'ICICI Lombard', 'Bajaj Allianz', 'Reliance General', 'New India Assurance'];
  const patientNames = ['John Doe', 'Jane Smith', 'Michael Johnson', 'Sarah Wilson', 'David Brown', 'Lisa Davis'];
  const authorities = ['Medical Director', 'Admin Head', 'Finance Manager', 'Operations Manager'];
  const reasons = ['Processing delay', 'Document incomplete', 'Policy limit exceeded', 'Medical review pending'];

  return Array.from({ length: 150 }, (_, index) => {
    const baseDate = subDays(new Date(), Math.floor(Math.random() * 365));
    const admissionDate = subDays(baseDate, Math.floor(Math.random() * 10) + 1);
    const billAmount = Math.floor(Math.random() * 500000) + 10000;
    const approvedAmount = billAmount - Math.floor(Math.random() * 50000);
    const mouDiscount = Math.floor(Math.random() * 10000);
    const coPay = Math.floor(approvedAmount * 0.1);
    const consumableDeduction = Math.floor(Math.random() * 5000);
    const hospitalDiscount = Math.floor(Math.random() * 8000);
    const paidByPatient = coPay + Math.floor(Math.random() * 5000);
    const otherDeductions = Math.floor(Math.random() * 3000);
    const tds = Math.floor(approvedAmount * 0.1);
    const totalSettledAmount = approvedAmount - tds - otherDeductions;
    const differenceApprovedSettled = approvedAmount - totalSettledAmount;

    return {
      id: `claim_${index + 1}`,
      month: format(baseDate, 'MMMM yyyy'),
      baseDateOfDischarge: format(baseDate, 'yyyy-MM-dd'),
      dateOfAdmission: format(admissionDate, 'yyyy-MM-dd'),
      dateOfDischarge: format(baseDate, 'yyyy-MM-dd'),
      tpaName: tpaNames[Math.floor(Math.random() * tpaNames.length)],
      parentInsurance: insuranceCompanies[Math.floor(Math.random() * insuranceCompanies.length)],
      claimId: `CLM${String(index + 1).padStart(6, '0')}`,
      uhidIpNo: `UHID${String(index + 1).padStart(8, '0')}`,
      patientName: patientNames[Math.floor(Math.random() * patientNames.length)],
      billAmount,
      approvedAmount,
      mouDiscount,
      coPay,
      consumableDeduction,
      hospitalDiscount,
      paidByPatient,
      hospitalDiscountAuthority: authorities[Math.floor(Math.random() * authorities.length)],
      otherDeductions,
      physicalFileDispatch: ['pending', 'dispatched', 'received'][Math.floor(Math.random() * 3)] as 'pending' | 'dispatched' | 'received',
      dateOfUploadDispatch: format(addDays(baseDate, Math.floor(Math.random() * 30)), 'yyyy-MM-dd'),
      queryReplyDate: format(addDays(baseDate, Math.floor(Math.random() * 45)), 'yyyy-MM-dd'),
      settlementDate: format(addDays(baseDate, Math.floor(Math.random() * 60)), 'yyyy-MM-dd'),
      tds,
      amountSettledInAccount: totalSettledAmount,
      totalSettledAmount,
      differenceApprovedSettled,
      reasonForLessSettlement: differenceApprovedSettled > 0 ? reasons[Math.floor(Math.random() * reasons.length)] : '',
      claimSettledOnSoftware: Math.random() > 0.3,
      receiptAmountVerification: Math.random() > 0.2,
      createdAt: baseDate.toISOString(),
      updatedAt: baseDate.toISOString()
    };
  });
};

export const mockClaims = generateMockClaims();

export const calculateDashboardStats = (claims: Claim[]): DashboardStats => {
  return {
    totalBillAmount: claims.reduce((sum, claim) => sum + claim.billAmount, 0),
    totalApprovedAmount: claims.reduce((sum, claim) => sum + claim.approvedAmount, 0),
    totalTds: claims.reduce((sum, claim) => sum + claim.tds, 0),
    totalRejections: claims.filter(claim => claim.differenceApprovedSettled > claim.approvedAmount * 0.5).length,
    totalConsumables: claims.reduce((sum, claim) => sum + claim.consumableDeduction, 0),
    totalPaidByPatients: claims.reduce((sum, claim) => sum + claim.paidByPatient, 0)
  };
};

export const getMonthlyChartData = (claims: Claim[]): ChartData[] => {
  const monthlyData: { [key: string]: number } = {};
  
  claims.forEach(claim => {
    const month = claim.month;
    monthlyData[month] = (monthlyData[month] || 0) + claim.approvedAmount;
  });

  return Object.entries(monthlyData)
    .map(([month, value]) => ({ name: month, value }))
    .sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime())
    .slice(-12); // Last 12 months
};

export const getCompanyChartData = (claims: Claim[]): ChartData[] => {
  const companyData: { [key: string]: number } = {};
  
  claims.forEach(claim => {
    const company = claim.parentInsurance;
    companyData[company] = (companyData[company] || 0) + 1;
  });

  return Object.entries(companyData)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10); // Top 10 companies
};