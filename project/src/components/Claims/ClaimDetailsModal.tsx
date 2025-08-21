import React from 'react';
import { X, Download, FileText, Calendar, DollarSign, Building, User } from 'lucide-react';
import { Claim } from '../../types';

interface ClaimDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  claim: Claim | null;
}

export const ClaimDetailsModal: React.FC<ClaimDetailsModalProps> = ({
  isOpen,
  onClose,
  claim
}) => {
  if (!isOpen || !claim) return null;

  const InfoRow: React.FC<{ icon: React.ElementType; label: string; value: string | number | boolean; isAmount?: boolean }> = ({
    icon: Icon,
    label,
    value,
    isAmount = false
  }) => (
    <div className="flex items-center space-x-3 py-2 border-b border-gray-100 last:border-b-0">
      <Icon className="w-4 h-4 text-gray-500 flex-shrink-0" />
      <div className="flex-1">
        <span className="text-sm font-medium text-gray-700">{label}:</span>
        <span className="ml-2 text-sm text-gray-900">
          {isAmount && typeof value === 'number' ? `₹${value.toLocaleString()}` : 
           typeof value === 'boolean' ? (value ? 'Yes' : 'No') : 
           value}
        </span>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="bg-white">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Claim Details</h3>
                <p className="text-sm text-gray-600">Claim ID: {claim.claimId}</p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Patient Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="flex items-center text-lg font-medium text-gray-900 mb-4">
                    <User className="w-5 h-5 mr-2" />
                    Patient Information
                  </h4>
                  <div className="space-y-2">
                    <InfoRow icon={User} label="Patient Name" value={claim.patientName} />
                    <InfoRow icon={FileText} label="UHID/IP No" value={claim.uhidIpNo} />
                    <InfoRow icon={Calendar} label="Date of Admission" value={new Date(claim.dateOfAdmission).toLocaleDateString()} />
                    <InfoRow icon={Calendar} label="Date of Discharge" value={new Date(claim.dateOfDischarge).toLocaleDateString()} />
                  </div>
                </div>

                {/* Insurance Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="flex items-center text-lg font-medium text-gray-900 mb-4">
                    <Building className="w-5 h-5 mr-2" />
                    Insurance Information
                  </h4>
                  <div className="space-y-2">
                    <InfoRow icon={Building} label="TPA Name" value={claim.tpaName} />
                    <InfoRow icon={Building} label="Parent Insurance" value={claim.parentInsurance} />
                    <InfoRow icon={FileText} label="Claim ID" value={claim.claimId} />
                    <InfoRow icon={Calendar} label="Month" value={claim.month} />
                  </div>
                </div>

                {/* Financial Information */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="flex items-center text-lg font-medium text-gray-900 mb-4">
                    <DollarSign className="w-5 h-5 mr-2" />
                    Financial Details
                  </h4>
                  <div className="space-y-2">
                    <InfoRow icon={DollarSign} label="Bill Amount" value={claim.billAmount} isAmount />
                    <InfoRow icon={DollarSign} label="Approved Amount" value={claim.approvedAmount} isAmount />
                    <InfoRow icon={DollarSign} label="MOU Discount" value={claim.mouDiscount} isAmount />
                    <InfoRow icon={DollarSign} label="Co-pay" value={claim.coPay} isAmount />
                    <InfoRow icon={DollarSign} label="Consumable Deduction" value={claim.consumableDeduction} isAmount />
                    <InfoRow icon={DollarSign} label="Hospital Discount" value={claim.hospitalDiscount} isAmount />
                    <InfoRow icon={DollarSign} label="Paid by Patient" value={claim.paidByPatient} isAmount />
                  </div>
                </div>

                {/* Settlement Information */}
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="flex items-center text-lg font-medium text-gray-900 mb-4">
                    <DollarSign className="w-5 h-5 mr-2" />
                    Settlement Details
                  </h4>
                  <div className="space-y-2">
                    <InfoRow icon={DollarSign} label="TDS" value={claim.tds} isAmount />
                    <InfoRow icon={DollarSign} label="Other Deductions" value={claim.otherDeductions} isAmount />
                    <InfoRow icon={DollarSign} label="Amount Settled in A/C" value={claim.amountSettledInAccount} isAmount />
                    <InfoRow icon={DollarSign} label="Total Settled Amount" value={claim.totalSettledAmount} isAmount />
                    <InfoRow icon={DollarSign} label="Difference (Approved vs Settled)" value={claim.differenceApprovedSettled} isAmount />
                    <InfoRow icon={Calendar} label="Settlement Date" value={new Date(claim.settlementDate).toLocaleDateString()} />
                  </div>
                </div>

                {/* Process Information */}
                <div className="bg-yellow-50 rounded-lg p-4 md:col-span-2">
                  <h4 className="flex items-center text-lg font-medium text-gray-900 mb-4">
                    <FileText className="w-5 h-5 mr-2" />
                    Process Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <InfoRow icon={FileText} label="Hospital Discount Authority" value={claim.hospitalDiscountAuthority} />
                      <InfoRow icon={FileText} label="Physical File Dispatch" value={claim.physicalFileDispatch} />
                      <InfoRow icon={Calendar} label="Date of Upload/Dispatch" value={new Date(claim.dateOfUploadDispatch).toLocaleDateString()} />
                      <InfoRow icon={Calendar} label="Query Reply Date" value={new Date(claim.queryReplyDate).toLocaleDateString()} />
                    </div>
                    <div className="space-y-2">
                      <InfoRow icon={FileText} label="Reason for Less Settlement" value={claim.reasonForLessSettlement || 'N/A'} />
                      <InfoRow icon={FileText} label="Claim Settled on Software" value={claim.claimSettledOnSoftware} />
                      <InfoRow icon={FileText} label="Receipt Amount Verification" value={claim.receiptAmountVerification} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};