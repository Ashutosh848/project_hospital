import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { X, Upload, Trash2, Download } from 'lucide-react';
import { Claim, ClaimFormData } from '../../types';
import { format } from 'date-fns';
import { claimsService } from '../../services/claimsService';

const schema = yup.object<ClaimFormData>({
  date_of_admission: yup.string().nullable().optional(),
  date_of_discharge: yup.string().nullable().optional(),
  tpa_name: yup.string().nullable().optional(),
  parent_insurance: yup.string().nullable().optional(),
  claim_id: yup.string().nullable().optional(),
  uhid_ip_no: yup.string().nullable().optional(),
  patient_name: yup.string().nullable().optional(),
  bill_amount: yup.number().nullable().min(0, 'Bill amount cannot be negative').optional(),
  approved_amount: yup.number().nullable().min(0, 'Approved amount cannot be negative').optional(),
  mou_discount: yup.number().nullable().min(0, 'MOU discount cannot be negative').optional(),
  co_pay: yup.number().nullable().min(0, 'Co-pay cannot be negative').optional(),
  consumable_deduction: yup.number().nullable().min(0, 'Consumable deduction cannot be negative').optional(),
  hospital_discount: yup.number().nullable().min(0, 'Hospital discount cannot be negative').optional(),
  paid_by_patient: yup.number().nullable().min(0, 'Paid by patient cannot be negative').optional(),
  hospital_discount_authority: yup.string().nullable().optional(),
  other_deductions: yup.number().nullable().min(0, 'Other deductions cannot be negative').optional(),
  physical_file_dispatch: yup.string().oneOf(['pending', 'dispatched', 'received', 'not_required']).optional(),
  query_reply_date: yup.string().nullable().optional(),
  settlement_date: yup.string().nullable().optional(),
  tds: yup.number().nullable().min(0, 'TDS cannot be negative').optional(),
  amount_settled_in_ac: yup.number().nullable().min(0, 'Amount settled in account cannot be negative').optional(),
  total_settled_amount: yup.number().nullable().min(0, 'Total settled amount cannot be negative').optional(),
  reason_less_settlement: yup.string().nullable().optional(),
  claim_settled_software: yup.boolean().optional(),
  receipt_verified_bank: yup.boolean().optional(),
  approval_letter: yup.mixed().optional(),
  physical_file_upload: yup.mixed().optional(),
  query_on_claim: yup.mixed().optional(),
  query_reply_upload: yup.mixed().optional()
});



interface ClaimFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (claim: Partial<Claim>) => void;
  initialData?: Claim | null;
  title: string;
}

