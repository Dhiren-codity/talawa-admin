import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { InterfaceActivityFilters, ActivityType } from 'components/ActivityTimeline/types';

interface ActivityTimelineState {
  filters: InterfaceActivityFilters;
}

const initialState: ActivityTimelineState = {
  filters: {
    searchTerm: '',
    selectedTypes: ['EVENT', 'POST', 'MEMBERSHIP_REQUEST'],
    sortOrder: 'desc',
  },
};

const activityTimelineSlice = createSlice({
  name: 'activityTimeline',
  initialState,
  reducers: {
    setActivityFilters: (state, action: PayloadAction<InterfaceActivityFilters>) => {
      state.filters = action.payload;
    },
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.filters.searchTerm = action.payload;
    },
    setSelectedTypes: (state, action: PayloadAction<ActivityType[]>) => {
      state.filters.selectedTypes = action.payload;
    },
    setSortOrder: (state, action: PayloadAction<'asc' | 'desc'>) => {
      state.filters.sortOrder = action.payload;
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
  },
});

export const {
  setActivityFilters,
  setSearchTerm,
  setSelectedTypes,
  setSortOrder,
  resetFilters,
} = activityTimelineSlice.actions;

export default activityTimelineSlice.reducer;
