import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState, useRef } from "react";

import {
  Box,
  Button,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Checkbox,
  Popover,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  TextField,
  IconButton,
} from "@mui/material";
import {
  KeyboardArrowDown,
  ArrowUpward,
  ArrowDownward,
  Clear,
} from "@mui/icons-material";

import {
  getFilterParams,
  setFilterParams,
  getSelectedCategory,
  getSelectedClass,
  getSelectedSubClass,
  setSelectedCategory,
  setSelectedClass,
  setSelectedSubClass,
  setCurrentPage,
} from "../../store/slices/mes-data/filterSlice";
import { displayCellLabel, displayCriticalily } from "../../utils";
import {
  setSelectedTags as setReduxSelectedTags,
  getSelectedTags,
} from "../../store/slices/mes-data/selectedTagsSlice";

import { TableLoader } from "../common/TableLoader";
import { NoDataFoundInTable } from "../common/NoDataFoundInTable";
import { VirtualizedAutocomplete } from "../common/VirtualizedAutocomplete";
import { MesDataHeader } from ".";
import { useMesData } from "../../hooks/useMesData";

import { TABLE_COLUMN_LABELS } from "../../constants/mes-data";

export const MesDataTable = ({
  rows,
  columns,
  loading,
  totalRows,
  rowsPerPage,
  currentPage,
  setRowsPerPage,
  toggleCategoriesDrawer,
  onSelectedTagsChange,
  selectedTags,
  setSelectedTags,
  isBulkChangeEnabled,
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { getFilteredColumnData } = useMesData();

  const tableRef = useRef(null);
  const topScrollbarRef = useRef(null);
  const [tableWidth, setTableWidth] = useState(750);

  // Scroll synchronization between top scrollbar and table
  useEffect(() => {
    const topScroll = topScrollbarRef.current;
    const bottomScroll = tableRef.current;

    const syncScroll = (source, target) => {
      const handleScroll = () => {
        if (target) {
          target.scrollLeft = source.scrollLeft;
        }
      };
      source.addEventListener("scroll", handleScroll);
      return handleScroll;
    };

    let topScrollHandler;
    let bottomScrollHandler;

    if (topScroll && bottomScroll) {
      topScrollHandler = syncScroll(topScroll, bottomScroll);
      bottomScrollHandler = syncScroll(bottomScroll, topScroll);
    }

    return () => {
      if (topScroll && topScrollHandler) {
        topScroll.removeEventListener("scroll", topScrollHandler);
      }
      if (bottomScroll && bottomScrollHandler) {
        bottomScroll.removeEventListener("scroll", bottomScrollHandler);
      }
    };
  }, []);

  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [currentFilterColumn, setCurrentFilterColumn] = useState(null);
  const [filterOperator, setFilterOperator] = useState("Equals");
  const [filterValue, setFilterValue] = useState("");
  const [filteredColumnData, setFilteredColumnData] = useState([]);
  const [loadingColumnData, setLoadingColumnData] = useState(false);

  const FILTER_OPERATORS = ["Equals", "Contains"];

  // Add sort handlers for filter popover
  const handleSortAscending = () => {
    if (!currentFilterColumn) return;

    dispatch(
      setFilterParams({
        ...filterParams,
        orderColumn: currentFilterColumn.id,
        orderType: "ASC",
      })
    );
    dispatch(setCurrentPage(0));
    handleFilterClose();
  };

  const handleSortDescending = () => {
    if (!currentFilterColumn) return;

    dispatch(
      setFilterParams({
        ...filterParams,
        orderColumn: currentFilterColumn.id,
        orderType: "DESC",
      })
    );
    dispatch(setCurrentPage(0));
    handleFilterClose();
  };

  const handleClearSort = () => {
    dispatch(
      setFilterParams({
        ...filterParams,
        orderColumn: "asseT_NUMBER_BK", // default value
        orderType: "ASC", // default value
      })
    );
    dispatch(setCurrentPage(0));
    handleFilterClose();
  };

  const selectedCategory = useSelector(getSelectedCategory);
  const selectedClass = useSelector(getSelectedClass);
  const selectedSubClass = useSelector(getSelectedSubClass);
  const persistedSelectedTags = useSelector(getSelectedTags);

  const filterParams = useSelector(getFilterParams);

  const handleFilterClick = async (event, column) => {
    event.stopPropagation();
    setFilterAnchorEl(event.currentTarget);
    setCurrentFilterColumn(column);

    const existingFilter = filterParams.FilteredColums?.find(
      (filter) => filter.ColumnName === column.id
    );

    if (existingFilter) {
      setFilterOperator(existingFilter.Operator);
      setFilterValue(existingFilter.Value);
    } else {
      setFilterOperator("Equals");
      setFilterValue("");
    }

    setLoadingColumnData(true);
    try {
      const existingFilters = (filterParams.FilteredColums || [])
        .filter((filter) => filter.ColumnName !== column.id)
        .map((filter) => ({
          columnName: filter.ColumnName,
          operator: filter.Operator,
          value: filter.Value,
        }));

      const payload = {
        columnName: column.id,
        areaCode: filterParams.AreaCode?.value || null,
        unitCode: filterParams.UnitCode?.value || null,
        filteredColums: existingFilters,
      };

      const data = await getFilteredColumnData(payload);

      const uniqueOptions = data.reduce((acc, item) => {
        const trimmedValue = typeof value === "string" ? item.trim() : item;
        if ([null, "", " ", "."].includes(trimmedValue)) {
          if (!acc.some((item) => item.value === "Empty")) {
            acc.push({ value: "Empty", label: "Empty" });
          }
        } else {
          acc.push({ value: String(item), label: String(item) });
        }
        return acc;
      }, []);
      setFilteredColumnData(uniqueOptions || []);
    } catch (error) {
      console.error("Error fetching filtered column data:", error);
      setFilteredColumnData([]);
    } finally {
      setLoadingColumnData(false);
    }
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
    setCurrentFilterColumn(null);
    setFilteredColumnData([]);
    setLoadingColumnData(false);
  };

  const handleApplyFilter = () => {
    if (!currentFilterColumn || !filterValue.trim()) return;

    const newFilter = {
      ColumnName: currentFilterColumn.id,
      Operator: filterOperator,
      Value: filterValue === "Empty" ? "__empty__" : filterValue,
    };

    const existingFilters = filterParams.FilteredColums || [];
    const filteredColums = existingFilters.filter(
      (filter) => filter.ColumnName !== currentFilterColumn.id
    );

    filteredColums.push(newFilter);

    dispatch(
      setFilterParams({
        ...filterParams,
        FilteredColums: filteredColums,
      })
    );
    dispatch(setCurrentPage(0));
    handleFilterClose();
  };

  const handleResetFilter = () => {
    if (!currentFilterColumn) return;

    const existingFilters = filterParams.FilteredColums || [];
    const filteredColums = existingFilters.filter(
      (filter) => filter.ColumnName !== currentFilterColumn.id
    );

    dispatch(
      setFilterParams({
        ...filterParams,
        FilteredColums: filteredColums,
      })
    );
    dispatch(setCurrentPage(0));
    handleFilterClose();
  };

  const handleLinkClick = (row) => {
    dispatch(setReduxSelectedTags(selectedTags));
    localStorage.setItem("assignEnrichmentTagPayload", JSON.stringify(row));
    localStorage.setItem("assignWalkdownTagPayload", JSON.stringify(row));
  };

  const handleRowDoubleClick = (row) => {
    handleLinkClick(row);
    navigate(`/mes-data/${row.asseT_NUMBER_PHK}`, {
      state: { from: window.location.pathname },
    });
  };

  useEffect(() => {
    if (persistedSelectedTags.length > 0) {
      setSelectedTags(persistedSelectedTags);
      onSelectedTagsChange(persistedSelectedTags);
    }
  }, [persistedSelectedTags, setSelectedTags, onSelectedTagsChange]);

  // Update table width when columns change
  useEffect(() => {
    const updateTableWidth = () => {
      if (tableRef.current) {
        const tableElement = tableRef.current.querySelector("table");
        if (tableElement) {
          setTableWidth(tableElement.scrollWidth);
        }
      }
    };

    // Update width when component mounts or columns change
    updateTableWidth();

    // Add resize observer to update width when table size changes
    const resizeObserver = new ResizeObserver(updateTableWidth);
    if (tableRef.current) {
      resizeObserver.observe(tableRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [columns, rows, isBulkChangeEnabled]);

  const handlePageChange = (_event, page) => {
    dispatch(setFilterParams({ ...filterParams, StartFrom: page }));
    dispatch(setCurrentPage(page));
  };

  const handleRowsPerPageChange = (event) => {
    const rowsPerPage = parseInt(event.target.value, 10);
    dispatch(setCurrentPage(0));
    setRowsPerPage(rowsPerPage);
    dispatch(setFilterParams({ ...filterParams, FetchRecord: rowsPerPage }));
    localStorage.setItem("mesRowsPerPage", rowsPerPage);
  };

  const displayTableHeader = (col) => {
    const hasFilter = filterParams.FilteredColums?.some(
      (filter) => filter.ColumnName === col.id
    );
    const hasSorting = filterParams.orderColumn === col.id;

    switch (col.id) {
      case "Description":
        return (
          <TableCell
            key={col.id}
            colSpan={2}
            width={col.width}
            sx={{
              display: "grid",
              flexGrow: 1,
              alignItems: "center",
              justifyContent: col.align,
            }}
            data-testid="description_header"
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {col.label}
              <IconButton
                size="small"
                sx={{ padding: 0.5, marginRight: 2, minWidth: "auto" }}
              >
                <KeyboardArrowDown
                  fontSize="small"
                  color={hasFilter || hasSorting ? "primary" : "action"}
                  onClick={(event) => handleFilterClick(event, col)}
                  data-testid="description_filter_icon"
                />
              </IconButton>
            </Box>
          </TableCell>
        );
      case "details":
        return (
          <TableCell
            key={col.id}
            width={col.width}
            sx={{
              display: "grid",
              flexGrow: 1,
              alignItems: "center",
              justifyContent: col.align,
            }}
            data-testid="details_header"
          >
            {col.label}
          </TableCell>
        );
      default:
        return (
          <TableCell
            key={col.id}
            width={col.width}
            sx={{
              display: "grid",
              flexGrow: 1,
              alignItems: "center",
              justifyContent: col.align,
            }}
            data-testid={`${col.id}_header`}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {col.label}
              <IconButton
                size="small"
                sx={{ padding: 0.5, marginRight: 2, minWidth: "auto" }}
              >
                <KeyboardArrowDown
                  fontSize="small"
                  color={hasFilter || hasSorting ? "primary" : "action"}
                  onClick={(event) => handleFilterClick(event, col)}
                  data-testid={`${col.id}_filter_icon`}
                />
              </IconButton>
            </Box>
          </TableCell>
        );
    }
  };

  const displayTableCell = (col, row, index) => {
    switch (col.id) {
      case "equipmenT_TAG_DESCRIPTION":
        return (
          <TableCell
            colSpan={2}
            key={col.id}
            align={col.align}
            width={col.width}
            sx={{
              display: "grid",
              flexGrow: 1,
              alignItems: "center",
              minWidth: 180,
              userSelect: "text",
            }}
            data-testid="description_cell"
          >
            <div className="flex flex-col">
              <span>{displayCellLabel(row.equipmenT_TAG_DESCRIPTION)}</span>
            </div>
          </TableCell>
        );
      case "equipmenT_TAG_DESCRIPTION_RU":
        return (
          <TableCell
            colSpan={2}
            key={col.id}
            align={col.align}
            width={col.width}
            sx={{
              display: "grid",
              flexGrow: 1,
              alignItems: "center",
              minWidth: 180,
              userSelect: "text",
            }}
            data-testid="description_ru_cell"
          >
            <div className="flex flex-col">
              <span>{displayCellLabel(row.equipmenT_TAG_DESCRIPTION_RU)}</span>
            </div>
          </TableCell>
        );
      case "aC_RANKING":
      case "eC_RANKING":
        return (
          <TableCell
            key={col.id}
            align={col.align}
            width={col.width}
            sx={{
              display: "grid",
              flexGrow: 1,
              alignItems: "center",
              userSelect: "text",
            }}
            data-testid={`${col.id}_cell`}
          >
            {displayCriticalily(row[col.id])}
          </TableCell>
        );
      case "equipmenT_TAG":
        return (
          <TableCell
            key={col.id}
            align={col.align}
            width={col.width}
            sx={{
              display: "grid",
              flexGrow: 1,
              alignItems: "center",
              wordBreak: "break-all",
              userSelect: "text",
            }}
            data-testid={`${col.id}_cell`}
          >
            <Link
              to={`/mes-data/${row.asseT_NUMBER_PHK}`}
              state={{ from: window.location.pathname }}
              onClick={() => handleLinkClick(row)}
              className="no-underline text-blue-600 font-medium text-sm"
              data-testid={`equipmenT_TAG_link_${index}`}
            >
              {row.equipmenT_TAG}
            </Link>
          </TableCell>
        );
      case "details":
        return (
          <TableCell
            key={col.id}
            align={col.align}
            width={col.width}
            sx={{ display: "grid", flexGrow: 1, alignItems: "center" }}
            data-testid="details_cell"
          >
            <Link
              data-testid={`view_more_btn_${index}`}
              to={`/mes-data/${row.equipmenT_TAG}`}
              state={{ from: window.location.pathname }}
              onClick={(event) => {
                event.stopPropagation(); // Prevent row click
                handleLinkClick(row);
              }}
              className="no-underline text-blue-600 font-medium text-sm uppercase px-4 py-1.5 rounded inline-block transition-colors duration-250 ease-out hover:bg-blue-50"
            >
              View More
            </Link>
          </TableCell>
        );
      default:
        return (
          <TableCell
            key={col.id}
            align={col.align}
            width={col.width}
            sx={{
              display: "grid",
              flexGrow: 1,
              alignItems: "center",
              wordBreak: "break-all",
            }}
          >
            {displayCellLabel(row[col.id])}
          </TableCell>
        );
    }
  };

  const handleRemoveFilter = (value = {}) => {
    let searchIncluded = "";
    if (filterParams.Search) {
      const search = {
        ColumnName: "equipmenT_TAG",
        Operator: "Contains",
        Value: filterParams.Search,
      };
      searchIncluded = filterParams.FilteredColums.find(
        (filterValue) => JSON.stringify(filterValue) === JSON.stringify(search)
      );
    }
    const filteredColums = filterParams.FilteredColums.filter(
      (item) => JSON.stringify(item) !== JSON.stringify(value)
    );
    dispatch(
      setFilterParams({
        ...filterParams,
        Search: searchIncluded ? undefined : filterParams.Search,
        FilteredColums: filteredColums,
      })
    );
    dispatch(setCurrentPage(0));
  };

  const handleDeleteSelectedCategory = () => {
    dispatch(
      setFilterParams({
        ...filterParams,
        CategoryId: undefined,
        ClassId: undefined,
        SubClassId: undefined,
      })
    );
    dispatch(setSelectedCategory(undefined));
    dispatch(setSelectedClass(undefined));
    dispatch(setSelectedSubClass(undefined));
  };

  const displaySelectedCategory = () => {
    const label = selectedCategory.label;
    if (label) {
      return (
        <Chip
          label={label}
          color="primary"
          variant="outlined"
          onDelete={handleDeleteSelectedCategory}
        />
      );
    }
  };

  const handleDeleteSelectedClass = () => {
    dispatch(
      setFilterParams({
        ...filterParams,
        ClassId: undefined,
        SubClassId: undefined,
      })
    );
    dispatch(setSelectedClass(undefined));
    dispatch(setSelectedSubClass(undefined));
  };

  const displaySelectedClass = () => {
    const label = selectedClass.label;
    if (label) {
      return (
        <Chip
          label={label}
          color="primary"
          variant="outlined"
          onDelete={handleDeleteSelectedClass}
        />
      );
    }
  };

  const handleDeleteSelectedSubClass = () => {
    dispatch(
      setFilterParams({
        ...filterParams,
        SubClassId: undefined,
      })
    );
    dispatch(setSelectedSubClass(undefined));
  };

  const displaySelectedSubClass = () => {
    const label = selectedSubClass.label;
    if (label) {
      return (
        <Chip
          label={label}
          color="primary"
          variant="outlined"
          onDelete={handleDeleteSelectedSubClass}
        />
      );
    }
  };

  const displayCategoriesGroup = () => {
    return !displaySelectedClass() && !displaySelectedSubClass() ? (
      displaySelectedCategory()
    ) : (
      <div
        className="flex p-[4px] rounded-3xl border border-dashed border-blue-400 gap-4"
        data-testid="categories_group"
      >
        {displaySelectedCategory()}
        {displaySelectedClass()}
        {displaySelectedSubClass()}
      </div>
    );
  };

  const handleDeleteAreaCode = () => {
    dispatch(
      setFilterParams({
        ...filterParams,
        AreaCode: { label: "", value: "" },
        UnitCode: { label: "", value: "" },
      })
    );
  };

  const displayArea = () => {
    if (filterParams.AreaCode.label) {
      return (
        <Chip
          label={filterParams.AreaCode.label}
          color="primary"
          variant="outlined"
          onDelete={handleDeleteAreaCode}
        />
      );
    }
  };

  const handleDeleteUnitCode = () => {
    dispatch(
      setFilterParams({
        ...filterParams,
        UnitCode: { label: "", value: "" },
      })
    );
  };

  const displayUnit = () => {
    if (filterParams.UnitCode.label) {
      return (
        <Chip
          label={filterParams.UnitCode.label}
          color="primary"
          variant="outlined"
          onDelete={handleDeleteUnitCode}
        />
      );
    }
  };

  const displayAreaAndUnitGroup = () => {
    return !displayUnit() ? (
      displayArea()
    ) : (
      <div className="flex p-[4px] rounded-3xl border border-dashed border-blue-400 gap-4">
        {displayArea()}
        {displayUnit()}
      </div>
    );
  };

  const parseFilteredColums = (filters) => {
    const filterChips = filters.map((item) => {
      const { ColumnName, Operator, Value } = item;
      const valueLabel =
        Value === "" || Value === "__empty__"
          ? "Empty"
          : Value === "." && ColumnName !== "equipmenT_TAG"
          ? "Blank"
          : Value;
      return {
        label: `${TABLE_COLUMN_LABELS[ColumnName]}  ${Operator}  ${valueLabel}`,
        filterValue: { ColumnName, Operator, Value },
      };
    });
    return filterChips;
  };

  const displayFilterByColumnLabel = () => {
    if (filterParams.FilteredColums) {
      const chips = parseFilteredColums(filterParams.FilteredColums);
      return chips.map(({ label, filterValue }) => (
        <Chip
          key={label}
          label={label}
          color="primary"
          variant="outlined"
          onDelete={() => handleRemoveFilter(filterValue)}
        />
      ));
    }
  };

  const handleSelectAll = () => {
    if (areAllCurrentPageItemsSelected()) {
      const currentPageTags = rows.map((row) => row.equipmenT_TAG);
      const newSelectedTags = selectedTags.filter(
        (tag) => !currentPageTags.includes(tag.equipmenT_TAG)
      );
      setSelectedTags(newSelectedTags);
      onSelectedTagsChange(newSelectedTags);
    } else {
      const currentPageTagObjects = rows.map((row) => ({
        equipmenT_TAG: row.equipmenT_TAG,
        asseT_NUMBER_PHK: row.asseT_NUMBER_PHK,
        equipmenT_STATUS: row.equipmenT_STATUS,
        equipmenT_STATUS_FHK: row.equipmenT_STATUS_FHK,
      }));
      const newSelectedTags = [...selectedTags];
      currentPageTagObjects.forEach((tagObject) => {
        if (
          !selectedTags.some(
            (tag) => tag.equipmenT_TAG === tagObject.equipmenT_TAG
          )
        ) {
          newSelectedTags.push(tagObject);
        }
      });
      setSelectedTags(newSelectedTags);
      onSelectedTagsChange(newSelectedTags);
    }
  };

  const handleSelectTag = (row) => {
    setSelectedTags((prevSelectedTags) => {
      const tagObject = {
        equipmenT_TAG: row.equipmenT_TAG,
        asseT_NUMBER_PHK: row.asseT_NUMBER_PHK,
        equipmenT_STATUS: row.equipmenT_STATUS,
        equipmenT_STATUS_FHK: row.equipmenT_STATUS_FHK,
      };

      const newSelectedTags = prevSelectedTags.some(
        (tag) => tag.equipmenT_TAG === row.equipmenT_TAG
      )
        ? prevSelectedTags.filter(
            (tag) => tag.equipmenT_TAG !== row.equipmenT_TAG
          )
        : [...prevSelectedTags, tagObject];

      dispatch(setReduxSelectedTags(newSelectedTags));
      onSelectedTagsChange(newSelectedTags);
      return newSelectedTags;
    });
  };

  const areAllCurrentPageItemsSelected = () => {
    const currentPageTags = rows.map((row) => row.equipmenT_TAG);
    if (!currentPageTags.length) return false;
    return currentPageTags.every((tag) =>
      selectedTags.some((selected) => selected.equipmenT_TAG === tag)
    );
  };

  const isCurrentPageSelected = areAllCurrentPageItemsSelected();

  return (
    <Box sx={{ width: "100%" }} data-testid="mes_data_table">
      <Paper
        sx={{ width: "100%", mb: 2, p: 0 }}
        elevation={0}
        variant="outlined"
        data-testid="table_paper"
      >
        <Box
          sx={{
            position: "sticky",
            top: 0,
            zIndex: 10,
            backgroundColor: "white",
            borderBottom: "1px solid",
            borderColor: "divider",
            paddingBottom: "8px",
          }}
          data-testid="table_header_section"
        >
          <MesDataHeader
            toggleCategoriesDrawer={toggleCategoriesDrawer}
            loading={loading}
          />

          <Box
            className="flex items-center gap-4 pl-[24px] w-full h-auto flex-wrap"
            data-testid="filter_chips_container"
          >
            {selectedTags.length > 0 && (
              <Chip
                label={`${selectedTags.length} ${
                  selectedTags.length > 1 ? "tags are" : "tag is"
                } selected`}
                color="primary"
                variant="outlined"
                onDelete={() => setSelectedTags([])}
                data-testid="selected_tags_chip"
              />
            )}
            {displayFilterByColumnLabel()}
            {displayAreaAndUnitGroup()}
            {displayCategoriesGroup()}
          </Box>
        </Box>
        <TablePagination
          rowsPerPageOptions={[25, 50, 100]}
          component="div"
          count={totalRows}
          rowsPerPage={rowsPerPage}
          page={currentPage || 0}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          showFirstButton
          showLastButton
          sx={{
            borderBottom: "1px solid",
            borderColor: "divider",
            "& .MuiTablePagination-toolbar": {
              minHeight: "40px",
              paddingLeft: "8px",
              paddingRight: "8px",
            },
            "& .MuiTablePagination-select": {
              paddingTop: "0px",
              paddingBottom: "0px",
            },
          }}
          data-testid="table_pagination"
        />
        {/* Top horizontal scrollbar */}
        <Box
          ref={topScrollbarRef}
          sx={{
            overflowX: "auto",
            overflowY: "hidden",
            borderBottom: "1px solid",
            borderColor: "divider",
            height: "17px",
          }}
          data-testid="top_scrollbar_container"
        >
          <Box
            sx={{
              height: "1px",
              width: `${tableWidth}px`,
              minWidth: "750px",
            }}
          />
        </Box>

        <Box
          sx={{
            maxHeight: "calc(100vh - 200px)",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <TableContainer
            ref={tableRef}
            sx={{
              maxHeight: "calc(100vh - 200px + 20px)",
              overflowX: "auto",
              overflowY: "auto",
              paddingBottom: "20px",
              marginBottom: "-20px",
            }}
            data-testid="table_container"
          >
            <Table
              sx={{ minWidth: 750 }}
              aria-labelledby="tableTitle"
              size="small"
              data-testid="data_table"
            >
              <TableHead
                sx={{
                  position: "sticky",
                  top: 0,
                  zIndex: 5,
                  backgroundColor: "white",
                  "& .MuiTableCell-head": {
                    backgroundColor: "white",
                  },
                }}
                data-testid="table_header"
              >
                <TableRow
                  sx={{ display: "flex" }}
                  data-testid="table_header_row"
                >
                  {isBulkChangeEnabled && (
                    <TableCell
                      padding="checkbox"
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      data-testid="select_all_checkbox_cell"
                    >
                      <Checkbox
                        checked={isCurrentPageSelected}
                        onChange={handleSelectAll}
                        disabled={loading}
                        sx={{ width: "40px", height: "40px" }}
                        data-testid="select_all_checkbox"
                      />
                    </TableCell>
                  )}
                  {columns
                    .filter((col) => col.isChecked)
                    .map(displayTableHeader)}
                </TableRow>
              </TableHead>
              {loading ? (
                <TableLoader colSpan={columns.length} />
              ) : (
                <>
                  {!rows.length && !loading && (
                    <NoDataFoundInTable
                      label="No tags found"
                      colSpan={columns.length}
                    />
                  )}
                  <TableBody data-testid="table_body">
                    {rows.map((row, index) => {
                      return (
                        <TableRow
                          tabIndex={-1}
                          key={row.id}
                          sx={{
                            display: "flex",
                            cursor: "pointer",
                            "&:hover": {
                              backgroundColor: "rgba(0, 0, 0, 0.04)",
                            },
                          }}
                          data-testid={`table_row_${index}`}
                          onDoubleClick={() => handleRowDoubleClick(row)}
                        >
                          {isBulkChangeEnabled && (
                            <TableCell
                              padding="checkbox"
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                              data-testid={`select_checkbox_cell_${index}`}
                            >
                              <Checkbox
                                checked={selectedTags.some(
                                  (tag) =>
                                    tag.equipmenT_TAG === row.equipmenT_TAG
                                )}
                                onChange={() => handleSelectTag(row)}
                                disabled={loading}
                                sx={{ width: "40px", height: "40px" }}
                                data-testid={`select_checkbox_${index}`}
                              />
                            </TableCell>
                          )}
                          {columns
                            .filter((col) => col.isChecked)
                            .map((col) => displayTableCell(col, row, index))}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </>
              )}
            </Table>
          </TableContainer>
        </Box>
      </Paper>

      {/* Filter Dropdown Popover */}
      <Popover
        open={Boolean(filterAnchorEl)}
        anchorEl={filterAnchorEl}
        onClose={handleFilterClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        PaperProps={{
          sx: {
            maxHeight: "none",
            overflow: "visible",
          },
        }}
        sx={{
          "& .MuiPopover-paper": {
            overflow: "visible",
          },
        }}
        data-testid="filter_popover"
      >
        <Box sx={{ p: 2, minWidth: 300 }} data-testid="filter_popover_content">
          {/* Sort Section */}
          <Box sx={{ mb: 2 }}>
            <Box
              sx={{
                mb: 1,
                fontWeight: "bold",
                fontSize: "14px",
                color: "text.secondary",
              }}
            >
              Sort
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Button
                variant="text"
                size="small"
                onClick={handleSortAscending}
                sx={{
                  justifyContent: "flex-start",
                  textTransform: "none",
                  color:
                    filterParams.orderColumn === currentFilterColumn?.id &&
                    filterParams.orderType === "ASC"
                      ? "primary.main"
                      : "text.primary",
                }}
                data-testid="sort_ascending_btn"
                startIcon={<ArrowUpward />}
              >
                Sort Ascending
              </Button>
              <Button
                variant="text"
                size="small"
                onClick={handleSortDescending}
                sx={{
                  justifyContent: "flex-start",
                  textTransform: "none",
                  color:
                    filterParams.orderColumn === currentFilterColumn?.id &&
                    filterParams.orderType === "DESC"
                      ? "primary.main"
                      : "text.primary",
                }}
                data-testid="sort_descending_btn"
                startIcon={<ArrowDownward />}
              >
                Sort Descending
              </Button>
              <Button
                variant="text"
                size="small"
                onClick={handleClearSort}
                sx={{
                  justifyContent: "flex-start",
                  textTransform: "none",
                  color: "text.secondary",
                }}
                data-testid="clear_sort_btn"
                startIcon={<Clear />}
              >
                Clear Sort
              </Button>
            </Box>
          </Box>

          {/* Filter Section */}
          <Box data-testid="filter_section">
            <Box
              sx={{
                mb: 1,
                fontWeight: "bold",
                fontSize: "14px",
                color: "text.secondary",
              }}
            >
              Filter
            </Box>

            <FormControl fullWidth margin="dense">
              <InputLabel>Operator</InputLabel>
              <Select
                value={filterOperator}
                onChange={(e) => setFilterOperator(e.target.value)}
                label="Operator"
                size="small"
                data-testid="filter_operator_select"
              >
                {FILTER_OPERATORS.map((operator) => (
                  <MenuItem
                    key={operator}
                    value={operator}
                    data-testid={`operator_${operator}`}
                  >
                    {operator}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <VirtualizedAutocomplete
              filterId={currentFilterColumn?.id}
              size="small"
              disablePortal
              width={265}
              value={filterValue ? filterValue : null}
              options={filteredColumnData}
              label="Value"
              renderInput={(params) => (
                <TextField
                  {...params}
                  required
                  error={!filterValue.trim()}
                  helperText={!filterValue.trim() ? "Value is required" : ""}
                  data-testid="filter_value_input"
                />
              )}
              loading={loadingColumnData}
              loadingText={loadingColumnData ? "Fetching data..." : ""}
              onChange={(event, newValue) => {
                if (newValue && typeof newValue === "object") {
                  setFilterValue(newValue.value || newValue.label || "");
                } else {
                  setFilterValue(newValue || "");
                }
              }}
              onInputChange={(event, newInputValue) => {
                setFilterValue(newInputValue);
              }}
              isReset={false}
              freeSolo
              disabled={!currentFilterColumn}
            />

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                gap: 1,
                mt: 2,
              }}
            >
              <Button
                variant="text"
                onClick={handleFilterClose}
                size="small"
                data-testid="close_filter_btn"
              >
                Close
              </Button>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  variant="outlined"
                  onClick={handleResetFilter}
                  size="small"
                  data-testid="reset_filter_btn"
                >
                  Reset
                </Button>
                <Button
                  variant="contained"
                  onClick={handleApplyFilter}
                  size="small"
                  disabled={!filterValue.trim()}
                  data-testid="apply_filter_btn"
                >
                  Apply
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      </Popover>
    </Box>
  );
};
