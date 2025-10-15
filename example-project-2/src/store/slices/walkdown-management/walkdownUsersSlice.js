import { createSlice } from "@reduxjs/toolkit";

const walkdownUsersSlice = createSlice({
  name: "walkdownUsers",
  initialState: {
    isWalkdownUsersListUpdated: null,
  },
  reducers: {
    setIsWalkdownUsersListUpdated: (state) => {
      state.isWalkdownUsersListUpdated = Date.now().toString();
    },
  },
});

export const { setIsWalkdownUsersListUpdated } = walkdownUsersSlice.actions;
export const isWalkdownUsersListUpdated = (state) =>
  state.walkdownUsers.isWalkdownUsersListUpdated;
export default walkdownUsersSlice.reducer;
