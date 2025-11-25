import React from 'react';
import { Box, Typography, Avatar as MuiAvatar, Chip } from '@mui/material';
import {
  Event as EventIcon,
  Article as PostIcon,
  PersonAdd as MemberIcon,
  AdminPanelSettings as AdminIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { InterfaceTimelineItemProps } from './types';
import styles from './ActivityTimeline.module.css';

dayjs.extend(relativeTime);

const TimelineItem: React.FC<InterfaceTimelineItemProps> = ({
  activity,
  isLast = false,
}) => {
  const getActivityIcon = () => {
    const iconProps = { sx: { fontSize: 20 } };
    switch (activity.type) {
      case 'EVENT':
        return <EventIcon {...iconProps} />;
      case 'POST':
        return <PostIcon {...iconProps} />;
      case 'MEMBERSHIP_REQUEST':
      case 'MEMBER_JOINED':
        return <MemberIcon {...iconProps} />;
      case 'ADMIN_ADDED':
        return <AdminIcon {...iconProps} />;
      default:
        return <EventIcon {...iconProps} />;
    }
  };

  const getActivityColor = () => {
    switch (activity.type) {
      case 'EVENT':
        return '#1976d2';
      case 'POST':
        return '#2e7d32';
      case 'MEMBERSHIP_REQUEST':
      case 'MEMBER_JOINED':
        return '#ed6c02';
      case 'ADMIN_ADDED':
        return '#9c27b0';
      default:
        return '#757575';
    }
  };

  const getActivityLabel = () => {
    switch (activity.type) {
      case 'EVENT':
        return 'Event Created';
      case 'POST':
        return 'Post Published';
      case 'MEMBERSHIP_REQUEST':
        return 'Membership Request';
      case 'MEMBER_JOINED':
        return 'New Member';
      case 'ADMIN_ADDED':
        return 'Admin Added';
      default:
        return 'Activity';
    }
  };

  const authorName = activity.author
    ? `${activity.author.firstName} ${activity.author.lastName}`
    : 'Unknown';

  return (
    <Box className={styles.timelineItem}>
      <Box className={styles.timelineIconContainer}>
        <Box
          className={styles.timelineIcon}
          sx={{ backgroundColor: getActivityColor() }}
        >
          {getActivityIcon()}
        </Box>
        {!isLast && <Box className={styles.timelineLine} />}
      </Box>

      <Box className={styles.timelineContent}>
        <Box className={styles.timelineHeader}>
          <Box className={styles.timelineHeaderLeft}>
            <Chip
              label={getActivityLabel()}
              size="small"
              sx={{
                backgroundColor: getActivityColor(),
                color: 'white',
                fontWeight: 600,
                fontSize: '0.75rem',
              }}
            />
            <Typography variant="caption" className={styles.timelineTime}>
              {dayjs(activity.timestamp).fromNow()}
            </Typography>
          </Box>
        </Box>

        <Typography variant="h6" className={styles.timelineTitle}>
          {activity.title}
        </Typography>

        {activity.description && (
          <Typography
            variant="body2"
            className={styles.timelineDescription}
            color="text.secondary"
          >
            {activity.description}
          </Typography>
        )}

        {activity.metadata?.location && (
          <Box className={styles.timelineMetadata}>
            <LocationIcon sx={{ fontSize: 16, mr: 0.5 }} />
            <Typography variant="body2">
              {activity.metadata.location}
            </Typography>
          </Box>
        )}

        {activity.metadata?.startDate && (
          <Box className={styles.timelineMetadata}>
            <CalendarIcon sx={{ fontSize: 16, mr: 0.5 }} />
            <Typography variant="body2">
              {dayjs(activity.metadata.startDate).format('MMM D, YYYY')}
              {activity.metadata.endDate &&
                ` - ${dayjs(activity.metadata.endDate).format('MMM D, YYYY')}`}
            </Typography>
          </Box>
        )}

        {activity.author && (
          <Box className={styles.timelineAuthor}>
            <MuiAvatar
              src={activity.author.image}
              alt={authorName}
              sx={{ width: 24, height: 24, mr: 1 }}
            >
              {authorName.charAt(0)}
            </MuiAvatar>
            <Typography variant="body2" color="text.secondary">
              by {authorName}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default TimelineItem;
