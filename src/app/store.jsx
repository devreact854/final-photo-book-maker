import { configureStore } from "@reduxjs/toolkit";

import tabReducer from "../features/tabSlice";

const store = configureStore({
  reducer: {
    tab: tabReducer,
  },
});

export default store;