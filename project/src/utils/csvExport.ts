import { Claim } from '../types';

export const exportToCSV = (claims: Claim[], filename: string = 'claims-export.csv') => {
  const headers = [
    'Claim ID',
    'Month',
    'Date of Admission',
    'Date of Discharge',
    'TPA Name',
    'Parent Insurance',
    'UHID/IP No',
    'Patient Name',
    'Bill Amount',
    'Approved Amount',
    'MOU Discount',
    'Co-pay',
    'Consumable Deduction',
    'Hospital Discount',
    'Paid by Patient',
    'Hospital Discount Authority',
    'Other Deductions',
    'Physical File Dispatch',
    'Date of Upload/Dispatch',
    'Query Reply Date',
    'Settlement Date',
    'TDS',
    'Amount Settled in A/C',
    'Total Settled Amount',
    'Difference between Approved & Settled Amount',
    'Reason for Less Settlement',
    'Claim Settled on Software',
    'Receipt Amount Verification'
  ];

  const csvContent = [
    headers.join(','),
    ...claims.map(claim => [
      claim.claim_id,
      claim.month,
      claim.date_of_admission,
      claim.date_of_discharge,
      claim.tpa_name,
      claim.parent_insurance,
      claim.uhid_ip_no,
      claim.patient_name,
      claim.bill_amount,
      claim.approved_amount,
      claim.mou_discount,
      claim.co_pay,
      claim.consumable_deduction,
      claim.hospital_discount,
      claim.paid_by_patient,
      claim.hospital_discount_authority,
      claim.other_deductions,
      claim.physical_file_dispatch,
      claim.date_of_upload_dispatch || '',
      claim.query_reply_date,
      claim.settlement_date,
      claim.tds,
      claim.amount_settled_in_ac,
      claim.total_settled_amount,
      claim.difference_amount,
      claim.reason_less_settlement,
      claim.claim_settled_software ? 'Yes' : 'No',
      claim.receipt_verified_bank ? 'Yes' : 'No'
    ].map(field => `"${field}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};