import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import { changePasswordSchema, ChangePasswordInput, useChangePassword } from '@itinerary/shared';
import Modal from '../Modal';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  const changePassword = useChangePassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: ChangePasswordInput) => {
    try {
      await changePassword.mutateAsync(data);
      toast.success('Password changed successfully');
      reset();
      onClose();
    } catch (error) {
      toast.error('Failed to change password');
      console.error(error);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-text-primary">Change Password</h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-bg-secondary rounded-lg transition-colors"
          >
            <X size={20} className="text-text-secondary" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Current Password */}
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-text-primary mb-2">
              Current Password
            </label>
            <input
              id="currentPassword"
              type="password"
              {...register('currentPassword')}
              placeholder="Enter current password"
              className="w-full px-3 py-2 rounded-lg border border-border-color bg-bg-primary focus:outline-none focus:ring-2 focus:ring-accent transition-colors"
            />
            {errors.currentPassword && (
              <p className="text-xs text-red-500 mt-1">{errors.currentPassword.message}</p>
            )}
          </div>

          {/* New Password */}
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-text-primary mb-2">
              New Password
            </label>
            <input
              id="newPassword"
              type="password"
              {...register('newPassword')}
              placeholder="Enter new password"
              className="w-full px-3 py-2 rounded-lg border border-border-color bg-bg-primary focus:outline-none focus:ring-2 focus:ring-accent transition-colors"
            />
            {errors.newPassword && (
              <p className="text-xs text-red-500 mt-1">{errors.newPassword.message}</p>
            )}
            <p className="text-xs text-text-secondary mt-1">
              Must be at least 8 characters with uppercase, lowercase, number, and special character
            </p>
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-primary mb-2">
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              {...register('confirmPassword')}
              placeholder="Confirm new password"
              className="w-full px-3 py-2 rounded-lg border border-border-color bg-bg-primary focus:outline-none focus:ring-2 focus:ring-accent transition-colors"
            />
            {errors.confirmPassword && (
              <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={changePassword.isPending}
              className="btn btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {changePassword.isPending ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  Changing Password...
                </div>
              ) : (
                'Change Password'
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

export default ChangePasswordModal;
