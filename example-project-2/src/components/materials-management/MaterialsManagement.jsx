import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Drawer } from "@mui/material";

import { useClearSchedulePagination } from "../../hooks/useClearSchedulePagination";

import FilterListIcon from "@mui/icons-material/FilterList";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import RefreshIcon from "@mui/icons-material/Refresh";

import { getColumns } from "../../store/slices/materials-management/columnsSlice";

import {
  clearAllFilters,
  getFilterParams,
  getTableFilter,
  setFilterParams,
  setTableFilter,
  getCurrentPage,
} from "../../store/slices/materials-management/filterSlice";

import { HeaderWithActions } from "../common/HeaderWithActions";
import { MaterialsManagementFilters } from "./MaterialsManagementFilters";
import { MaterialsManagementTable } from "./MaterialsManagementTable";
import { useMaterialsManagement } from "../../hooks/useMaterialsManagement";
import { downloadMaterialsManagement } from "../../utils";
import { FILENAME } from "../../constants/materials-management";
import { FILE_FORMAT } from "../../constants/global";

export const MaterialsManagement = () => {
  const dispatch = useDispatch();
  const columns = useSelector(getColumns);
  const filterParams = useSelector(getFilterParams);
  const tableFilter = useSelector(getTableFilter);
  const currentPage = useSelector(getCurrentPage);
  const [openFilters, setOpenFilters] = useState(false);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalRows, setTotalRows] = useState(0);
  const savedRowsPerPage = localStorage.getItem("materialsRowsPerPage");
  const [rowsPerPage, setRowsPerPage] = useState(
    savedRowsPerPage ? Number(savedRowsPerPage) : 25
  );

  const [isCSVLoading, setIsCSVLoading] = useState(false);

  const { getMaterialsManagement } = useMaterialsManagement();

  // Clear schedule pagination data on component mount
  useClearSchedulePagination();

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    getMaterialsManagement({
      ...filterParams,
      StartFrom: currentPage + 1,
      FetchRecord: rowsPerPage,
    })
      .then((response) => {
        if (isMounted) {
          if (response) {
            setRows(response.allData);
            setTotalRows(response.totalCount);
            setLoading(false);
          }
        }
      })
      .finally(() => {
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [currentPage, filterParams, getMaterialsManagement, rowsPerPage]);

  const toggleFiltersDrawer = (newOpen) => () => {
    setOpenFilters(newOpen);
  };

  const handleRefresh = useCallback(() => {
    dispatch(setFilterParams({ ...filterParams }));
    dispatch(setTableFilter({ ...tableFilter }));
  }, [dispatch, filterParams, tableFilter]);

  const handleDownloadCSV = useCallback(() => {
    setIsCSVLoading(true);
    getMaterialsManagement({
      ...filterParams,
      StartFrom: 1,
      FetchRecord: totalRows,
    })
      .then((response) => {
        if (response) {
          downloadMaterialsManagement(
            response.allData,
            columns,
            FILENAME,
            FILE_FORMAT.CSV
          );
          setIsCSVLoading(false);
        }
      })
      .finally(() => {
        setIsCSVLoading(false);
      });
  }, [columns, getMaterialsManagement, totalRows, filterParams]);

  const tableActions = useMemo(
    () => [
      {
        label: "Filters",
        onClick: toggleFiltersDrawer(true),
        Icon: FilterListIcon,
        type: "button",
        disabled: false,
        isVisible: true,
        id: "filters",
      },
      {
        label: "Clear all",
        onClick: () => dispatch(clearAllFilters()),
        Icon: DeleteForeverIcon,
        type: "button",
        disabled: false,
        isVisible: true,
        id: "clearAll",
      },
      {
        label: "Refresh",
        onClick: handleRefresh,
        Icon: RefreshIcon,
        type: "button",
        disabled: false,
        isVisible: true,
        id: "refresh",
      },
      {
        label: "Download",
        downloadCSV: handleDownloadCSV,
        isCSVLoading,
        type: "menu",
        disabled: isCSVLoading,
        isVisible: true,
        id: "download",
      },
    ],
    [dispatch, handleDownloadCSV, handleRefresh, isCSVLoading]
  );

  return (
    <div
      className="flex flex-col gap-2 w-full"
      data-testid="materials-management-container"
    >
      <HeaderWithActions title="Materials Management" actions={tableActions} />
      <MaterialsManagementTable
        rows={rows}
        columns={columns}
        loading={loading}
        totalRows={totalRows}
        rowsPerPage={rowsPerPage}
        setRowsPerPage={setRowsPerPage}
        currentPage={currentPage}
        data-testid="materials-management-table"
      />
      <Drawer
        open={openFilters}
        onClose={toggleFiltersDrawer(false)}
        anchor="right"
        data-testid="materials-management-filters-drawer"
        ModalProps={{
          keepMounted: true,
        }}
      >
        <MaterialsManagementFilters toggleFiltersDrawer={toggleFiltersDrawer} />
      </Drawer>
    </div>
  );
};
