import React from 'react';
import { useCollaborators } from '@itinerary/shared';
import { Users } from 'lucide-react';

interface CollaboratorAvatarsProps {
  tripId: number | string;
  maxDisplay?: number;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * CollaboratorAvatars - Displays avatars of trip collaborators
 * Shows initials with role-based color coding
 */
export const CollaboratorAvatars: React.FC<CollaboratorAvatarsProps> = ({
  tripId,
  maxDisplay = 5,
  size = 'md',
}) => {
  const { data: collaborators, isLoading } = useCollaborators(tripId);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className="animate-pulse flex items-center gap-1">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className={`rounded-full bg-bg-secondary ${
                size === 'sm' ? 'w-6 h-6' : size === 'lg' ? 'w-12 h-12' : 'w-8 h-8'
              }`}
            />
          ))}
        </div>
      </div>
    );
  }

  if (!collaborators || collaborators.length === 0) {
    return null;
  }

  const displayCollaborators = collaborators.slice(0, maxDisplay);
  const remainingCount = Math.max(0, collaborators.length - maxDisplay);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-purple-500 text-white';
      case 'editor':
        return 'bg-blue-500 text-white';
      case 'viewer':
        return 'bg-gray-400 text-white';
      default:
        return 'bg-gray-300 text-text-primary';
    }
  };

  const getRoleLabel = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      const parts = name.trim().split(' ');
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
      }
      return name.slice(0, 2).toUpperCase();
    }
    return email.slice(0, 2).toUpperCase();
  };

  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  return (
    <div className="flex items-center">
      <div className="flex -space-x-2">
        {displayCollaborators.map((collab) => {
          const displayName = collab.user.display_name || collab.user.email;
          const initials = getInitials(collab.user.display_name, collab.user.email);

          return (
            <div
              key={collab.id}
              className="relative group"
              title={`${displayName} (${getRoleLabel(collab.role)})`}
            >
              <div
                className={`
                  ${sizeClasses[size]}
                  rounded-full
                  ${getRoleColor(collab.role)}
                  flex items-center justify-center
                  font-semibold
                  border-2 border-white dark:border-bg-primary
                  shadow-sm
                  cursor-default
                  transition-transform
                  hover:scale-110 hover:z-10
                `}
              >
                {initials}
              </div>

              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-bg-tertiary text-text-primary text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                <div className="font-medium">{displayName}</div>
                <div className="text-text-secondary text-xs capitalize">{collab.role}</div>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                  <div className="border-4 border-transparent border-t-bg-tertiary"></div>
                </div>
              </div>
            </div>
          );
        })}

        {remainingCount > 0 && (
          <div
            className={`
              ${sizeClasses[size]}
              rounded-full
              bg-bg-secondary text-text-secondary
              flex items-center justify-center
              font-semibold
              border-2 border-white dark:border-bg-primary
              shadow-sm
              cursor-default
            `}
            title={`${remainingCount} more collaborator${remainingCount > 1 ? 's' : ''}`}
          >
            +{remainingCount}
          </div>
        )}
      </div>

      {/* Icon for small screens or when no collaborators displayed */}
      {collaborators.length > 0 && (
        <div className="ml-2 text-text-secondary flex items-center gap-1">
          <Users size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />
          <span className="text-xs">{collaborators.length}</span>
        </div>
      )}
    </div>
  );
};

export default CollaboratorAvatars;
