export type ActivityType = 'EVENT' | 'POST' | 'MEMBERSHIP_REQUEST' | 'MEMBER_JOINED' | 'ADMIN_ADDED';

export interface InterfaceActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description?: string;
  timestamp: string;
  author?: {
    id: string;
    firstName: string;
    lastName: string;
    image?: string;
  };
  metadata?: {
    location?: string;
    startDate?: string;
    endDate?: string;
    imageUrl?: string;
  };
}

export interface InterfaceActivityTimelineProps {
  organizationId: string;
  limit?: number;
  activityTypes?: ActivityType[];
  showFilters?: boolean;
  showSearch?: boolean;
}

export interface InterfaceTimelineItemProps {
  activity: InterfaceActivityItem;
  isLast?: boolean;
}

export interface InterfaceActivityFilters {
  searchTerm: string;
  selectedTypes: ActivityType[];
  sortOrder: 'asc' | 'desc';
}
