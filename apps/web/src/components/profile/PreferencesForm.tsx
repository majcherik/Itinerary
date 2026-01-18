import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { updatePreferencesSchema, UpdatePreferencesInput, usePreferences, useUpdatePreferences } from '@itinerary/shared';

const CURRENCIES = [
  { value: 'USD', label: 'US Dollar ($)' },
  { value: 'EUR', label: 'Euro (€)' },
  { value: 'GBP', label: 'British Pound (£)' },
  { value: 'JPY', label: 'Japanese Yen (¥)' },
  { value: 'AUD', label: 'Australian Dollar (A$)' },
  { value: 'CAD', label: 'Canadian Dollar (C$)' },
  { value: 'CHF', label: 'Swiss Franc (CHF)' },
  { value: 'CNY', label: 'Chinese Yuan (¥)' },
  { value: 'HKD', label: 'Hong Kong Dollar (HK$)' },
  { value: 'NZD', label: 'New Zealand Dollar (NZ$)' },
  { value: 'SEK', label: 'Swedish Krona (kr)' },
  { value: 'KRW', label: 'South Korean Won (₩)' },
  { value: 'SGD', label: 'Singapore Dollar (S$)' },
  { value: 'NOK', label: 'Norwegian Krone (kr)' },
  { value: 'MXN', label: 'Mexican Peso ($)' },
  { value: 'INR', label: 'Indian Rupee (₹)' },
  { value: 'RUB', label: 'Russian Ruble (₽)' },
  { value: 'ZAR', label: 'South African Rand (R)' },
  { value: 'TRY', label: 'Turkish Lira (₺)' },
  { value: 'BRL', label: 'Brazilian Real (R$)' },
  { value: 'TWD', label: 'Taiwan Dollar (NT$)' },
  { value: 'DKK', label: 'Danish Krone (kr)' },
  { value: 'PLN', label: 'Polish Zloty (zł)' },
  { value: 'THB', label: 'Thai Baht (฿)' },
  { value: 'IDR', label: 'Indonesian Rupiah (Rp)' },
  { value: 'MYR', label: 'Malaysian Ringgit (RM)' },
  { value: 'PHP', label: 'Philippine Peso (₱)' },
  { value: 'CZK', label: 'Czech Koruna (Kč)' },
  { value: 'AED', label: 'UAE Dirham (د.إ)' },
  { value: 'ILS', label: 'Israeli Shekel (₪)' },
];

export function PreferencesForm() {
  const { data: preferences, isLoading } = usePreferences();
  const updatePreferences = useUpdatePreferences();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<UpdatePreferencesInput>({
    resolver: zodResolver(updatePreferencesSchema),
    values: {
      default_currency: (preferences?.default_currency ?? 'USD') as UpdatePreferencesInput['default_currency'],
      notification_settings: preferences?.notification_settings ?? {
        email_trip_reminders: true,
        email_expense_updates: true,
        email_marketing: false,
      },
    },
  });

  const onSubmit = async (data: UpdatePreferencesInput) => {
    try {
      await updatePreferences.mutateAsync(data);
      toast.success('Preferences updated successfully');
      reset(data);
    } catch (error) {
      toast.error('Failed to update preferences');
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="card p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-bg-card rounded w-1/4"></div>
          <div className="h-10 bg-bg-card rounded"></div>
          <div className="h-10 bg-bg-card rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-text-primary mb-2">Preferences</h2>
        <p className="text-sm text-text-secondary">Customize your experience</p>
      </div>

      {/* Default Currency */}
      <div>
        <label htmlFor="default_currency" className="block text-sm font-medium text-text-primary mb-2">
          Default Currency
        </label>
        <select
          id="default_currency"
          {...register('default_currency')}
          className="w-full px-3 py-2 rounded-lg border border-border-color bg-bg-primary focus:outline-none focus:ring-2 focus:ring-accent transition-colors"
        >
          {CURRENCIES.map(currency => (
            <option key={currency.value} value={currency.value}>
              {currency.label}
            </option>
          ))}
        </select>
        <p className="text-xs text-text-secondary mt-1">
          This currency will be used throughout the app for all expenses and budgets
        </p>
      </div>

      {/* Notification Settings */}
      <div className="border-t border-border-color pt-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Email Notifications</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              {...register('notification_settings.email_trip_reminders')}
              className="w-4 h-4 text-accent border-border-color rounded focus:ring-2 focus:ring-accent"
            />
            <div>
              <div className="text-sm font-medium text-text-primary">Trip Reminders</div>
              <div className="text-xs text-text-secondary">
                Get reminders about upcoming trips and deadlines
              </div>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              {...register('notification_settings.email_expense_updates')}
              className="w-4 h-4 text-accent border-border-color rounded focus:ring-2 focus:ring-accent"
            />
            <div>
              <div className="text-sm font-medium text-text-primary">Expense Updates</div>
              <div className="text-xs text-text-secondary">
                Notifications when expenses are added or updated
              </div>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              {...register('notification_settings.email_marketing')}
              className="w-4 h-4 text-accent border-border-color rounded focus:ring-2 focus:ring-accent"
            />
            <div>
              <div className="text-sm font-medium text-text-primary">Marketing & Updates</div>
              <div className="text-xs text-text-secondary">
                Receive news, tips, and feature announcements
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={!isDirty || updatePreferences.isPending}
          className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {updatePreferences.isPending ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
              Saving...
            </div>
          ) : (
            'Save Preferences'
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
