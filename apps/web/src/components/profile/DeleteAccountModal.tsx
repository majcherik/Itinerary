import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { AlertTriangle, X } from 'lucide-react';
import { requestAccountDeletionSchema, RequestAccountDeletionInput, useRequestAccountDeletion, useProfile } from '@itinerary/shared';
import Modal from '../Modal';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function DeleteAccountModal({ isOpen, onClose }: DeleteAccountModalProps) {
  const [confirmed, setConfirmed] = useState(false);
  const { data: profile } = useProfile();
  const requestDeletion = useRequestAccountDeletion();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<RequestAccountDeletionInput>({
    resolver: zodResolver(requestAccountDeletionSchema),
    defaultValues: {
      reason: '',
      confirmEmail: '',
    },
  });

  const emailMatch = watch('confirmEmail') === profile?.email;

  const onSubmit = async (data: RequestAccountDeletionInput) => {
    if (!confirmed) {
      toast.error('Please confirm you understand the consequences');
      return;
    }

    try {
      await requestDeletion.mutateAsync(data);
      toast.success('Account deletion scheduled for 30 days from now. You can cancel anytime before then.');
      reset();
      setConfirmed(false);
      onClose();
    } catch (error) {
      toast.error('Failed to request account deletion');
      console.error(error);
    }
  };

  const handleClose = () => {
    reset();
    setConfirmed(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle size={24} className="text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-text-primary">Delete Account</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-bg-secondary rounded-lg transition-colors"
          >
            <X size={20} className="text-text-secondary" />
          </button>
        </div>

        {/* Warning */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-red-900 mb-2">Warning: This action cannot be undone</h3>
          <p className="text-sm text-red-700 mb-2">
            Deleting your account will permanently remove:
          </p>
          <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
            <li>All your trips and itineraries</li>
            <li>All expenses and financial data</li>
            <li>All documents and packing lists</li>
            <li>Your profile and preferences</li>
            <li>All shared trip links</li>
          </ul>
          <p className="text-sm text-red-700 mt-3 font-medium">
            You'll have a 30-day grace period to cancel this request.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Reason (optional) */}
          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-text-primary mb-2">
              Reason for leaving (optional)
            </label>
            <textarea
              id="reason"
              {...register('reason')}
              rows={3}
              placeholder="Help us improve by telling us why you're leaving..."
              className="w-full px-3 py-2 rounded-lg border border-border-color bg-bg-primary focus:outline-none focus:ring-2 focus:ring-accent transition-colors resize-none"
            />
            {errors.reason && (
              <p className="text-xs text-red-500 mt-1">{errors.reason.message}</p>
            )}
          </div>

          {/* Email Confirmation */}
          <div>
            <label htmlFor="confirmEmail" className="block text-sm font-medium text-text-primary mb-2">
              Confirm your email to continue
            </label>
            <input
              id="confirmEmail"
              type="email"
              {...register('confirmEmail')}
              placeholder={profile?.email ?? 'Enter your email'}
              className="w-full px-3 py-2 rounded-lg border border-border-color bg-bg-primary focus:outline-none focus:ring-2 focus:ring-accent transition-colors"
            />
            {errors.confirmEmail && (
              <p className="text-xs text-red-500 mt-1">{errors.confirmEmail.message}</p>
            )}
            {watch('confirmEmail') && !emailMatch && (
              <p className="text-xs text-red-500 mt-1">Email doesn't match</p>
            )}
          </div>

          {/* Confirmation Checkbox */}
          <div className="border-t border-border-color pt-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="w-4 h-4 mt-0.5 text-red-600 border-border-color rounded focus:ring-2 focus:ring-red-600"
              />
              <div className="text-sm text-text-primary">
                I understand this will permanently delete my account and all associated data after 30 days
              </div>
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={!confirmed || !emailMatch || requestDeletion.isPending}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {requestDeletion.isPending ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  Scheduling Deletion...
                </div>
              ) : (
                'Delete My Account'
              )}
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-lg border border-border-color text-text-primary hover:bg-bg-secondary transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

export default DeleteAccountModal;