export const ClaimForm: React.FC<ClaimFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  title
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue
  } = useForm<ClaimFormData>({
    resolver: yupResolver(schema),
    defaultValues: {}
  });

  const [deletedFiles, setDeletedFiles] = useState<Set<string>>(new Set());

  const handleDeleteFile = async (fileField: string) => {
    if (initialData?.id) {
      try {
        await claimsService.deleteClaimFile(initialData.id, fileField);
        setDeletedFiles(prev => new Set([...prev, fileField]));
      } catch (error) {
        console.error('Failed to delete file:', error);
        alert('Failed to delete file. Please try again.');
      }
    }
  };

  const getFileName = (fileUrl: string | File | null) => {
    if (!fileUrl) return '';
    if (typeof fileUrl === 'string') {
      return fileUrl.split('/').pop() || 'File';
    }
    return fileUrl.name || 'File';
  };

  const renderFileField = (
    fieldName: string,
    label: string,
    fileValue: string | File | null
  ) => {
    const hasExistingFile = fileValue && typeof fileValue === 'string' && !deletedFiles.has(fieldName);
    
    return (
      <div>
        <label className="block text-base font-semibold text-gray-900 mb-2">
          {label}
        </label>
        
        {hasExistingFile && (
          <div className="mb-3 p-3 bg-gray-50 border border-gray-200 rounded-md flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Download className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-gray-700">
                {getFileName(fileValue)}
              </span>
              <a
                href={fileValue as string}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                View
              </a>
            </div>
            <button
              type="button"
              onClick={() => handleDeleteFile(fieldName)}
              className="text-red-600 hover:text-red-800 p-1"
              title="Delete file"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
        
        <div className="flex items-center space-x-2">
          <input
            type="file"
            accept=".pdf"
            {...register(fieldName as keyof ClaimFormData)}
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
          <Upload className="w-5 h-5 text-gray-400" />
        </div>
      </div>
    );
  };

  useEffect(() => {
    if (initialData) {
      // Convert Claim type to ClaimFormData type
      const formData: ClaimFormData = {
        date_of_admission: initialData.date_of_admission || '',
        date_of_discharge: initialData.date_of_discharge || '',
        tpa_name: initialData.tpa_name || '',
        parent_insurance: initialData.parent_insurance || '',
        claim_id: initialData.claim_id || '',
        uhid_ip_no: initialData.uhid_ip_no || '',
        patient_name: initialData.patient_name || '',
        bill_amount: initialData.bill_amount || undefined,
        approved_amount: initialData.approved_amount || undefined,
        mou_discount: initialData.mou_discount || undefined,
        co_pay: initialData.co_pay || undefined,
        consumable_deduction: initialData.consumable_deduction || undefined,
        hospital_discount: initialData.hospital_discount || undefined,
        paid_by_patient: initialData.paid_by_patient || undefined,
        hospital_discount_authority: initialData.hospital_discount_authority || '',
        other_deductions: initialData.other_deductions || undefined,
        physical_file_dispatch: initialData.physical_file_dispatch || 'pending',
        query_reply_date: initialData.query_reply_date || '',
        settlement_date: initialData.settlement_date || '',
        tds: initialData.tds || undefined,
        amount_settled_in_ac: initialData.amount_settled_in_ac || undefined,
        total_settled_amount: initialData.total_settled_amount || undefined,
        reason_less_settlement: initialData.reason_less_settlement || '',
        claim_settled_software: initialData.claim_settled_software || false,
        receipt_verified_bank: initialData.receipt_verified_bank || false
      };
      reset(formData);
    } else {
      reset({
        date_of_admission: '',
        date_of_discharge: '',
        tpa_name: '',
        parent_insurance: '',
        claim_id: '',
        uhid_ip_no: '',
        patient_name: '',
        bill_amount: undefined,
        approved_amount: undefined,
        mou_discount: undefined,
        co_pay: undefined,
        consumable_deduction: undefined,
        hospital_discount: undefined,
        paid_by_patient: undefined,
        hospital_discount_authority: '',
        other_deductions: undefined,
        physical_file_dispatch: 'pending',
        query_reply_date: '',
        settlement_date: '',
        tds: undefined,
        amount_settled_in_ac: undefined,
        total_settled_amount: undefined,
        reason_less_settlement: '',
        claim_settled_software: false,
        receipt_verified_bank: false
      });
    }
  }, [initialData, reset]);

  // Auto-calculate fields
  const approvedAmount = watch('approved_amount');
  const tds = watch('tds');
  const otherDeductions = watch('other_deductions');

  useEffect(() => {
    if (approvedAmount && tds !== undefined && otherDeductions !== undefined) {
      const totalSettled = approvedAmount - (tds || 0) - (otherDeductions || 0);
      
      setValue('total_settled_amount', totalSettled);
      setValue('amount_settled_in_ac', totalSettled);
      // Note: difference_amount is calculated by backend
    }
  }, [approvedAmount, tds, otherDeductions, setValue]);

  const handleFormSubmit = (data: any) => {
    // Create FormData and add all form fields
    const formData = new FormData();
    
    // Helper function to check if a value is meaningful
    const hasValue = (value: any): boolean => {
      if (value === undefined || value === null) return false;
      if (typeof value === 'string') return value.trim() !== '';
      if (typeof value === 'number') return !isNaN(value);
      if (typeof value === 'boolean') return true;
      return true;
    };
    
    // Add all form data - only include fields with meaningful values
    Object.keys(data).forEach(key => {
      // Handle file fields
      if (['approval_letter', 'physical_file_upload', 'query_on_claim', 'query_reply_upload'].includes(key)) {
        if (data[key] instanceof FileList && data[key].length > 0) {
          const file = data[key][0];
          if (file && file.size > 0 && file.name && file.name.trim() !== '') {
            formData.append(key, file);
          }
        } else if (data[key] instanceof File) {
          if (data[key].size > 0 && data[key].name && data[key].name.trim() !== '') {
            formData.append(key, data[key]);
          }
        }
        // Skip empty file fields completely
        return;
      }
      
      // Handle non-file fields - only include if they have meaningful values
      if (hasValue(data[key])) {
        // Convert empty strings to null for optional fields
        if (typeof data[key] === 'string' && data[key].trim() === '') {
          formData.append(key, 'null');
        } else {
          formData.append(key, String(data[key]));
        }
      }
      // Skip empty/null fields completely - let backend handle defaults
    });
    
    // Add calculated fields - only if we have valid data
    if (data.date_of_discharge && data.date_of_discharge.trim() !== '') {
      try {
        const dischargeDate = new Date(data.date_of_discharge);
        if (!isNaN(dischargeDate.getTime())) {
          formData.append('month', format(dischargeDate, 'yyyy-MM'));
        }
      } catch (error) {
        console.warn('Invalid discharge date:', data.date_of_discharge);
      }
    }
    
    // Calculate difference amount only if we have valid amounts
    if (data.approved_amount && data.total_settled_amount) {
      const difference = (data.approved_amount || 0) - (data.total_settled_amount || 0);
      formData.append('difference_amount', String(difference));
    }
    
    // Handle timestamps - preserve original created_at, update updated_at
    if (initialData?.created_at) {
      formData.append('created_at', initialData.created_at);
    } else {
      formData.append('created_at', new Date().toISOString());
    }
    formData.append('updated_at', new Date().toISOString());
    
    // Debug: Log what's being sent
    console.log('FormData being sent:');
    for (const [key, value] of formData.entries()) {
      console.log(key, value);
    }
    
    // Pass FormData directly to onSubmit
    onSubmit(formData as any);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-7xl sm:w-full">
          <div className="bg-white px-8 pt-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-semibold text-gray-900">{title}</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-8 h-8" />
              </button>
            </div>

            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
              <div className="max-h-[70vh] overflow-y-auto">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  <div>
                    <label className="block text-base font-semibold text-gray-900 mb-2">
                      Date of Admission (Optional)
                    </label>
                    <input
                      type="date"
                      {...register('date_of_admission')}
                      name="date_of_admission"
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.date_of_admission && (
                      <p className="mt-1 text-sm text-red-600">{errors.date_of_admission.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-base font-semibold text-gray-900 mb-2">
                      Date of Discharge (Optional)
                    </label>
                    <input
                      type="date"
                      {...register('date_of_discharge')}
                      name="date_of_discharge"
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.date_of_discharge && (
                      <p className="mt-1 text-sm text-red-600">{errors.date_of_discharge.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-base font-semibold text-gray-900 mb-2">
                      TPA Name (Optional)
                    </label>
                    <input
                      type="text"
                      {...register('tpa_name')}
                      name="tpa_name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.tpa_name && (
                      <p className="mt-1 text-sm text-red-600">{errors.tpa_name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-base font-semibold text-gray-900 mb-2">
                      Parent Insurance
                    </label>
                    <input
                      type="text"
                      {...register('parent_insurance')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.parent_insurance && (
                      <p className="mt-1 text-sm text-red-600">{errors.parent_insurance.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-base font-semibold text-gray-900 mb-2">
                      Claim ID
                    </label>
                    <input
                      type="text"
                      {...register('claim_id')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.claim_id && (
                      <p className="mt-1 text-sm text-red-600">{errors.claim_id.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-base font-semibold text-gray-900 mb-2">
                      UHID/IP No
                    </label>
                    <input
                      type="text"
                      {...register('uhid_ip_no')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.uhid_ip_no && (
                      <p className="mt-1 text-sm text-red-600">{errors.uhid_ip_no.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-base font-semibold text-gray-900 mb-2">
                      Patient Name (Optional)
                    </label>
                    <input
                      type="text"
                      {...register('patient_name')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.patient_name && (
                      <p className="mt-1 text-sm text-red-600">{errors.patient_name.message}</p>
                    )}
                  </div>
                </div>

                {/* Financial Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  <div>
                    <label className="block text-base font-semibold text-gray-900 mb-2">
                      Bill Amount
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      {...register('bill_amount', { valueAsNumber: true })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.bill_amount && (
                      <p className="mt-1 text-sm text-red-600">{errors.bill_amount.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-base font-semibold text-gray-900 mb-2">
                      Approved Amount
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      {...register('approved_amount', { valueAsNumber: true })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.approved_amount && (
                      <p className="mt-1 text-sm text-red-600">{errors.approved_amount.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-base font-semibold text-gray-900 mb-2">
                      MOU Discount
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      {...register('mou_discount', { valueAsNumber: true })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.mou_discount && (
                      <p className="mt-1 text-sm text-red-600">{errors.mou_discount.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-base font-semibold text-gray-900 mb-2">
                      Co-pay
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      {...register('co_pay', { valueAsNumber: true })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.co_pay && (
                      <p className="mt-1 text-sm text-red-600">{errors.co_pay.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-base font-semibold text-gray-900 mb-2">
                      Consumable Deduction
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      {...register('consumable_deduction', { valueAsNumber: true })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.consumable_deduction && (
                      <p className="mt-1 text-sm text-red-600">{errors.consumable_deduction.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-base font-semibold text-gray-900 mb-2">
                      Hospital Discount
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      {...register('hospital_discount', { valueAsNumber: true })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.hospital_discount && (
                      <p className="mt-1 text-sm text-red-600">{errors.hospital_discount.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-base font-semibold text-gray-900 mb-2">
                      Paid by Patient
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      {...register('paid_by_patient', { valueAsNumber: true })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.paid_by_patient && (
                      <p className="mt-1 text-sm text-red-600">{errors.paid_by_patient.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-base font-semibold text-gray-900 mb-2">
                      Hospital Discount Authority
                    </label>
                    <input
                      type="text"
                      {...register('hospital_discount_authority')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.hospital_discount_authority && (
                      <p className="mt-1 text-sm text-red-600">{errors.hospital_discount_authority.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-base font-semibold text-gray-900 mb-2">
                      Other Deductions
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      {...register('other_deductions', { valueAsNumber: true })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.other_deductions && (
                      <p className="mt-1 text-sm text-red-600">{errors.other_deductions.message}</p>
                    )}
                  </div>

                  {renderFileField('approval_letter', 'Approval Letter Upload (PDF)', initialData?.approval_letter)}

                  <div>
                    <label className="block text-base font-semibold text-gray-900 mb-2">
                      TDS
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      {...register('tds', { valueAsNumber: true })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.tds && (
                      <p className="mt-1 text-sm text-red-600">{errors.tds.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-base font-semibold text-gray-900 mb-2">
                      Total Settled Amount
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      {...register('total_settled_amount', { valueAsNumber: true })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                      readOnly
                    />
                  </div>
                </div>

                {/* Process Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  <div>
                    <label className="block text-base font-semibold text-gray-900 mb-2">
                      Physical File Dispatch
                    </label>
                    <select
                      {...register('physical_file_dispatch')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="pending">Pending</option>
                      <option value="dispatched">Dispatched</option>
                      <option value="received">Received</option>
                      <option value="not_required">Not Required</option>
                    </select>
                    {errors.physical_file_dispatch && (
                      <p className="mt-1 text-sm text-red-600">{errors.physical_file_dispatch.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-base font-semibold text-gray-900 mb-2">
                      Date of Upload/Dispatch
                    </label>
                    <input
                      type="date"
                      {...register('query_reply_date')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.query_reply_date && (
                      <p className="mt-1 text-sm text-red-600">{errors.query_reply_date.message}</p>
                    )}
                  </div>

                  {renderFileField('physical_file_upload', 'POD Upload (PDF Format)', initialData?.physical_file_upload)}

                  {renderFileField('query_on_claim', 'Query on Claim (PDF Format)', initialData?.query_on_claim)}

                  <div>
                    <label className="block text-base font-semibold text-gray-900 mb-2">
                      Query Reply Date
                    </label>
                    <input
                      type="date"
                      {...register('query_reply_date')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.query_reply_date && (
                      <p className="mt-1 text-sm text-red-600">{errors.query_reply_date.message}</p>
                    )}
                  </div>

                  {renderFileField('query_reply_upload', 'Query Reply Upload (PDF Format)', initialData?.query_reply_upload)}

                  <div>
                    <label className="block text-base font-semibold text-gray-900 mb-2">
                      Settlement Date
                    </label>
                    <input
                      type="date"
                      {...register('settlement_date')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.settlement_date && (
                      <p className="mt-1 text-sm text-red-600">{errors.settlement_date.message}</p>
                    )}
                  </div>

                  <div className="lg:col-span-2">
                    <label className="block text-base font-semibold text-gray-900 mb-2">
                      Reason for Less Settlement
                    </label>
                    <input
                      type="text"
                      {...register('reason_less_settlement')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Boolean Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      {...register('claim_settled_software')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      Claim Settled on Software
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      {...register('receipt_verified_bank')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      Receipt Amount Verification in Bank Account
                    </label>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 pt-6 pb-4 border-t border-gray-200 bg-gray-50 -mx-8 px-8">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-base font-semibold text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    {initialData ? 'Update' : 'Create'} Claim
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};