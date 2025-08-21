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
      claim.claimId,
      claim.month,
      claim.dateOfAdmission,
      claim.dateOfDischarge,
      claim.tpaName,
      claim.parentInsurance,
      claim.uhidIpNo,
      claim.patientName,
      claim.billAmount,
      claim.approvedAmount,
      claim.mouDiscount,
      claim.coPay,
      claim.consumableDeduction,
      claim.hospitalDiscount,
      claim.paidByPatient,
      claim.hospitalDiscountAuthority,
      claim.otherDeductions,
      claim.physicalFileDispatch,
      claim.dateOfUploadDispatch,
      claim.queryReplyDate,
      claim.settlementDate,
      claim.tds,
      claim.amountSettledInAccount,
      claim.totalSettledAmount,
      claim.differenceApprovedSettled,
      claim.reasonForLessSettlement,
      claim.claimSettledOnSoftware ? 'Yes' : 'No',
      claim.receiptAmountVerification ? 'Yes' : 'No'
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