import { createSlice } from "@reduxjs/toolkit";

const loginSlice = createSlice({
  name: "login",
  initialState: null,
  reducers: {
    setLoginData: (state, action) => {
      return action.payload;
    },
    logout: () => {
      return null;
    },
  },
});

export const { setLoginData, logout } = loginSlice.actions;
export default loginSlice.reducer;
