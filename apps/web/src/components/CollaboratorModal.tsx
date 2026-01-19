import React, { useState } from 'react';
import { useCollaborators, usePendingInvitations, useIsOwner } from '@itinerary/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Mail, UserPlus, Shield, Eye, Edit, Trash2, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import Modal from './Modal';

interface CollaboratorModalProps {
  tripId: number;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * CollaboratorModal - Manage trip collaborators and invitations
 * Only accessible to trip owners
 */
export const CollaboratorModal: React.FC<CollaboratorModalProps> = ({
  tripId,
  isOpen,
  onClose,
}) => {
  const queryClient = useQueryClient();
  const { isOwner } = useIsOwner(tripId);
  const { data: collaborators, isLoading: loadingCollaborators } = useCollaborators(tripId);
  const { data: pendingInvitations, isLoading: loadingInvitations } = usePendingInvitations(tripId);

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'editor' | 'viewer'>('viewer');
  const [isInviting, setIsInviting] = useState(false);

  // Mutation: Send invitation
  const inviteMutation = useMutation({
    mutationFn: async (data: { email: string; role: 'editor' | 'viewer' }) => {
      const response = await fetch('/api/collaborate/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tripId, ...data }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send invitation');
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success('Invitation sent successfully');
      setInviteEmail('');
      setInviteRole('viewer');
      queryClient.invalidateQueries({ queryKey: ['pending-invitations', tripId] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Mutation: Remove collaborator
  const removeMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch('/api/collaborate/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tripId, userId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to remove collaborator');
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success('Collaborator removed');
      queryClient.invalidateQueries({ queryKey: ['trip-collaborators', tripId] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Mutation: Change role
  const changeRoleMutation = useMutation({
    mutationFn: async (data: { userId: string; role: 'editor' | 'viewer' }) => {
      const response = await fetch('/api/collaborate/role', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tripId, ...data }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update role');
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success('Role updated');
      queryClient.invalidateQueries({ queryKey: ['trip-collaborators', tripId] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) {
      toast.error('Please enter an email address');
      return;
    }
    setIsInviting(true);
    await inviteMutation.mutateAsync({ email: inviteEmail.toLowerCase(), role: inviteRole });
    setIsInviting(false);
  };

  const handleRemove = (userId: string, displayName: string | null, email: string) => {
    if (confirm(`Remove ${displayName || email} from this trip?`)) {
      removeMutation.mutate(userId);
    }
  };

  const handleChangeRole = (userId: string, newRole: 'editor' | 'viewer') => {
    changeRoleMutation.mutate({ userId, role: newRole });
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Shield size={16} className="text-purple-500" />;
      case 'editor':
        return <Edit size={16} className="text-blue-500" />;
      case 'viewer':
        return <Eye size={16} className="text-gray-500" />;
      default:
        return null;
    }
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      owner: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
      editor: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      viewer: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    };

    return (
      <span className={`px-2 py-1 text-xs rounded-full font-medium ${colors[role as keyof typeof colors] || colors.viewer}`}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    );
  };

  if (!isOwner) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Manage Collaborators">
      <div className="space-y-6">
        {/* Invite Form */}
        <div className="border border-border-color rounded-lg p-4 bg-bg-secondary">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <UserPlus size={20} />
            Invite Collaborator
          </h3>
          <form onSubmit={handleInvite} className="space-y-3">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@example.com"
                className="w-full px-3 py-2 border border-border-color rounded-lg bg-bg-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                disabled={isInviting}
              />
            </div>
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-text-secondary mb-1">
                Role
              </label>
              <select
                id="role"
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as 'editor' | 'viewer')}
                className="w-full px-3 py-2 border border-border-color rounded-lg bg-bg-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                disabled={isInviting}
              >
                <option value="viewer">Viewer - Can view trip and add expenses</option>
                <option value="editor">Editor - Can modify trip content</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={isInviting || !inviteEmail.trim()}
              className="w-full bg-accent-primary text-white py-2 px-4 rounded-lg font-medium hover:bg-accent-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <Mail size={18} />
              {isInviting ? 'Sending...' : 'Send Invitation'}
            </button>
          </form>
        </div>

        {/* Active Collaborators */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Active Collaborators</h3>
          {loadingCollaborators ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-bg-secondary rounded-lg animate-pulse" />
              ))}
            </div>
          ) : collaborators && collaborators.length > 0 ? (
            <div className="space-y-2">
              {collaborators.map((collab) => {
                const displayName = collab.user.display_name || collab.user.email;
                const isCurrentOwner = collab.role === 'owner';

                return (
                  <div
                    key={collab.id}
                    className="flex items-center justify-between p-3 border border-border-color rounded-lg bg-bg-secondary hover:bg-bg-tertiary transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-accent-primary text-white flex items-center justify-center font-semibold">
                        {(collab.user.display_name || collab.user.email).slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-text-primary">{displayName}</div>
                        <div className="text-sm text-text-secondary">{collab.user.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isCurrentOwner ? (
                        getRoleBadge(collab.role)
                      ) : (
                        <>
                          <select
                            value={collab.role}
                            onChange={(e) => handleChangeRole(collab.user_id, e.target.value as 'editor' | 'viewer')}
                            className="px-2 py-1 text-sm border border-border-color rounded bg-bg-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                            disabled={changeRoleMutation.isPending}
                          >
                            <option value="editor">Editor</option>
                            <option value="viewer">Viewer</option>
                          </select>
                          <button
                            onClick={() => handleRemove(collab.user_id, collab.user.display_name, collab.user.email)}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            disabled={removeMutation.isPending}
                            title="Remove collaborator"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6 text-text-secondary">
              No collaborators yet
            </div>
          )}
        </div>

        {/* Pending Invitations */}
        {pendingInvitations && pendingInvitations.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3">Pending Invitations</h3>
            <div className="space-y-2">
              {pendingInvitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="flex items-center justify-between p-3 border border-border-color rounded-lg bg-bg-secondary"
                >
                  <div className="flex items-center gap-3">
                    <Clock size={20} className="text-text-secondary" />
                    <div>
                      <div className="font-medium text-text-primary">{invitation.email}</div>
                      <div className="text-sm text-text-secondary">
                        Invited {new Date(invitation.invited_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getRoleBadge(invitation.role)}
                    <span className="px-2 py-1 text-xs rounded-full font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">
                      Pending
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default CollaboratorModal;
