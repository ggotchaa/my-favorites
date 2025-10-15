import { useState, useMemo, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Button, ButtonGroup } from "@mui/material";

import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import CloseIcon from "@mui/icons-material/Close";

import {
  getColumns,
  toggleColumn,
} from "../../store/slices/materials-management/columnsSlice";
import {
  resetTableFilter,
  getTableFilter,
  getFilterParams,
  setFilterParams,
  setTableFilter,
  isTableFilterReset,
  setCurrentPage,
  setFrequentlyUsedFilters,
  getFrequentlyUsedFilters,
  updateFrequentlyUsedFilters,
} from "../../store/slices/materials-management/filterSlice";
import { useMaterialsManagement } from "../../hooks/useMaterialsManagement";

import { TableFilter } from "../common/TableFilter";
import { TableColumns } from "../common/TableColumns";
import { HeaderWithActions } from "../common/HeaderWithActions";

import { TABLE_COLUMNS_IN_FILTER } from "../../constants/materials-management";
import { FILTER_SOURCE } from "../../constants/global";

export const MaterialsManagementFilters = ({ toggleFiltersDrawer }) => {
  const dispatch = useDispatch();
  const columns = useSelector(getColumns);
  const [activeButton, setActiveButton] = useState("columns");

  const isFilterReset = useSelector(isTableFilterReset);
  const tableFilter = useSelector(getTableFilter);
  const filterParams = useSelector(getFilterParams);
  const frequentlyUsedFilters = useSelector(getFrequentlyUsedFilters);

  const { getElementsByColumn } = useMaterialsManagement();

  const handleTabClick = (btn) => {
    setActiveButton(btn);
  };

  const hasFilter = useCallback((tableFilter) => {
    for (const key in tableFilter) {
      const value = tableFilter[key];
      if (typeof value === "object") {
        if (hasFilter(value)) {
          return true;
        }
      } else {
        if (value) {
          return true;
        }
      }
    }
    return false;
  }, []);

  const drawerFilterActions = useMemo(
    () => [
      ...(activeButton !== "columns" && hasFilter(tableFilter)
        ? [
            {
              label: "Clear all",
              onClick: () => dispatch(resetTableFilter()),
              Icon: DeleteForeverIcon,
              type: "button",
              disabled: false,
              isVisible: true,
              id: "filter-clear-all-btn",
            },
          ]
        : []),
      {
        label: "Close",
        onClick: toggleFiltersDrawer(false),
        Icon: CloseIcon,
        type: "label",
        disabled: false,
        isVisible: true,
        id: "filter-close-btn",
      },
    ],
    [activeButton, dispatch, hasFilter, tableFilter, toggleFiltersDrawer]
  );

  return (
    <div
      className="min-w-[350px] pt-[88px] py-[24[x]] px-[24px] h-full"
      data-testid="filters-sidebar"
    >
      <HeaderWithActions title="Filters" actions={drawerFilterActions} />
      <div className="w-full mt-5" data-testid="filter-controls-container">
        <ButtonGroup
          className="w-full"
          variant="outlined"
          aria-label="Filter Sections"
          data-testid="filter-button-group"
        >
          <Button
            sx={{
              width: "50%",
              backgroundColor: activeButton === "columns" ? "#0066B214" : "",
            }}
            onClick={() => handleTabClick("columns")}
            data-testid="filter-columns-btn"
          >
            Columns
          </Button>
          <Button
            sx={{
              width: "50%",
              backgroundColor: activeButton === "table" ? "#0066B214" : "",
            }}
            onClick={() => handleTabClick("table")}
            data-testid="filter-table-btn"
          >
            Table
          </Button>
        </ButtonGroup>
      </div>
      <div className="mt-5" data-testid="filter-content-container">
        {activeButton === "columns" && (
          <TableColumns
            columns={columns}
            toggleColumn={toggleColumn}
            data-testid="table-columns-section"
          />
        )}
        {activeButton === "table" && (
          <TableFilter
            tableFilter={tableFilter}
            filterParams={filterParams}
            setFilterParams={setFilterParams}
            setTableFilter={setTableFilter}
            setCurrentPage={setCurrentPage}
            columns={columns}
            isFilterReset={isFilterReset}
            getElementsByColumn={getElementsByColumn}
            tableColumns={TABLE_COLUMNS_IN_FILTER}
            source={FILTER_SOURCE.MATERIALS_MANAGEMENT}
            setFrequentlyUsedFilters={setFrequentlyUsedFilters}
            updateFrequentlyUsedFilters={updateFrequentlyUsedFilters}
            frequentlyUsedFilters={frequentlyUsedFilters}
            data-testid="table-filter-section"
          />
        )}
      </div>
    </div>
  );
};
