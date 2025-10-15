import { createSlice } from "@reduxjs/toolkit";

const selectedTagsSlice = createSlice({
  name: "mesSelectedTags",
  initialState: {
    tags: [],
  },
  reducers: {
    setSelectedTags: (state, action) => {
      state.tags = action.payload;
    },
    clearSelectedTags: (state) => {
      state.tags = [];
    },
  },
});

export const { setSelectedTags, clearSelectedTags } = selectedTagsSlice.actions;
export const getSelectedTags = (state) => state.mesSelectedTags.tags;
export default selectedTagsSlice.reducer;
