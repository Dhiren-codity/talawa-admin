import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Typography,
  CircularProgress,
  ToggleButtonGroup,
  ToggleButton,
  InputAdornment,
  SelectChangeEvent,
} from '@mui/material';
import {
  Search as SearchIcon,
  ArrowUpward as SortAscIcon,
  ArrowDownward as SortDescIcon,
} from '@mui/icons-material';
import { useQuery } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import InfiniteScroll from 'react-infinite-scroll-component';
import TimelineItem from './TimelineItem';
import {
  InterfaceActivityTimelineProps,
  InterfaceActivityItem,
  ActivityType,
  InterfaceActivityFilters,
} from './types';
import {
  GET_ORGANIZATION_EVENTS_TIMELINE,
  GET_ORGANIZATION_POSTS_TIMELINE,
} from 'GraphQl/Queries/ActivityTimelineQueries';
import { setActivityFilters } from 'state/reducers/activityTimelineReducer';
import { RootState } from 'state/reducers';
import styles from './ActivityTimeline.module.css';

const ActivityTimeline: React.FC<InterfaceActivityTimelineProps> = ({
  organizationId,
  limit = 10,
  activityTypes = ['EVENT', 'POST', 'MEMBERSHIP_REQUEST'],
  showFilters = true,
  showSearch = true,
}) => {
  const { t } = useTranslation('translation', { keyPrefix: 'activityTimeline' });
  const dispatch = useDispatch();
  const filters = useSelector(
    (state: RootState) => state.activityTimeline?.filters || {
      searchTerm: '',
      selectedTypes: activityTypes,
      sortOrder: 'desc' as const,
    }
  );

  const [activities, setActivities] = useState<InterfaceActivityItem[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [skip, setSkip] = useState(0);

  const shouldFetchEvents = filters.selectedTypes.includes('EVENT');
  const shouldFetchPosts = filters.selectedTypes.includes('POST');

  const {
    data: eventsData,
    loading: eventsLoading,
    refetch: refetchEvents,
  } = useQuery(GET_ORGANIZATION_EVENTS_TIMELINE, {
    variables: {
      organizationId,
      limit,
      skip,
    },
    skip: !shouldFetchEvents,
  });

  const {
    data: postsData,
    loading: postsLoading,
    refetch: refetchPosts,
  } = useQuery(GET_ORGANIZATION_POSTS_TIMELINE, {
    variables: {
      organizationId,
      limit,
      skip,
    },
    skip: !shouldFetchPosts,
  });

  useEffect(() => {
    const newActivities: InterfaceActivityItem[] = [];

    if (eventsData?.eventsByOrganizationConnection?.edges) {
      const eventActivities = eventsData.eventsByOrganizationConnection.edges.map(
        (edge: {
          node: {
            _id: string;
            title: string;
            description: string;
            startDate: string;
            endDate: string;
            location: string;
            createdAt: string;
            creator: {
              _id: string;
              firstName: string;
              lastName: string;
              image?: string;
            };
          };
        }) => ({
          id: edge.node._id,
          type: 'EVENT' as ActivityType,
          title: edge.node.title,
          description: edge.node.description,
          timestamp: edge.node.createdAt,
          author: {
            id: edge.node.creator._id,
            firstName: edge.node.creator.firstName,
            lastName: edge.node.creator.lastName,
            image: edge.node.creator.image,
          },
          metadata: {
            location: edge.node.location,
            startDate: edge.node.startDate,
            endDate: edge.node.endDate,
          },
        })
      );
      newActivities.push(...eventActivities);
    }

    if (postsData?.postsByOrganizationConnection?.edges) {
      const postActivities = postsData.postsByOrganizationConnection.edges.map(
        (edge: {
          node: {
            _id: string;
            title: string;
            text: string;
            imageUrl?: string;
            createdAt: string;
            creator: {
              _id: string;
              firstName: string;
              lastName: string;
              image?: string;
            };
          };
        }) => ({
          id: edge.node._id,
          type: 'POST' as ActivityType,
          title: edge.node.title,
          description: edge.node.text,
          timestamp: edge.node.createdAt,
          author: {
            id: edge.node.creator._id,
            firstName: edge.node.creator.firstName,
            lastName: edge.node.creator.lastName,
            image: edge.node.creator.image,
          },
          metadata: {
            imageUrl: edge.node.imageUrl,
          },
        })
      );
      newActivities.push(...postActivities);
    }

    const sortedActivities = newActivities.sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      return filters.sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    if (skip === 0) {
      setActivities(sortedActivities);
    } else {
      setActivities((prev) => [...prev, ...sortedActivities]);
    }

    if (newActivities.length < limit) {
      setHasMore(false);
    }
  }, [eventsData, postsData, filters.sortOrder, skip, limit]);

  const filteredActivities = useMemo(() => {
    if (!filters.searchTerm) return activities;

    return activities.filter((activity) =>
      activity.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      activity.description?.toLowerCase().includes(filters.searchTerm.toLowerCase())
    );
  }, [activities, filters.searchTerm]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(
      setActivityFilters({
        ...filters,
        searchTerm: event.target.value,
      })
    );
  };

  const handleTypeFilterChange = (event: SelectChangeEvent<ActivityType[]>) => {
    const value = event.target.value;
    dispatch(
      setActivityFilters({
        ...filters,
        selectedTypes: typeof value === 'string' ? [value as ActivityType] : value,
      })
    );
    setSkip(0);
    setHasMore(true);
  };

  const handleSortChange = (
    _event: React.MouseEvent<HTMLElement>,
    newOrder: 'asc' | 'desc' | null
  ) => {
    if (newOrder !== null) {
      dispatch(
        setActivityFilters({
          ...filters,
          sortOrder: newOrder,
        })
      );
    }
  };

  const loadMore = () => {
    setSkip((prev) => prev + limit);
  };

  const isLoading = eventsLoading || postsLoading;

  return (
    <Paper className={styles.timelineContainer}>
      <Box className={styles.timelineHeader}>
        <Typography variant="h5" className={styles.timelineHeaderTitle}>
          {t('title') || 'Activity Timeline'}
        </Typography>

        {showFilters && (
          <Box className={styles.timelineFilters}>
            {showSearch && (
              <TextField
                placeholder={t('searchPlaceholder') || 'Search activities...'}
                variant="outlined"
                size="small"
                value={filters.searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                className={styles.searchField}
              />
            )}

            <FormControl size="small" className={styles.filterControl}>
              <InputLabel>{t('filterByType') || 'Activity Type'}</InputLabel>
              <Select
                multiple
                value={filters.selectedTypes}
                onChange={handleTypeFilterChange}
                label={t('filterByType') || 'Activity Type'}
              >
                <MenuItem value="EVENT">{t('event') || 'Events'}</MenuItem>
                <MenuItem value="POST">{t('post') || 'Posts'}</MenuItem>
                <MenuItem value="MEMBERSHIP_REQUEST">
                  {t('membershipRequest') || 'Membership Requests'}
                </MenuItem>
              </Select>
            </FormControl>

            <ToggleButtonGroup
              value={filters.sortOrder}
              exclusive
              onChange={handleSortChange}
              size="small"
            >
              <ToggleButton value="desc">
                <SortDescIcon />
              </ToggleButton>
              <ToggleButton value="asc">
                <SortAscIcon />
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        )}
      </Box>

      <Box className={styles.timelineBody}>
        {isLoading && skip === 0 ? (
          <Box className={styles.loadingContainer}>
            <CircularProgress />
          </Box>
        ) : filteredActivities.length === 0 ? (
          <Box className={styles.emptyState}>
            <Typography variant="body1" color="text.secondary">
              {t('noActivities') || 'No activities found'}
            </Typography>
          </Box>
        ) : (
          <InfiniteScroll
            dataLength={filteredActivities.length}
            next={loadMore}
            hasMore={hasMore}
            loader={
              <Box className={styles.loadingContainer}>
                <CircularProgress size={24} />
              </Box>
            }
            endMessage={
              <Typography
                variant="body2"
                color="text.secondary"
                className={styles.endMessage}
              >
                {t('noMoreActivities') || 'No more activities to load'}
              </Typography>
            }
          >
            {filteredActivities.map((activity, index) => (
              <TimelineItem
                key={activity.id}
                activity={activity}
                isLast={index === filteredActivities.length - 1}
              />
            ))}
          </InfiniteScroll>
        )}
      </Box>
    </Paper>
  );
};

export default ActivityTimeline;
