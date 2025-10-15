import { createSlice } from "@reduxjs/toolkit";
import { FILTER_FREQUENCY } from "../../../constants/global";

const LOCAL_FREQUENTLY_USED_FILTERS = localStorage.getItem(
  "mmFrequentlyUsedFilters"
);
const FREQUENTLY_USED_FILTERS = LOCAL_FREQUENTLY_USED_FILTERS
  ? JSON.parse(LOCAL_FREQUENTLY_USED_FILTERS)
  : [];

const defaultParams = {
  Search: undefined,
  StartFrom: undefined,
  FetchRecord: undefined,
  FilteredColums: undefined,
};

const defaultTableFilter = {
  1: {
    column: {
      label: null,
      value: null,
    },
    operator: null,
    value: null,
  },
};

const filterSlice = createSlice({
  name: "mmfilter",
  initialState: {
    params: {
      Search: undefined,
      StartFrom: undefined,
      FetchRecord: undefined,
      FilteredColums: undefined,
    },
    tableFilter: defaultTableFilter,
    frequentlyUsedFilters: FREQUENTLY_USED_FILTERS,
    isTableFilterReset: false,
    currentPage: 0,
  },
  reducers: {
    setFilterParams: (state, action) => {
      state.params = action.payload;
    },
    resetFilterParams: (state) => {
      state.params = defaultParams;
    },
    setTableFilter: (state, action) => {
      state.tableFilter = action.payload;
      state.isTableFilterReset = false;
    },
    resetTableFilter: (state) => {
      state.tableFilter = defaultTableFilter;
      state.isTableFilterReset = true;
    },
    setFrequentlyUsedFilters: (state, action) => {
      if (action.payload) {
        const filters = [...state.frequentlyUsedFilters, ...action.payload];
        state.frequentlyUsedFilters = filters;
        localStorage.setItem(
          "mmFrequentlyUsedFilters",
          JSON.stringify(filters)
        );
      }
    },
    updateFrequentlyUsedFilters: (state, action) => {
      if (action.payload) {
        const filters = state.frequentlyUsedFilters.filter(
          (item) => JSON.stringify(item) !== JSON.stringify(action.payload)
        );
        state.frequentlyUsedFilters = filters;
        localStorage.setItem(
          "mmFrequentlyUsedFilters",
          JSON.stringify(filters)
        );
      }
    },
    clearAllFilters: (state) => {
      state.params = defaultParams;
      state.tableFilter = defaultTableFilter;
      state.isTableFilterReset = true;
      state.currentPage = 0;
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
  },
});

export const {
  setFilterParams,
  setTableFilter,
  resetFilterParams,
  resetTableFilter,
  clearAllFilters,
  setCurrentPage,
  setFrequentlyUsedFilters,
  updateFrequentlyUsedFilters,
} = filterSlice.actions;

export const getFilterParams = (state) => state.mmfilter.params;
export const getTableFilter = (state) => state.mmfilter.tableFilter;
export const isTableFilterReset = (state) => state.mmfilter.isTableFilterReset;
export const getCurrentPage = (state) => state.mmfilter.currentPage;

export const getFrequentlyUsedFilters = (state) => {
  if (state.mmfilter.frequentlyUsedFilters.length) {
    const countMap = state.mmfilter.frequentlyUsedFilters.reduce((acc, obj) => {
      const filter = JSON.stringify(obj);
      acc[filter] = (acc[filter] || 0) + 1;
      return acc;
    }, {});
    const frequentlyUsedFilters = Object.keys(countMap)
      .filter((item) => countMap[item] >= FILTER_FREQUENCY)
      .map((filter) => JSON.parse(filter));
    return frequentlyUsedFilters;
  } else {
    return state.mmfilter.frequentlyUsedFilters;
  }
};

export default filterSlice.reducer;
