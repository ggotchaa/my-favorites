import { createSlice } from "@reduxjs/toolkit";

const equipmentsFilterSlice = createSlice({
  name: "equipmentsFilter",
  initialState: {
    params: {
      StartFrom: 0,
      FetchRecord: 25,
      CategoryId: undefined,
      ClassId: undefined,
      SubClassId: undefined,
      AreaCode: { label: "", value: "" },
      UnitCode: { label: "", value: "" },
      FilteredColums: undefined,
    },
    filterPath: [],
    allUsedFilters: [],
    recentlyUsedFilters: [],
    frequentlyUsedFilters: [],
    currentPage: 0,
    filteredValuesByColumn: [],
    equipmentCategories: [],
  },
  reducers: {
    setEquipmentsParams: (state, action) => {
      state.params = action.payload;
    },
    setFilterPath: (state, action) => {
      state.filterPath = state.filterPath.push(action.payload);
    },
    setRecentlyUsedFilters: (state, action) => {
      Object.values(action.payload).forEach((value) => {
        state.recentlyUsedFilters = state.recentlyUsedFilters.concat(value);
      });
    },
    setEquipmentCategories: (state, action) => {
      state.equipmentCategories = action.payload;
    },
    resetFilter: (state) => {
      state.filterPath = [];
      state.params = {
        StartFrom: 0,
        FetchRecord: 25,
      };
    },
    setEquipmentsCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    setFilteredValuesByColumn: (state, action) => {
      Object.values(action.payload).forEach((value) => {
        state.filteredValuesByColumn =
          state.filteredValuesByColumn.concat(value);
      });
    },
  },
});

export const {
  setEquipmentsParams,
  setFilterPath,
  setEquipmentsCurrentPage,
  setFilteredValuesByColumn,
  setRecentlyUsedFilters,
  setEquipmentCategories,
  resetFilter,
} = equipmentsFilterSlice.actions;
export const getEquipmentsParams = (state) => state.equipmentsFilter.params;
export const getEquipmentsCurrentPage = (state) =>
  state.equipmentsFilter.currentPage;
export const getFilteredValuesByColumn = (state) => {
  let uniqueFilteredValuesByColumn = new Set(
    state.equipmentsFilter.filteredValuesByColumn.map(JSON.stringify)
  );
  return Array.from(uniqueFilteredValuesByColumn, JSON.parse);
};
export const getRecentlyUsedFilters = (state) => {
  let uniqueRecentFilters = new Set(
    state.equipmentsFilter.recentlyUsedFilters.map(JSON.stringify)
  );
  let recentFilters = Array.from(uniqueRecentFilters, JSON.parse)
    .reverse()
    .slice(0, 5);
  return recentFilters;
};
export const getEquipmentCategories = (state) =>
  state.equipmentsFilter.equipmentCategories;
export default equipmentsFilterSlice.reducer;
