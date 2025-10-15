import { createSlice } from "@reduxjs/toolkit";

const manufactuterSlice = createSlice({
  name: "manufacturer",
  initialState: {
    isManufacturerListUpdated: null,
  },
  reducers: {
    setIsManufacturerListUpdated: (state) => {
      state.isManufacturerListUpdated = Date.now().toString();
    },
  },
});

export const { setIsManufacturerListUpdated } = manufactuterSlice.actions;
export const isManufacturerListUpdated = (state) =>
  state.manufacturer.isManufacturerListUpdated;
export default manufactuterSlice.reducer;
