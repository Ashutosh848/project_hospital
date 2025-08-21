import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { X, Upload } from 'lucide-react';
import { Claim } from '../../types';
import { format } from 'date-fns';

const schema = yup.object({
  dateOfAdmission: yup.string().required('Date of admission is required'),
  dateOfDischarge: yup.string().required('Date of discharge is required'),
  tpaName: yup.string().required('TPA name is required'),
  parentInsurance: yup.string().required('Parent insurance is required'),
  claimId: yup.string().required('Claim ID is required'),
  uhidIpNo: yup.string().required('UHID/IP No is required'),
  patientName: yup.string().required('Patient name is required'),
  billAmount: yup.number().positive('Bill amount must be positive').required('Bill amount is required'),
  approvedAmount: yup.number().positive('Approved amount must be positive').required('Approved amount is required'),
  mouDiscount: yup.number().min(0, 'MOU discount cannot be negative').required('MOU discount is required'),
  coPay: yup.number().min(0, 'Co-pay cannot be negative').required('Co-pay is required'),
  consumableDeduction: yup.number().min(0, 'Consumable deduction cannot be negative').required('Consumable deduction is required'),
  hospitalDiscount: yup.number().min(0, 'Hospital discount cannot be negative').required('Hospital discount is required'),
  paidByPatient: yup.number().min(0, 'Paid by patient cannot be negative').required('Paid by patient is required'),
  hospitalDiscountAuthority: yup.string().required('Hospital discount authority is required'),
  otherDeductions: yup.number().min(0, 'Other deductions cannot be negative').required('Other deductions is required'),
  physicalFileDispatch: yup.string().oneOf(['pending', 'dispatched', 'received']).required('Physical file dispatch status is required'),
  dateOfUploadDispatch: yup.string().required('Date of upload/dispatch is required'),
  queryReplyDate: yup.string().required('Query reply date is required'),
  settlementDate: yup.string().required('Settlement date is required'),
  tds: yup.number().min(0, 'TDS cannot be negative').required('TDS is required'),
  amountSettledInAccount: yup.number().min(0, 'Amount settled in account cannot be negative').required('Amount settled in account is required'),
  totalSettledAmount: yup.number().min(0, 'Total settled amount cannot be negative').required('Total settled amount is required'),
  reasonForLessSettlement: yup.string(),
  claimSettledOnSoftware: yup.boolean().required(),
  receiptAmountVerification: yup.boolean().required()
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
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: initialData || {}
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    } else {
      reset({
        dateOfAdmission: '',
        dateOfDischarge: '',
        tpaName: '',
        parentInsurance: '',
        claimId: '',
        uhidIpNo: '',
        patientName: '',
        billAmount: 0,
        approvedAmount: 0,
        mouDiscount: 0,
        coPay: 0,
        consumableDeduction: 0,
        hospitalDiscount: 0,
        paidByPatient: 0,
        hospitalDiscountAuthority: '',
        otherDeductions: 0,
        physicalFileDispatch: 'pending',
        dateOfUploadDispatch: '',
        queryReplyDate: '',
        settlementDate: '',
        tds: 0,
        amountSettledInAccount: 0,
        totalSettledAmount: 0,
        reasonForLessSettlement: '',
        claimSettledOnSoftware: false,
        receiptAmountVerification: false
      });
    }
  }, [initialData, reset]);

  // Auto-calculate fields
  const approvedAmount = watch('approvedAmount');
  const tds = watch('tds');
  const otherDeductions = watch('otherDeductions');

  useEffect(() => {
    if (approvedAmount && tds >= 0 && otherDeductions >= 0) {
      const totalSettled = approvedAmount - tds - otherDeductions;
      const difference = approvedAmount - totalSettled;
      
      setValue('totalSettledAmount', totalSettled);
      setValue('amountSettledInAccount', totalSettled);
      setValue('differenceApprovedSettled', difference);
    }
  }, [approvedAmount, tds, otherDeductions, setValue]);

  const handleFormSubmit = (data: any) => {
    const formattedData = {
      ...data,
      month: format(new Date(data.dateOfDischarge), 'MMMM yyyy'),
      baseDateOfDischarge: data.dateOfDischarge,
      differenceApprovedSettled: data.approvedAmount - data.totalSettledAmount,
      createdAt: initialData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    onSubmit(formattedData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="bg-white px-6 pt-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">{title}</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
              <div className="max-h-96 overflow-y-auto">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Admission *
                    </label>
                    <input
                      type="date"
                      {...register('dateOfAdmission')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.dateOfAdmission && (
                      <p className="mt-1 text-sm text-red-600">{errors.dateOfAdmission.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Discharge *
                    </label>
                    <input
                      type="date"
                      {...register('dateOfDischarge')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.dateOfDischarge && (
                      <p className="mt-1 text-sm text-red-600">{errors.dateOfDischarge.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      TPA Name *
                    </label>
                    <input
                      type="text"
                      {...register('tpaName')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.tpaName && (
                      <p className="mt-1 text-sm text-red-600">{errors.tpaName.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Parent Insurance *
                    </label>
                    <input
                      type="text"
                      {...register('parentInsurance')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.parentInsurance && (
                      <p className="mt-1 text-sm text-red-600">{errors.parentInsurance.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Claim ID *
                    </label>
                    <input
                      type="text"
                      {...register('claimId')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.claimId && (
                      <p className="mt-1 text-sm text-red-600">{errors.claimId.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      UHID/IP No *
                    </label>
                    <input
                      type="text"
                      {...register('uhidIpNo')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.uhidIpNo && (
                      <p className="mt-1 text-sm text-red-600">{errors.uhidIpNo.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Patient Name *
                    </label>
                    <input
                      type="text"
                      {...register('patientName')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.patientName && (
                      <p className="mt-1 text-sm text-red-600">{errors.patientName.message}</p>
                    )}
                  </div>
                </div>

                {/* Financial Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bill Amount *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      {...register('billAmount', { valueAsNumber: true })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.billAmount && (
                      <p className="mt-1 text-sm text-red-600">{errors.billAmount.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Approved Amount *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      {...register('approvedAmount', { valueAsNumber: true })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.approvedAmount && (
                      <p className="mt-1 text-sm text-red-600">{errors.approvedAmount.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      MOU Discount *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      {...register('mouDiscount', { valueAsNumber: true })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.mouDiscount && (
                      <p className="mt-1 text-sm text-red-600">{errors.mouDiscount.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Co-pay *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      {...register('coPay', { valueAsNumber: true })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.coPay && (
                      <p className="mt-1 text-sm text-red-600">{errors.coPay.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Consumable Deduction *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      {...register('consumableDeduction', { valueAsNumber: true })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.consumableDeduction && (
                      <p className="mt-1 text-sm text-red-600">{errors.consumableDeduction.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hospital Discount *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      {...register('hospitalDiscount', { valueAsNumber: true })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.hospitalDiscount && (
                      <p className="mt-1 text-sm text-red-600">{errors.hospitalDiscount.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Paid by Patient *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      {...register('paidByPatient', { valueAsNumber: true })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.paidByPatient && (
                      <p className="mt-1 text-sm text-red-600">{errors.paidByPatient.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hospital Discount Authority *
                    </label>
                    <input
                      type="text"
                      {...register('hospitalDiscountAuthority')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.hospitalDiscountAuthority && (
                      <p className="mt-1 text-sm text-red-600">{errors.hospitalDiscountAuthority.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Other Deductions *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      {...register('otherDeductions', { valueAsNumber: true })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.otherDeductions && (
                      <p className="mt-1 text-sm text-red-600">{errors.otherDeductions.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Approval Letter Upload (PDF)
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="file"
                        accept=".pdf"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                      <Upload className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      TDS *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      {...register('tds', { valueAsNumber: true })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.tds && (
                      <p className="mt-1 text-sm text-red-600">{errors.tds.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Settled Amount *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      {...register('totalSettledAmount', { valueAsNumber: true })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                      readOnly
                    />
                  </div>
                </div>

                {/* Process Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Physical File Dispatch *
                    </label>
                    <select
                      {...register('physicalFileDispatch')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="pending">Pending</option>
                      <option value="dispatched">Dispatched</option>
                      <option value="received">Received</option>
                    </select>
                    {errors.physicalFileDispatch && (
                      <p className="mt-1 text-sm text-red-600">{errors.physicalFileDispatch.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Upload/Dispatch *
                    </label>
                    <input
                      type="date"
                      {...register('dateOfUploadDispatch')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.dateOfUploadDispatch && (
                      <p className="mt-1 text-sm text-red-600">{errors.dateOfUploadDispatch.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      POD Upload (PDF Format)
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="file"
                        accept=".pdf"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                      <Upload className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Query on Claim (PDF Format)
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="file"
                        accept=".pdf"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                      <Upload className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Query Reply Date *
                    </label>
                    <input
                      type="date"
                      {...register('queryReplyDate')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.queryReplyDate && (
                      <p className="mt-1 text-sm text-red-600">{errors.queryReplyDate.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Query Reply Upload (PDF Format)
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="file"
                        accept=".pdf"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                      <Upload className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Settlement Date *
                    </label>
                    <input
                      type="date"
                      {...register('settlementDate')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.settlementDate && (
                      <p className="mt-1 text-sm text-red-600">{errors.settlementDate.message}</p>
                    )}
                  </div>

                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reason for Less Settlement
                    </label>
                    <input
                      type="text"
                      {...register('reasonForLessSettlement')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Boolean Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      {...register('claimSettledOnSoftware')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      Claim Settled on Software
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      {...register('receiptAmountVerification')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      Receipt Amount Verification in Bank Account
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {initialData ? 'Update' : 'Create'} Claim
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};