import React from 'react';
import { Users } from 'lucide-react';

interface SharedTripBadgeProps {
  role: 'editor' | 'viewer';
  size?: 'sm' | 'md';
}

/**
 * SharedTripBadge - Small badge showing shared trip status
 * Displays on dashboard trip cards for collaborated trips
 */
export const SharedTripBadge: React.FC<SharedTripBadgeProps> = ({
  role,
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2 py-1',
  };

  const roleColors = {
    editor: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    viewer: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  };

  const iconSize = size === 'sm' ? 12 : 14;

  return (
    <span
      className={`
        ${sizeClasses[size]}
        ${roleColors[role]}
        inline-flex items-center gap-1
        rounded-full font-medium
      `}
      title={`Shared trip - You are ${role === 'editor' ? 'an' : 'a'} ${role}`}
    >
      <Users size={iconSize} />
      Shared ({role})
    </span>
  );
};

export default SharedTripBadge;
