import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { updateProfileSchema, UpdateProfileInput, useProfile, useUpdateProfile } from '@itinerary/shared';

export function ProfileForm() {
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    values: {
      display_name: profile?.display_name ?? '',
      bio: profile?.bio ?? '',
    },
  });

  const onSubmit = async (data: UpdateProfileInput) => {
    try {
      await updateProfile.mutateAsync(data);
      toast.success('Profile updated successfully');
      reset(data);
    } catch (error) {
      toast.error('Failed to update profile');
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="card p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-bg-card rounded w-1/4"></div>
          <div className="h-10 bg-bg-card rounded"></div>
          <div className="h-4 bg-bg-card rounded w-1/4"></div>
          <div className="h-24 bg-bg-card rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-text-primary mb-2">Profile Information</h2>
        <p className="text-sm text-text-secondary">Update your personal information</p>
      </div>

      {/* Email (read-only) */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Email Address
        </label>
        <input
          type="email"
          value={profile?.email ?? ''}
          disabled
          className="w-full px-3 py-2 rounded-lg border border-border-color bg-bg-secondary text-text-secondary cursor-not-allowed"
        />
        <p className="text-xs text-text-secondary mt-1">
          Email cannot be changed. Contact support if needed.
        </p>
      </div>

      {/* Display Name */}
      <div>
        <label htmlFor="display_name" className="block text-sm font-medium text-text-primary mb-2">
          Display Name
        </label>
        <input
          id="display_name"
          type="text"
          {...register('display_name')}
          placeholder="John Doe"
          className="w-full px-3 py-2 rounded-lg border border-border-color bg-bg-primary focus:outline-none focus:ring-2 focus:ring-accent transition-colors"
        />
        {errors.display_name && (
          <p className="text-xs text-red-500 mt-1">{errors.display_name.message}</p>
        )}
        <p className="text-xs text-text-secondary mt-1">
          This is how your name will appear in the app (max 100 characters)
        </p>
      </div>

      {/* Bio */}
      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-text-primary mb-2">
          Bio
        </label>
        <textarea
          id="bio"
          {...register('bio')}
          rows={4}
          placeholder="Tell us a bit about yourself..."
          className="w-full px-3 py-2 rounded-lg border border-border-color bg-bg-primary focus:outline-none focus:ring-2 focus:ring-accent transition-colors resize-none"
        />
        {errors.bio && (
          <p className="text-xs text-red-500 mt-1">{errors.bio.message}</p>
        )}
        <p className="text-xs text-text-secondary mt-1">
          Optional bio or description (max 500 characters)
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={!isDirty || updateProfile.isPending}
          className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {updateProfile.isPending ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
              Saving...
            </div>
          ) : (
            'Save Changes'
          )}
        </button>
        <button
          type="button"
          onClick={() => reset()}
          disabled={!isDirty}
          className="px-4 py-2 rounded-lg border border-border-color text-text-primary hover:bg-bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
