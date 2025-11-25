import gql from 'graphql-tag';

export const GET_ORGANIZATION_TIMELINE = gql`
  query GetOrganizationTimeline(
    $organizationId: ID!
    $limit: Int
    $skip: Int
  ) {
    events: eventsByOrganizationConnection(
      where: { organizationId: $organizationId }
      first: $limit
      skip: $skip
    ) {
      edges {
        node {
          _id
          title
          description
          startDate
          endDate
          location
          creator {
            _id
            firstName
            lastName
            image
          }
          createdAt
        }
      }
    }
    posts: postsByOrganizationConnection(
      id: $organizationId
      first: $limit
      skip: $skip
    ) {
      edges {
        node {
          _id
          title
          text
          imageUrl
          createdAt
          creator {
            _id
            firstName
            lastName
            image
          }
        }
      }
    }
    membershipRequests(
      where: { organizationId: $organizationId }
      first: $limit
      skip: $skip
    ) {
      _id
      user {
        _id
        firstName
        lastName
        image
      }
      createdAt
    }
  }
`;

export const GET_ORGANIZATION_EVENTS_TIMELINE = gql`
  query GetOrganizationEventsTimeline(
    $organizationId: ID!
    $limit: Int
    $skip: Int
  ) {
    eventsByOrganizationConnection(
      where: { organizationId: $organizationId }
      first: $limit
      skip: $skip
      orderBy: createdAt_DESC
    ) {
      edges {
        node {
          _id
          title
          description
          startDate
          endDate
          location
          creator {
            _id
            firstName
            lastName
            image
          }
          createdAt
        }
      }
    }
  }
`;

export const GET_ORGANIZATION_POSTS_TIMELINE = gql`
  query GetOrganizationPostsTimeline(
    $organizationId: ID!
    $limit: Int
    $skip: Int
  ) {
    postsByOrganizationConnection(
      id: $organizationId
      first: $limit
      skip: $skip
      orderBy: createdAt_DESC
    ) {
      edges {
        node {
          _id
          title
          text
          imageUrl
          createdAt
          creator {
            _id
            firstName
            lastName
            image
          }
        }
      }
    }
  }
`;
