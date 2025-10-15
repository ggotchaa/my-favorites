import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/global/userSlice";
import equipmentsFilterReducer from "./slices/equipmentsFilterSlice";
import jdeColumnsReducer from "./slices/jde-data/columnsSlice";
import mesColumnsReducer from "./slices/mes-data/columnsSlice";
import mmColumnsReducer from "./slices/materials-management/columnsSlice";
import jdeFilterReducer from "./slices/jde-data/filterSlice";
import mesFilterReducer from "./slices/mes-data/filterSlice";
import mmFilterReducer from "./slices/materials-management/filterSlice";
import manufacturerReducer from "./slices/jde-data/manufacterSlice";
import jdeCharacteristicsReducer from "./slices/jde-data/characteristicsSlice";
import mesCharacteristicsReducer from "./slices/mes-data/characteristicsSlice";
import schedulesReducer from "./slices/walkdown-management/schedulesSlice";
import walkdownUsersReducer from "./slices/walkdown-management/walkdownUsersSlice";
import notAssignedTagsForWalkdownReducer from "./slices/walkdown-management/notAssignedTagsSlice";
import notAssignedTagsForEnrichmentReducer from "./slices/enrichment-management/notAssignedTagsSlice";
import jdeSelectedTagsReduder from "./slices/jde-data/selectedTagsSlice";
import mesSelectedTagsReduder from "./slices/mes-data/selectedTagsSlice";

const store = configureStore({
  reducer: {
    user: userReducer,
    equipmentsFilter: equipmentsFilterReducer,
    jdeTableColumns: jdeColumnsReducer, // jde data
    mesTableColumns: mesColumnsReducer, // mes data
    mmTableColumns: mmColumnsReducer, // materials management
    jdefilter: jdeFilterReducer,
    mesfilter: mesFilterReducer,
    manufacturer: manufacturerReducer,
    jdeCharacteristics: jdeCharacteristicsReducer,
    mesCharacteristics: mesCharacteristicsReducer,
    mmfilter: mmFilterReducer,
    schedules: schedulesReducer,
    walkdownUsers: walkdownUsersReducer,
    notAssignedTagsForEnrichmentManagement: notAssignedTagsForEnrichmentReducer,
    notAssignedTagsForWalkdownManagement: notAssignedTagsForWalkdownReducer,
    jdeSelectedTags: jdeSelectedTagsReduder,
    mesSelectedTags: mesSelectedTagsReduder,
  },
});

export default store;
