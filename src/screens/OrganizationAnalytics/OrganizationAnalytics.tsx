import { useQuery } from '@apollo/client';
import React, { useEffect, useState, useMemo, JSX } from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { Navigate, useParams } from 'react-router';
import {
  GET_ORGANIZATION_POSTS_COUNT_PG,
  GET_ORGANIZATION_EVENTS_PG,
  ORGANIZATION_MEMBER_ADMIN_COUNT,
  GET_ORGANIZATION_VENUES_COUNT,
} from 'GraphQl/Queries/Queries';
import { toast } from 'react-toastify';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import dayjs from 'dayjs';
import styles from '../../style/app-fixed.module.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
);

interface IEvent {
  node: {
    id: string;
    title: string;
    startAt: string;
    endAt: string;
  };
}

function OrganizationAnalytics(): JSX.Element {
  const { t } = useTranslation('translation', {
    keyPrefix: 'organizationAnalytics',
  });
  const { t: tCommon } = useTranslation('common');
  const { t: tErrors } = useTranslation('errors');
  const { orgId } = useParams();

  const [eventsByMonth, setEventsByMonth] = useState<Record<string, number>>(
    {},
  );
  const [upcomingVsPastEvents, setUpcomingVsPastEvents] = useState({
    upcoming: 0,
    past: 0,
  });

  if (!orgId) {
    return <Navigate to="/" replace />;
  }

  document.title = t('title');

  const {
    data: orgMemberData,
    loading: orgMemberLoading,
    error: orgMemberError,
  } = useQuery(ORGANIZATION_MEMBER_ADMIN_COUNT, {
    variables: { id: orgId },
  });

  const {
    data: orgPostsData,
    loading: orgPostsLoading,
    error: orgPostsError,
  } = useQuery(GET_ORGANIZATION_POSTS_COUNT_PG, { variables: { id: orgId } });

  const {
    data: orgEventsData,
    loading: orgEventsLoading,
    error: orgEventsError,
  } = useQuery(GET_ORGANIZATION_EVENTS_PG, {
    variables: { id: orgId, first: 100, after: null },
  });

  const {
    data: orgVenuesData,
    loading: orgVenuesLoading,
    error: orgVenuesError,
  } = useQuery(GET_ORGANIZATION_VENUES_COUNT, {
    variables: { id: orgId },
  });

  useEffect(() => {
    if (orgEventsData?.organization?.events?.edges) {
      const now = new Date();
      const monthCounts: Record<string, number> = {};
      let upcomingCount = 0;
      let pastCount = 0;

      const last6Months = Array.from({ length: 6 }, (_, i) => {
        return dayjs().subtract(i, 'month').format('MMM YYYY');
      }).reverse();

      last6Months.forEach((month) => {
        monthCounts[month] = 0;
      });

      orgEventsData.organization.events.edges.forEach((event: IEvent) => {
        const eventDate = new Date(event.node.startAt);
        const monthKey = dayjs(eventDate).format('MMM YYYY');

        if (monthCounts[monthKey] !== undefined) {
          monthCounts[monthKey]++;
        }

        if (eventDate > now) {
          upcomingCount++;
        } else {
          pastCount++;
        }
      });

      setEventsByMonth(monthCounts);
      setUpcomingVsPastEvents({
        upcoming: upcomingCount,
        past: pastCount,
      });
    }
  }, [orgEventsData]);

  useEffect(() => {
    if (
      orgPostsError ||
      orgMemberError ||
      orgEventsError ||
      orgVenuesError
    ) {
      toast.error(tErrors('errorLoading', { entity: 'Analytics' }));
    }
  }, [orgPostsError, orgMemberError, orgEventsError, orgVenuesError]);

  const memberBreakdownData = useMemo(() => {
    if (!orgMemberData) return null;

    const members = orgMemberData.organization.membersCount;
    const admins = orgMemberData.organization.adminsCount;
    const regularMembers = members - admins;

    return {
      labels: [tCommon('members'), tCommon('admins')],
      datasets: [
        {
          label: tCommon('count'),
          data: [regularMembers, admins],
          backgroundColor: [
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 99, 132, 0.6)',
          ],
          borderColor: ['rgba(54, 162, 235, 1)', 'rgba(255, 99, 132, 1)'],
          borderWidth: 1,
        },
      ],
    };
  }, [orgMemberData, tCommon]);

  const eventTrendData = useMemo(() => {
    const labels = Object.keys(eventsByMonth);
    const data = Object.values(eventsByMonth);

    return {
      labels,
      datasets: [
        {
          label: t('eventsPerMonth'),
          data,
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.3,
        },
      ],
    };
  }, [eventsByMonth, t]);

  const upcomingVsPastData = useMemo(() => {
    return {
      labels: [t('upcomingEvents'), t('pastEvents')],
      datasets: [
        {
          label: tCommon('events'),
          data: [upcomingVsPastEvents.upcoming, upcomingVsPastEvents.past],
          backgroundColor: [
            'rgba(153, 102, 255, 0.6)',
            'rgba(255, 159, 64, 0.6)',
          ],
          borderColor: ['rgba(153, 102, 255, 1)', 'rgba(255, 159, 64, 1)'],
          borderWidth: 1,
        },
      ],
    };
  }, [upcomingVsPastEvents, t, tCommon]);

  const overviewData = useMemo(() => {
    if (
      !orgMemberData ||
      !orgPostsData ||
      !orgEventsData ||
      !orgVenuesData
    ) {
      return null;
    }

    return {
      labels: [
        tCommon('members'),
        tCommon('posts'),
        tCommon('events'),
        tCommon('venues'),
      ],
      datasets: [
        {
          label: tCommon('total'),
          data: [
            orgMemberData.organization.membersCount,
            orgPostsData.organization.postsCount,
            orgEventsData.organization.eventsCount,
            orgVenuesData.organization.venuesCount,
          ],
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
  }, [orgMemberData, orgPostsData, orgEventsData, orgVenuesData, tCommon]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  };

  const isLoading =
    orgMemberLoading ||
    orgPostsLoading ||
    orgEventsLoading ||
    orgVenuesLoading;

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <Row className="mt-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>{t('organizationAnalytics')}</h2>
          </div>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col lg={6} className="mb-4">
          <Card className="rounded-4 border-2 border-gray-300 h-100">
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>{t('organizationOverview')}</div>
            </div>
            <Card.Body style={{ height: '300px' }}>
              {overviewData && <Bar data={overviewData} options={chartOptions} />}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6} className="mb-4">
          <Card className="rounded-4 border-2 border-gray-300 h-100">
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>{t('memberBreakdown')}</div>
            </div>
            <Card.Body style={{ height: '300px' }}>
              {memberBreakdownData && (
                <Doughnut data={memberBreakdownData} options={chartOptions} />
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col lg={8} className="mb-4">
          <Card className="rounded-4 border-2 border-gray-300 h-100">
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>{t('eventTrends')}</div>
            </div>
            <Card.Body style={{ height: '300px' }}>
              {eventTrendData && (
                <Line data={eventTrendData} options={chartOptions} />
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4} className="mb-4">
          <Card className="rounded-4 border-2 border-gray-300 h-100">
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>{t('upcomingVsPast')}</div>
            </div>
            <Card.Body style={{ height: '300px' }}>
              {upcomingVsPastData && (
                <Doughnut data={upcomingVsPastData} options={chartOptions} />
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
}

export default OrganizationAnalytics;
