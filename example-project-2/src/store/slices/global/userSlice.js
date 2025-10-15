import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    user: null,
    userRole: null,
    principalId: null,
    userRoleOptions: [],
    allowedUserActions: {
      all: true,
      jde: true,
      mes: true,
      wm: true,
      monitor: true,
      mm: true,
      em: true,
    },
    userPolicyId: 0,
  },
  reducers: {
    setPrincipalId: (state, action) => {
      state.principalId = action.payload;
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setUserRole: (state, action) => {
      state.userRole = action.payload;
    },
    setUserRoleOptions: (state, action) => {
      state.userRoleOptions = action.payload;
    },
    setAllowedActionsByUser: (state, action) => {
      state.allowedUserActions = action.payload;
    },
    setUserPolicyId: (state, action) => {
      state.userPolicyId = action.payload;
    },
  },
});

export const {
  setUser,
  setUserRole,
  setUserRoleOptions,
  setUserRoleLoading,
  setAllowedActionsByUser,
  setUserPolicyId,
  setPrincipalId,
} = userSlice.actions;
export const getUser = (state) => state.user.user;
export const getPrincipalId = (state) => state.user.principalId;
export const selectUserRole = (state) => state.user.userRole;
export const getUserRoleOptions = (state) => state.user.userRoleOptions;
export const allowedUserActions = (state) => state.user.allowedUserActions;
export const getUserPolicyId = (state) => state.user.userPolicyId;
export default userSlice.reducer;
