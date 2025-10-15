import { createSlice } from "@reduxjs/toolkit";

const schedulesSlice = createSlice({
  name: "schedules",
  initialState: {
    initialScheduleEquipmentStatuses: [],
    updatedScheduleEquipmentStatuses: [],
    isSchedulesListUpdated: null,
    isScheduledEquipmentsUpdated: null,
  },
  reducers: {
    setIsSchedulesListUpdated: (state) => {
      state.isSchedulesListUpdated = Date.now().toString();
    },
    setIsScheduledEquipmentsUpdated: (state) => {
      state.isScheduledEquipmentsUpdated = Date.now().toString();
    },
    setUpdatedScheduleEquipmentStatuses: (state, action) => {
      if (action.payload.length === 0) {
        state.updatedScheduleEquipmentStatuses = [];
      } else {
        // we are combining status changes here depending on the action.payload
        const mergedMap = new Map();
        state.updatedScheduleEquipmentStatuses.forEach((item) =>
          mergedMap.set(item.equipmentAssetNumberFhk, item)
        );

        action.payload.forEach((item) => {
          const existingItem = mergedMap.get(item.equipmentAssetNumberFhk);
          if (existingItem) {
            existingItem.walkDownStatus = item.walkDownStatus;
          } else {
            mergedMap.set(item.equipmentAssetNumberFhk, item);
          }
        });

        state.updatedScheduleEquipmentStatuses = Array.from(mergedMap.values());
      }
    },
    setInitialScheduleEquipmentStatuses: (state, action) => {
      state.initialScheduleEquipmentStatuses = action.payload;
    },
  },
});

export const {
  setIsSchedulesListUpdated,
  setIsScheduledEquipmentsUpdated,
  setUpdatedScheduleEquipmentStatuses,
  setInitialScheduleEquipmentStatuses,
} = schedulesSlice.actions;
export const isSchedulesListUpdated = (state) =>
  state.schedules.isSchedulesListUpdated;
export const isScheduledEquipmentsUpdated = (state) =>
  state.schedules.isScheduledEquipmentsUpdated;
export const getUpdatedScheduleEquipmentStatuses = (state) =>
  state.schedules.updatedScheduleEquipmentStatuses;
export const getInitialScheduleEquipmentStatuses = (state) =>
  state.schedules.initialScheduleEquipmentStatuses;

export default schedulesSlice.reducer;
