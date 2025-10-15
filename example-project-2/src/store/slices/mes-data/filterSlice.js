import { createSlice } from "@reduxjs/toolkit";
import { FILTER_FREQUENCY } from "../../../constants/global";

const LOCAL_FREQUENTLY_USED_FILTERS = localStorage.getItem(
  "mesFrequentlyUsedFilters"
);
const FREQUENTLY_USED_FILTERS = LOCAL_FREQUENTLY_USED_FILTERS
  ? JSON.parse(LOCAL_FREQUENTLY_USED_FILTERS)
  : [];

const defaultParams = {
  Search: undefined,
  StartFrom: undefined,
  FetchRecord: undefined,
  CategoryId: undefined,
  ClassId: undefined,
  SubClassId: undefined,
  AreaCode: { label: "", value: "" },
  UnitCode: { label: "", value: "" },
  FilteredColums: [],
  orderColumn: "asseT_NUMBER_BK",
  orderType: "ASC",
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
  name: "mesfilter",
  initialState: {
    params: {
      Search: undefined,
      StartFrom: undefined,
      FetchRecord: undefined,
      CategoryId: undefined,
      ClassId: undefined,
      SubClassId: undefined,
      AreaCode: { label: "", value: "" },
      UnitCode: { label: "", value: "" },
      FilteredColums: [],
      orderColumn: "asseT_NUMBER_BK",
      orderType: "ASC",
    },
    selectedCategory: {
      id: undefined,
      label: undefined,
    },
    selectedClass: {
      id: undefined,
      label: undefined,
    },
    selectedSubClass: {
      id: undefined,
      label: undefined,
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
      state.selectedCategory = {
        id: undefined,
        label: undefined,
      };
      state.selectedClass = {
        id: undefined,
        label: undefined,
      };
      state.selectedSubClass = {
        id: undefined,
        label: undefined,
      };
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
          "mesFrequentlyUsedFilters",
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
          "mesFrequentlyUsedFilters",
          JSON.stringify(filters)
        );
      }
    },
    setSelectedCategory: (state, action) => {
      if (action.payload) {
        const { id, title } = action.payload;
        state.selectedCategory = {
          id,
          label: title,
        };
      } else {
        state.selectedCategory = {
          id: undefined,
          label: undefined,
        };
      }
    },
    setSelectedClass: (state, action) => {
      if (action.payload) {
        const { id, title } = action.payload;
        state.selectedClass = {
          id,
          label: title,
        };
      } else {
        state.selectedClass = {
          id: undefined,
          label: undefined,
        };
      }
    },
    setSelectedSubClass: (state, action) => {
      if (action.payload) {
        const { id, title } = action.payload;
        state.selectedSubClass = {
          id,
          label: title,
        };
      } else {
        state.selectedSubClass = {
          id: undefined,
          label: undefined,
        };
      }
    },
    resetAllCategories: (state) => {
      state.params = {
        ...state.params,
        CategoryId: undefined,
        ClassId: undefined,
        SubClassId: undefined,
      };
      state.selectedCategory = {
        id: undefined,
        label: undefined,
      };
      state.selectedClass = {
        id: undefined,
        label: undefined,
      };
      state.selectedSubClass = {
        id: undefined,
        label: undefined,
      };
    },
    clearAllFilters: (state) => {
      state.params = defaultParams;
      state.selectedCategory = {
        id: undefined,
        label: undefined,
      };
      state.selectedClass = {
        id: undefined,
        label: undefined,
      };
      state.selectedSubClass = {
        id: undefined,
        label: undefined,
      };
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
  setFrequentlyUsedFilters,
  updateFrequentlyUsedFilters,
  setSelectedCategory,
  setSelectedClass,
  setSelectedSubClass,
  resetFilterParams,
  resetAllCategories,
  resetTableFilter,
  clearAllFilters,
  setCurrentPage,
} = filterSlice.actions;

export const getFilterParams = (state) => state.mesfilter.params;
export const getTableFilter = (state) => state.mesfilter.tableFilter;
export const getSelectedCategory = (state) => state.mesfilter.selectedCategory;
export const getSelectedClass = (state) => state.mesfilter.selectedClass;
export const getSelectedSubClass = (state) => state.mesfilter.selectedSubClass;
export const isTableFilterReset = (state) => state.mesfilter.isTableFilterReset;
export const getCurrentPage = (state) => state.mesfilter.currentPage;

export const getFrequentlyUsedFilters = (state) => {
  if (state.mesfilter.frequentlyUsedFilters.length) {
    const countMap = state.mesfilter.frequentlyUsedFilters.reduce(
      (acc, obj) => {
        const filter = JSON.stringify(obj);
        acc[filter] = (acc[filter] || 0) + 1;
        return acc;
      },
      {}
    );
    const frequentlyUsedFilters = Object.keys(countMap)
      .filter((item) => countMap[item] >= FILTER_FREQUENCY)
      .map((filter) => JSON.parse(filter));
    return frequentlyUsedFilters;
  } else {
    return state.mesfilter.frequentlyUsedFilters;
  }
};

export default filterSlice.reducer;
