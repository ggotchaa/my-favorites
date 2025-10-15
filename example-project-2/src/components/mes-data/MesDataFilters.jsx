import { useMemo, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
// import { Button, ButtonGroup } from "@mui/material";

// import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import CloseIcon from "@mui/icons-material/Close";

import {
  // resetTableFilter,
  getTableFilter,
  // getFilterParams,
  // setFilterParams,
  // setTableFilter,
  // isTableFilterReset,
  // setCurrentPage,
  // setFrequentlyUsedFilters,
  // getFrequentlyUsedFilters,
  // updateFrequentlyUsedFilters,
} from "../../store/slices/mes-data/filterSlice";
import {
  getColumns,
  toggleColumn,
} from "../../store/slices/mes-data/columnsSlice";
// import { useMesData } from "../../hooks/useMesData";

import { HeaderWithActions } from "../common/HeaderWithActions";
// import { TableFilter } from "../common/TableFilter";
import { TableColumns } from "../common/TableColumns";

// import { TABLE_COLUMNS_IN_FILTER } from "../../constants/mes-data";
// import { FILTER_SOURCE } from "../../constants/global";

export const MesDataFilters = ({ toggleFiltersDrawer }) => {
  const dispatch = useDispatch();

  const tableFilter = useSelector(getTableFilter);
  // const filterParams = useSelector(getFilterParams);
  // const isFilterReset = useSelector(isTableFilterReset);
  // const frequentlyUsedFilters = useSelector(getFrequentlyUsedFilters);

  const columns = useSelector(getColumns);
  // const [activeButton, setActiveButton] = useState("columns");

  // const { getElementsByColumn } = useMesData();

  // const handleTabClick = (btn) => {
  //   setActiveButton(btn);
  // };

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
      // ...(activeButton !== "columns" && hasFilter(tableFilter)
      //   ? [
      //       {
      //         label: "Clear all",
      //         onClick: () => dispatch(resetTableFilter()),
      //         Icon: DeleteForeverIcon,
      //         type: "button",
      //         disabled: false,
      //         isVisible: true,
      //         id: "filter-clear-all-btn",
      //       },
      //     ]
      //   : []),
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
    [dispatch, hasFilter, tableFilter, toggleFiltersDrawer]
  );

  return (
    <div
      data-testid="mes-data-filters-container"
      className="min-w-[350px] pt-[60px] py-[24px] px-[24px] h-full"
    >
      <div
        data-testid="mes-data-filters-header-container"
        className="bg-white pt-[24px] mr-[24px] fixed flex flex-col w-[310px] z-10"
        style={{ width: "-webkit-fill-available" }}
      >
        <HeaderWithActions
          data-testid="mes-data-filters-header"
          title="Columns"
          actions={drawerFilterActions}
        />
        {/* <div className="w-full mt-5 ">
          <ButtonGroup
            className="w-full"
            variant="outlined"
            aria-label="Filter Sections"
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
        </div> */}
      </div>
      <div data-testid="mes-data-filters-content" className="mt-5 pt-12 pb-1">
        <TableColumns
          data-testid="mes-data-table-columns"
          columns={columns}
          toggleColumn={toggleColumn}
        />
        {/* {activeButton === "columns" && (
          <TableColumns columns={columns} toggleColumn={toggleColumn} />
        )}
        {activeButton === "table" && (
          <TableFilter
            tableFilter={tableFilter}
            filterParams={filterParams}
            setFilterParams={setFilterParams}
            setTableFilter={setTableFilter}
            columns={columns}
            isFilterReset={isFilterReset}
            getElementsByColumn={getElementsByColumn}
            tableColumns={TABLE_COLUMNS_IN_FILTER}
            source={FILTER_SOURCE.MES_DATA}
            setCurrentPage={setCurrentPage}
            setFrequentlyUsedFilters={setFrequentlyUsedFilters}
            updateFrequentlyUsedFilters={updateFrequentlyUsedFilters}
            frequentlyUsedFilters={frequentlyUsedFilters}
          />
        )} */}
      </div>
    </div>
  );
};
