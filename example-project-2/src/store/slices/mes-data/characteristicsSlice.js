import { createSlice } from "@reduxjs/toolkit";

const characteristicsSlice = createSlice({
  name: "mesCharacteristics",
  initialState: {
    isCharacteristicsUpdated: null,
    isSpecificCharsUpdated: null,
    isWalkdownPicturesUpdated: null,
    selectedEquipmentTagId: null,
    currentEnrichmentStatus: "",
  },
  reducers: {
    setIsCharacteristicsUpdated: (state) => {
      state.isCharacteristicsUpdated = Date.now().toString();
    },
    setIsSpecificCharsUpdated: (state) => {
      state.isSpecificCharsUpdated = Date.now().toString();
    },
    setIsWalkdownPicturesUpdated: (state) => {
      state.isWalkdownPicturesUpdated = Date.now().toString();
    },
    setSelectedEquipmentTagId: (state, action) => {
      localStorage.setItem(
        "selectedEquipmentTagId",
        JSON.stringify(action.payload)
      );
      state.selectedEquipmentTagId = action.payload;
    },
    setEnrichmentStatus: (state, action) => {
      state.currentEnrichmentStatus = action.payload;
    },
  },
});

export const {
  setIsCharacteristicsUpdated,
  setIsSpecificCharsUpdated,
  setIsWalkdownPicturesUpdated,
  setSelectedEquipmentTagId,
  setEnrichmentStatus,
} = characteristicsSlice.actions;
export const isCharacteristicsUpdated = (state) =>
  state.mesCharacteristics.isCharacteristicsUpdated;
export const isSpecificCharsUpdated = (state) =>
  state.mesCharacteristics.isSpecificCharsUpdated;
export const isWalkdownPicturesUpdated = (state) =>
  state.mesCharacteristics.isWalkdownPicturesUpdated;
export const selectedEquipmentTagId = (state) => {
  const selectedEquipmentTagId = localStorage.getItem("selectedEquipmentTagId");
  if (selectedEquipmentTagId) {
    return JSON.parse(selectedEquipmentTagId);
  } else {
    return state.mesCharacteristics.selectedEquipmentTagId;
  }
};
export const selectedEnrichmentStatus = (state) =>
  state.mesCharacteristics.currentEnrichmentStatus;

export default characteristicsSlice.reducer;
