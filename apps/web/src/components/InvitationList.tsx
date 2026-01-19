import React from 'react';
import { usePendingInvitations } from '@itinerary/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Mail, CheckCircle2, XCircle, MapPin, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

/**
 * InvitationList - Displays pending trip invitations
 * Shows on dashboard for users with pending invitations
 */
export const InvitationList: React.FC = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: invitations, isLoading } = usePendingInvitations();

  // Mutation: Accept invitation
  const acceptMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      const response = await fetch('/api/collaborate/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invitationId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to accept invitation');
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast.success('Invitation accepted! Redirecting...');
      queryClient.invalidateQueries({ queryKey: ['pending-invitations'] });
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      // Redirect to the trip
      setTimeout(() => {
        router.push(`/trip/${data.tripId}`);
      }, 1000);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Mutation: Decline invitation
  const declineMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      const response = await fetch('/api/collaborate/decline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invitationId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to decline invitation');
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success('Invitation declined');
      queryClient.invalidateQueries({ queryKey: ['pending-invitations'] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleAccept = (invitationId: string) => {
    acceptMutation.mutate(invitationId);
  };

  const handleDecline = (invitationId: string) => {
    if (confirm('Are you sure you want to decline this invitation?')) {
      declineMutation.mutate(invitationId);
    }
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      editor: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      viewer: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    };

    return (
      <span className={`px-2 py-1 text-xs rounded-full font-medium ${colors[role as keyof typeof colors] || colors.viewer}`}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="bg-bg-secondary rounded-lg p-6 border border-border-color">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-bg-tertiary rounded w-1/3"></div>
          <div className="h-20 bg-bg-tertiary rounded"></div>
        </div>
      </div>
    );
  }

  if (!invitations || invitations.length === 0) {
    return null;
  }

  return (
    <div className="bg-bg-secondary rounded-lg p-6 border border-border-color">
      <div className="flex items-center gap-2 mb-4">
        <Mail size={20} className="text-accent-primary" />
        <h2 className="text-lg font-semibold">Trip Invitations</h2>
        <span className="px-2 py-0.5 text-xs rounded-full bg-accent-primary text-white font-medium">
          {invitations.length}
        </span>
      </div>

      <div className="space-y-3">
        {invitations.map((invitation) => {
          const trip = invitation.trip as any;
          const inviter = invitation.inviter as any;

          return (
            <div
              key={invitation.id}
              className="border border-border-color rounded-lg p-4 bg-bg-primary hover:bg-bg-tertiary transition-colors"
            >
              <div className="flex flex-col gap-3">
                {/* Trip Info */}
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-text-primary text-lg">
                        {trip?.title || 'Trip'}
                      </h3>
                      {trip?.city && (
                        <div className="flex items-center gap-1 text-sm text-text-secondary mt-1">
                          <MapPin size={14} />
                          {trip.city}
                        </div>
                      )}
                    </div>
                    {getRoleBadge(invitation.role)}
                  </div>

                  {/* Date range */}
                  {trip?.start_date && (
                    <div className="flex items-center gap-1 text-sm text-text-secondary">
                      <Calendar size={14} />
                      {new Date(trip.start_date).toLocaleDateString()}
                      {trip.end_date && ` - ${new Date(trip.end_date).toLocaleDateString()}`}
                    </div>
                  )}

                  {/* Inviter info */}
                  <div className="text-sm text-text-secondary mt-2">
                    Invited by <span className="font-medium">{inviter?.display_name || inviter?.email}</span>
                    {' '}on {new Date(invitation.invited_at).toLocaleDateString()}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAccept(invitation.id)}
                    disabled={acceptMutation.isPending || declineMutation.isPending}
                    className="flex-1 bg-accent-primary text-white py-2 px-4 rounded-lg font-medium hover:bg-accent-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={18} />
                    Accept
                  </button>
                  <button
                    onClick={() => handleDecline(invitation.id)}
                    disabled={acceptMutation.isPending || declineMutation.isPending}
                    className="flex-1 bg-bg-secondary text-text-primary border border-border-color py-2 px-4 rounded-lg font-medium hover:bg-bg-tertiary disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    <XCircle size={18} />
                    Decline
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InvitationList;
