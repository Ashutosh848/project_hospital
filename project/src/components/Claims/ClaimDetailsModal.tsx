import React from 'react';
import { X, Download, FileText, Calendar, DollarSign, Building, User, Upload } from 'lucide-react';
import { Claim } from '../../types';

interface ClaimDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  claim: Claim | null;
  onEdit?: (claim: Claim) => void;
}

export const ClaimDetailsModal: React.FC<ClaimDetailsModalProps> = ({
  isOpen,
  onClose,
  claim,
  onEdit
}) => {
  if (!isOpen || !claim) return null;

  const InfoRow: React.FC<{ icon: React.ElementType; label: string; value: string | number | boolean | null | undefined; isAmount?: boolean }> = ({
    icon: Icon,
    label,
    value,
    isAmount = false
  }) => {
    const formatValue = () => {
      if (value === null || value === undefined || value === '') {
        return 'N/A';
      }
      if (isAmount && typeof value === 'number') {
        return value.toLocaleString();
      }
      if (typeof value === 'boolean') {
        return value ? 'Yes' : 'No';
      }
      return value;
    };

    return (
      <div className="flex items-center space-x-3 py-2 border-b border-gray-100 last:border-b-0">
        <Icon className="w-4 h-4 text-gray-500 flex-shrink-0" />
        <div className="flex-1">
          <span className="text-sm font-medium text-gray-700">{label}:</span>
          <span className="ml-2 text-sm text-gray-900">{formatValue()}</span>
        </div>
      </div>
    );
  };

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
                <p className="text-sm text-gray-600">Claim ID: {claim.claim_id}</p>
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
                    <InfoRow icon={User} label="Patient Name" value={claim.patient_name} />
                    <InfoRow icon={FileText} label="UHID/IP No" value={claim.uhid_ip_no} />
                    <InfoRow icon={Calendar} label="Date of Admission" value={claim.date_of_admission ? new Date(claim.date_of_admission).toLocaleDateString() : 'N/A'} />
                    <InfoRow icon={Calendar} label="Date of Discharge" value={claim.date_of_discharge ? new Date(claim.date_of_discharge).toLocaleDateString() : 'N/A'} />
                  </div>
                </div>

                {/* Insurance Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="flex items-center text-lg font-medium text-gray-900 mb-4">
                    <Building className="w-5 h-5 mr-2" />
                    Insurance Information
                  </h4>
                  <div className="space-y-2">
                    <InfoRow icon={Building} label="TPA Name" value={claim.tpa_name} />
                    <InfoRow icon={Building} label="Parent Insurance" value={claim.parent_insurance} />
                    <InfoRow icon={FileText} label="Claim ID" value={claim.claim_id} />
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
                    <InfoRow icon={DollarSign} label="Bill Amount" value={claim.bill_amount} isAmount />
                    <InfoRow icon={DollarSign} label="Approved Amount" value={claim.approved_amount} isAmount />
                    <InfoRow icon={DollarSign} label="MOU Discount" value={claim.mou_discount} isAmount />
                    <InfoRow icon={DollarSign} label="Co-pay" value={claim.co_pay} isAmount />
                    <InfoRow icon={DollarSign} label="Consumable Deduction" value={claim.consumable_deduction} isAmount />
                    <InfoRow icon={DollarSign} label="Hospital Discount" value={claim.hospital_discount} isAmount />
                    <InfoRow icon={DollarSign} label="Paid by Patient" value={claim.paid_by_patient} isAmount />
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
                    <InfoRow icon={DollarSign} label="Other Deductions" value={claim.other_deductions} isAmount />
                    <InfoRow icon={DollarSign} label="Amount Settled in A/C" value={claim.amount_settled_in_ac} isAmount />
                    <InfoRow icon={DollarSign} label="Total Settled Amount" value={claim.total_settled_amount} isAmount />
                    <InfoRow icon={DollarSign} label="Difference (Approved vs Settled)" value={claim.difference_amount} isAmount />
                    <InfoRow icon={Calendar} label="Settlement Date" value={claim.settlement_date && claim.settlement_date.trim() !== '' ? new Date(claim.settlement_date).toLocaleDateString() : 'N/A'} />
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
                      <InfoRow icon={FileText} label="Hospital Discount Authority" value={claim.hospital_discount_authority || 'N/A'} />
                      <InfoRow icon={FileText} label="Physical File Dispatch" value={claim.physical_file_dispatch} />
                      <InfoRow icon={Calendar} label="Query Reply Date" value={claim.query_reply_date ? new Date(claim.query_reply_date).toLocaleDateString() : 'N/A'} />
                      <InfoRow icon={Calendar} label="Settlement Date" value={claim.settlement_date && claim.settlement_date.trim() !== '' ? new Date(claim.settlement_date).toLocaleDateString() : 'N/A'} />
                    </div>
                    <div className="space-y-2">
                      <InfoRow icon={FileText} label="Reason for Less Settlement" value={claim.reason_less_settlement || 'N/A'} />
                      <InfoRow icon={FileText} label="Claim Settled on Software" value={claim.claim_settled_software} />
                      <InfoRow icon={FileText} label="Receipt Amount Verification" value={claim.receipt_verified_bank} />
                    </div>
                  </div>
                </div>

                {/* File Management */}
                <div className="bg-purple-50 rounded-lg p-4 md:col-span-2">
                  <h4 className="flex items-center text-lg font-medium text-gray-900 mb-4">
                    <FileText className="w-5 h-5 mr-2" />
                    File Management
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Approval Letter */}
                    <div className="bg-white rounded-lg p-3 border">
                      <h5 className="font-medium text-gray-900 mb-2">Approval Letter</h5>
                      {claim.approval_letter && typeof claim.approval_letter === 'string' ? (
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-600" />
                          <span className="text-sm text-gray-600 flex-1 truncate">
                            {claim.approval_letter.split('/').pop()}
                          </span>
                          <button
                            onClick={() => window.open(claim.approval_letter as string, '_blank')}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">No file uploaded</span>
                      )}
                    </div>

                    {/* POD Upload */}
                    <div className="bg-white rounded-lg p-3 border">
                      <h5 className="font-medium text-gray-900 mb-2">POD Upload</h5>
                      {claim.physical_file_upload && typeof claim.physical_file_upload === 'string' ? (
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-gray-600 flex-1 truncate">
                            {claim.physical_file_upload.split('/').pop()}
                          </span>
                          <button
                            onClick={() => window.open(claim.physical_file_upload as string, '_blank')}
                            className="text-green-600 hover:text-green-900 transition-colors"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">No file uploaded</span>
                      )}
                    </div>

                    {/* Query on Claim */}
                    <div className="bg-white rounded-lg p-3 border">
                      <h5 className="font-medium text-gray-900 mb-2">Query on Claim</h5>
                      {claim.query_on_claim && typeof claim.query_on_claim === 'string' ? (
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-orange-600" />
                          <span className="text-sm text-gray-600 flex-1 truncate">
                            {claim.query_on_claim.split('/').pop()}
                          </span>
                          <button
                            onClick={() => window.open(claim.query_on_claim as string, '_blank')}
                            className="text-orange-600 hover:text-orange-900 transition-colors"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">No file uploaded</span>
                      )}
                    </div>
                  </div>
                  
                  {onEdit && (
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={() => {
                          onEdit(claim);
                          onClose();
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        <Upload className="w-4 h-4" />
                        Manage Files
                      </button>
                    </div>
                  )}
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