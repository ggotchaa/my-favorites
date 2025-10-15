import { createSlice } from "@reduxjs/toolkit";
import { DEFAULT_JDE_COLUMNS } from "../../../constants/jde-data";

const LOCAL_COLUMNS = localStorage.getItem("jdeTableColumns");
const DEFAULT_COLUMNS = LOCAL_COLUMNS
  ? JSON.parse(LOCAL_COLUMNS)
  : DEFAULT_JDE_COLUMNS;

const columnsSlice = createSlice({
  name: "jdeTableColumns",
  initialState: {
    columns: DEFAULT_COLUMNS || [],
  },
  reducers: {
    toggleColumn: (state, action) => {
      const updatedColumns = state.columns.map((column) =>
        column.id === action.payload
          ? { ...column, isChecked: !column.isChecked }
          : column
      );
      state.columns = updatedColumns;
      localStorage.setItem("jdeTableColumns", JSON.stringify(updatedColumns));
    },
    setColumns: (state, action) => {
      let isRootColumnsUpdated = false;

      for (let index = 0; index < action.payload.length; index++) {
        const { label, align, id, isDisabled, isVisible, width, order } =
          action.payload[index];
        if (
          label !== DEFAULT_COLUMNS[index]?.label ||
          align !== DEFAULT_COLUMNS[index].align ||
          id !== DEFAULT_COLUMNS[index].id ||
          isDisabled !== DEFAULT_COLUMNS[index].isDisabled ||
          isVisible !== DEFAULT_COLUMNS[index].isVisible ||
          width !== DEFAULT_COLUMNS[index].width ||
          order !== DEFAULT_COLUMNS[index].order
        ) {
          isRootColumnsUpdated = true;
          break;
        }
      }

      if (
        action.payload.length !== DEFAULT_COLUMNS.length ||
        isRootColumnsUpdated
      ) {
        localStorage.setItem("jdeTableColumns", JSON.stringify(action.payload));
        state.columns = action.payload;
      } else {
        state.columns = DEFAULT_COLUMNS;
      }
    },
  },
});

export const { toggleColumn, setColumns } = columnsSlice.actions;
export const getColumns = (state) => state.jdeTableColumns.columns;

export default columnsSlice.reducer;
