import { combineReducers } from 'redux';
import routesReducer from './routesReducer';
import userRoutesReducer from './userRoutesReducer';
import activityTimelineReducer from './activityTimelineReducer';

export const reducers = combineReducers({
  appRoutes: routesReducer,
  userRoutes: userRoutesReducer,
  activityTimeline: activityTimelineReducer,
});

export type RootState = ReturnType<typeof reducers>;
