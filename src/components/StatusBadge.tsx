import React from 'react';
import { Badge } from '@/components/ui/badge';
import { LeadStatus } from '@/types/lead';

interface StatusBadgeProps {
  status: LeadStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusVariant = (status: LeadStatus) => {
    switch (status) {
      case 'new':
        return 'default';
      case 'contacted':
        return 'secondary';
      case 'qualified':
        return 'default';
      case 'lost':
        return 'destructive';
      case 'won':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: LeadStatus) => {
    switch (status) {
      case 'new':
        return 'bg-status-new text-white';
      case 'contacted':
        return 'bg-status-contacted text-white';
      case 'qualified':
        return 'bg-status-qualified text-white';
      case 'lost':
        return 'bg-status-lost text-white';
      case 'won':
        return 'bg-status-won text-white';
      default:
        return '';
    }
  };

  return (
    <Badge 
      variant={getStatusVariant(status)}
      className={`${getStatusColor(status)} capitalize font-medium`}
    >
      {status}
    </Badge>
  );
};

export default StatusBadge;