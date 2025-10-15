import { createSlice } from "@reduxjs/toolkit";
import { FILTER_CRITERIA_FIELDS } from "../../../constants/walkdown-management";

const DEFAULT_PARAMS = {
  searchEquipment: "",
  equipmentTag: "",
  parentEquipmentTag: "",
  areaCodeId: "",
  unitCodeId: "",
  acRanking: "",
  icRanking: "",
  ecRanking: "",
  piD: null, // D is a typo from DB
  equipmentStatusId: "",
  startFrom: 0,
  fetchRecord: 100,
};

const notAssignedTagsSlice = createSlice({
  name: "notAssignedTagsForEnrichmentManagement",
  initialState: {
    params: DEFAULT_PARAMS,
    currentPage: 0,
    filterByColumn: {
      filterCriteria: "",
      filterParams: {
        ...DEFAULT_PARAMS,
        fetchRecord: 1000,
      },
    },
    filteredUnitCodes: [],
  },
  reducers: {
    setFilterParams: (state, action) => {
      state.params = action.payload;
      const searchEquipmentValue = action.payload.searchEquipment;
      state.filterByColumn.filterCriteria = searchEquipmentValue
        ? `EQUIPMENT_TAG,${searchEquipmentValue}`
        : "";
    },
    setFilterCriteria: (state, action) => {
      const { column, value } = action.payload;
      const criteriaColumn = FILTER_CRITERIA_FIELDS[column];
      const newFilterValue = `${criteriaColumn},${value}`;

      const existingCriteria = state.filterByColumn.filterCriteria
        ? state.filterByColumn.filterCriteria.split(";")
        : [];

      const filteredCriteria = existingCriteria.filter(
        (criteria) => !criteria.startsWith(criteriaColumn + ",")
      );

      if (value) {
        filteredCriteria.push(newFilterValue);
      }

      state.filterByColumn.filterCriteria = filteredCriteria.join(";");
    },
    setFilterByColumn: (state, action) => {
      const { column, newFilters } = action.payload;
      const isSetToNull = column === "piD" && !newFilters.length;
      state.params = {
        ...state.params,
        [column]: isSetToNull ? null : newFilters.join(","),
      };
      state.filterByColumn.filterParams = {
        ...state.filterByColumn.filterParams,
        [column]: isSetToNull ? null : newFilters.join(","),
      };
    },
    resetFilterParams: (state) => {
      state.params = DEFAULT_PARAMS;
      state.currentPage = 0;
    },
    resetFilterByColumn: (state) => {
      state.filterByColumn.filterParams = {
        ...DEFAULT_PARAMS,
        fetchRecord: 1000,
      };
      state.filterByColumn.filterCriteria = "";
    },
    resetAllFilters: (state) => {
      notAssignedTagsSlice.caseReducers.resetFilterParams(state);
      notAssignedTagsSlice.caseReducers.resetFilterByColumn(state);
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    setFilteredUnitCodes: (state, action) => {
      state.filteredUnitCodes = action.payload;
    },
  },
});

export const {
  setFilterParams,
  resetFilterParams,
  setCurrentPage,
  setFilterCriteria,
  setFilterByColumn,
  resetFilterByColumn,
  setFilteredUnitCodes,
  resetAllFilters,
} = notAssignedTagsSlice.actions;

export const getFilterParams = (state) =>
  state.notAssignedTagsForEnrichmentManagement.params;
export const getFilterByColumn = (state) =>
  state.notAssignedTagsForEnrichmentManagement.filterByColumn.filterParams;
export const getFilterCriteria = (state) =>
  state.notAssignedTagsForEnrichmentManagement.filterByColumn.filterCriteria;
export const getCurrentPage = (state) =>
  state.notAssignedTagsForEnrichmentManagement.currentPage;
export const getFilteredUnitCodes = (state) =>
  state.notAssignedTagsForEnrichmentManagement.filteredUnitCodes;
export const isAnyFilterApplied = (state) =>
  JSON.stringify(state.notAssignedTagsForEnrichmentManagement.params) !==
  JSON.stringify(DEFAULT_PARAMS);

export default notAssignedTagsSlice.reducer;
