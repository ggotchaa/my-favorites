import { createSlice } from "@reduxjs/toolkit";

const characteristicsSlice = createSlice({
  name: "jdeCharacteristics",
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
  state.jdeCharacteristics.isCharacteristicsUpdated;
export const isSpecificCharsUpdated = (state) =>
  state.jdeCharacteristics.isSpecificCharsUpdated;
export const isWalkdownPicturesUpdated = (state) =>
  state.jdeCharacteristics.isWalkdownPicturesUpdated;
export const selectedEquipmentTagId = (state) => {
  const selectedEquipmentTagId = localStorage.getItem("selectedEquipmentTagId");
  if (selectedEquipmentTagId) {
    return JSON.parse(selectedEquipmentTagId);
  } else {
    return state.jdeCharacteristics.selectedEquipmentTagId;
  }
};
export const selectedEnrichmentStatus = (state) =>
  state.jdeCharacteristics.currentEnrichmentStatus;

export default characteristicsSlice.reducer;
