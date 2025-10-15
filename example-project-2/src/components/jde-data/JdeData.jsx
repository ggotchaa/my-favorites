import { useMemo, useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import { useClearSchedulePagination } from "../../hooks/useClearSchedulePagination";

import ViewWeekIcon from "@mui/icons-material/ViewWeek";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import RefreshIcon from "@mui/icons-material/Refresh";
import EditIcon from "@mui/icons-material/Edit";

import { Drawer } from "@mui/material";

import { getColumns } from "../../store/slices/jde-data/columnsSlice";
import { selectUserRole } from "../../store/slices/global/userSlice";
import { USER_ROLE } from "../../constants/environment";
import {
  clearAllFilters,
  getFilterParams,
  getTableFilter,
  setFilterParams,
  setTableFilter,
  getCurrentPage,
} from "../../store/slices/jde-data/filterSlice";
import { useJdeData } from "../../hooks/useJdeDataHook";
import { getFormattedCategories, downloadJdeData } from "../../utils";

import { HeaderWithActions } from "../common/HeaderWithActions";
import { CategoriesDrawer } from "../common/CategoriesDrawer";
import { JdeDataFilters } from "./JdeDataFilters";
import { JdeDataTable } from "./JdeDataTable";
import { FILENAME } from "../../constants/jde-data";
import { FILE_FORMAT } from "../../constants/global";
import { BulkChangeModal } from "./BulkChangeModal";

export const JdeData = () => {
  const dispatch = useDispatch();
  const columns = useSelector(getColumns);
  const filterParams = useSelector(getFilterParams);
  const tableFilter = useSelector(getTableFilter);
  const [categories, setCategoriesList] = useState([]);
  const [openCategories, setOpenCategories] = useState(false);
  const [openFilters, setOpenFilters] = useState(false);
  const userRole = useSelector(selectUserRole);
  const isBulkChangeEnabled =
    userRole === USER_ROLE.ADMIN ||
    userRole === USER_ROLE.SME ||
    userRole === USER_ROLE.QA_ENGINEER;

  const [rows, setRows] = useState([]);
  const savedRowsPerPage = localStorage.getItem("jdeRowsPerPage");
  const [rowsPerPage, setRowsPerPage] = useState(
    savedRowsPerPage ? Number(savedRowsPerPage) : 25
  );
  const [totalRows, setTotalRows] = useState(0);
  const currentPage = useSelector(getCurrentPage);

  const [loading, setLoading] = useState(false);

  const [isExcelLoading, setIsExcelLoading] = useState(false);
  const [isCSVLoading, setIsCSVLoading] = useState(false);

  const [selectedTags, setSelectedTags] = useState([]);
  const [isBulkChangeModalOpen, setIsBulkChangeModalOpen] = useState(false);

  const { getCategoriesList, getElements, bulkUpdateEquipmentDetails } =
    useJdeData();

  // Clear schedule pagination data on component mount
  useClearSchedulePagination();

  useEffect(() => {
    let isMounted = true;
    const fetchRows = () => {
      setLoading(true);
      getElements({
        ...filterParams,
        FilteredColums: filterParams.FilteredColums
          ? JSON.stringify(filterParams.FilteredColums)
          : undefined,
        AreaCode: filterParams.AreaCode.value ?? undefined,
        UnitCode: filterParams.UnitCode.value ?? undefined,
        StartFrom: currentPage,
        FetchRecord: rowsPerPage,
      })
        .then((response) => {
          if (isMounted && response) {
            setLoading(false);
            setRows(response.items);
            setTotalRows(response.count);
          }
        })
        .finally(() => {
          setLoading(false);
        });
    };

    fetchRows();
  }, [currentPage, filterParams, getElements, rowsPerPage]);

  useEffect(() => {
    let isMounted = true;
    const fetchRows = () => {
      getCategoriesList().then((response) => {
        if (isMounted && response) {
          const categories = getFormattedCategories(response);
          setCategoriesList(categories);
        }
      });
    };

    fetchRows();
    return () => {
      isMounted = false;
    };
  }, [dispatch, getCategoriesList]);

  const toggleCategoriesDrawer = (newOpen) => () => {
    setOpenCategories(newOpen);
  };

  const toggleFiltersDrawer = (newOpen) => () => {
    setOpenFilters(newOpen);
  };

  const handleRefresh = useCallback(() => {
    dispatch(setFilterParams({ ...filterParams }));
    dispatch(setTableFilter({ ...tableFilter }));
  }, [dispatch, filterParams, tableFilter]);

  const handleDownloadExcel = useCallback(() => {
    setIsExcelLoading(true);
    getElements({
      ...filterParams,
      FilteredColums: filterParams.FilteredColums
        ? JSON.stringify(filterParams.FilteredColums)
        : undefined,
      AreaCode: filterParams.AreaCode.value ?? undefined,
      UnitCode: filterParams.UnitCode.value ?? undefined,
      StartFrom: 0,
      FetchRecord: totalRows,
    })
      .then((response) => {
        if (response) {
          downloadJdeData(response.items, columns, FILENAME, FILE_FORMAT.EXCEL);
          setIsExcelLoading(false);
        }
      })
      .finally(() => {
        setIsExcelLoading(false);
      });
  }, [columns, getElements, totalRows, filterParams]);

  const handleDownloadCSV = useCallback(() => {
    setIsCSVLoading(true);
    getElements({
      ...filterParams,
      FilteredColums: filterParams.FilteredColums
        ? JSON.stringify(filterParams.FilteredColums)
        : undefined,
      AreaCode: filterParams.AreaCode.value ?? undefined,
      UnitCode: filterParams.UnitCode.value ?? undefined,
      StartFrom: 0,
      FetchRecord: totalRows,
    })
      .then((response) => {
        if (response) {
          downloadJdeData(response.items, columns, FILENAME, FILE_FORMAT.CSV);
          setIsCSVLoading(false);
        }
      })
      .finally(() => {
        setIsCSVLoading(false);
      });
  }, [columns, getElements, totalRows, filterParams]);

  const handleBulkChange = () => {
    const uniqueStatuses = new Set(
      selectedTags.map((tag) => tag.equipmenT_STATUS)
    );
    if (uniqueStatuses.size > 1) {
      toast.error("Please select tags with same enrichment statuses");
      return;
    }
    setIsBulkChangeModalOpen(true);
  };

  const handleBulkChangeConfirm = ({ newStatus, comment }) => {
    const payload = {
      assetNumberPhks: selectedTags.map((tag) => tag.asseT_NUMBER_PHK) || [],
      newStatusPhk: newStatus,
      comment,
    };
    bulkUpdateEquipmentDetails(payload).then(() => {
      setLoading(true);
      getElements({
        ...filterParams,
        FilteredColums: filterParams.FilteredColums
          ? JSON.stringify(filterParams.FilteredColums)
          : undefined,
        AreaCode: filterParams.AreaCode.value ?? undefined,
        UnitCode: filterParams.UnitCode.value ?? undefined,
        StartFrom: currentPage,
        FetchRecord: rowsPerPage,
      })
        .then((response) => {
          if (response) {
            setRows(response.items);
            setTotalRows(response.count);
            setSelectedTags([]);
            setIsBulkChangeModalOpen(false);
            setLoading(false);
          }
        })
        .finally(() => {
          setLoading(false);
        });
    });
  };

  const tableActions = useMemo(
    () => [
      {
        label: "Columns",
        onClick: toggleFiltersDrawer(true),
        Icon: ViewWeekIcon,
        type: "button",
        disabled: false,
        isVisible: true,
        id: "filters",
      },
      {
        label: "Clear all",
        onClick: () => {
          dispatch(clearAllFilters());
          setSelectedTags([]);
        },
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
        downloadExcel: handleDownloadExcel,
        downloadCSV: handleDownloadCSV,
        isExcelLoading,
        isCSVLoading,
        type: "menu",
        disabled: isExcelLoading || isCSVLoading,
        isVisible: true,
        id: "download",
      },
      {
        label: "Bulk Change",
        onClick: handleBulkChange,
        Icon: EditIcon,
        type: "button",
        disabled: selectedTags.length === 0,
        isVisible: isBulkChangeEnabled,
        id: "bulkChange",
      },
    ],
    [
      dispatch,
      handleDownloadCSV,
      handleDownloadExcel,
      handleRefresh,
      isCSVLoading,
      isExcelLoading,
      selectedTags.length,
    ]
  );

  return (
    <div
      className="flex flex-col gap-2 w-full min-w-[1200px]"
      data-testid="jde-data-container"
    >
      <HeaderWithActions title="JDE data" actions={tableActions} />
      <JdeDataTable
        rows={rows}
        loading={loading}
        columns={columns}
        totalRows={totalRows}
        rowsPerPage={rowsPerPage}
        currentPage={currentPage}
        setRowsPerPage={setRowsPerPage}
        toggleCategoriesDrawer={toggleCategoriesDrawer}
        onSelectedTagsChange={setSelectedTags}
        selectedTags={selectedTags}
        setSelectedTags={setSelectedTags}
        isBulkChangeEnabled={isBulkChangeEnabled}
      />
      <Drawer
        open={openCategories}
        onClose={toggleCategoriesDrawer(false)}
        anchor="right"
        data-testid="categories-drawer"
      >
        <CategoriesDrawer
          toggleCategoriesDrawer={toggleCategoriesDrawer}
          categories={categories}
        />
      </Drawer>
      <Drawer
        open={openFilters}
        onClose={toggleFiltersDrawer(false)}
        anchor="right"
        ModalProps={{
          keepMounted: true,
        }}
        data-testid="filters-drawer"
      >
        <JdeDataFilters toggleFiltersDrawer={toggleFiltersDrawer} />
      </Drawer>
      <BulkChangeModal
        open={isBulkChangeModalOpen}
        onClose={() => setIsBulkChangeModalOpen(false)}
        currentStatus={selectedTags[0]?.equipmenT_STATUS || ""}
        onConfirm={handleBulkChangeConfirm}
      />
    </div>
  );
};
