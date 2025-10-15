import {
  Badge,
  Button,
  Checkbox,
  CircularProgress,
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Popover,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import {
  ASSIGN_TAGS_TABLE_COLUMNS,
  FILTER_CRITERIA_FIELDS,
  NOT_ASSIGNED_TAGS_FIELDS,
  SPECIAL_FILTER_FIELDS,
} from "../../constants/walkdown-management";
import { Fragment, useCallback, useState, useEffect } from "react";
import { List as VirtualizedList, AutoSizer } from "react-virtualized";
import { FilterList as FilterListIcon } from "@mui/icons-material";

import {
  setFilterParams,
  getFilterParams,
  setCurrentPage,
  getFilterByColumn,
  setFilterByColumn,
  getFilterCriteria,
  getFilteredUnitCodes,
  setFilteredUnitCodes,
} from "../../store/slices/walkdown-management/notAssignedTagsSlice";
import { useDispatch, useSelector } from "react-redux";
import { useWalkdownManagement } from "../../hooks/useWalkdownManagement";
import { debounce, unitCodesGrouppedByArea } from "../../utils";
import { useJdeData } from "../../hooks/useJdeDataHook";

const onlyFHKValueAcceptedFields = [
  "areaCodeId",
  "unitCodeId",
  "equipmentStatusId",
];

const specialFields = [
  "acRanking",
  "icRanking",
  "equipmentStatusName",
  "ecRanking",
];
const areaAndUnitFields = ["areaName", "unitCode"];

export const NotScheduledTagsTable = ({
  selectedTags,
  setSelectedTags,
  notScheduled,
  pending,
  setAssignTagsPerPage,
  assignTagsCurrentPage,
  assignTagsPerPage,
  notAssignedTagsCount,
}) => {
  const dispatch = useDispatch();
  const filterParams = useSelector(getFilterParams);
  const filterByColumnParams = useSelector(getFilterByColumn);
  const filterCriteria = useSelector(getFilterCriteria);
  const filteredUnitCodes = useSelector(getFilteredUnitCodes);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  const [filterColumn, setFilterColumn] = useState("");
  const COLUMN_NAME = NOT_ASSIGNED_TAGS_FIELDS[filterColumn];

  const [isFilterResultLoading, setIsFilterResultLoading] = useState(false);

  const [filters, setFilters] = useState({
    equipmentTag: [],
    parentEquipmentTag: [],
    areaCodeId: [],
    unitCodeId: [],
    acRanking: [],
    icRanking: [],
    ecRanking: [],
    piD: [],
    equipmentStatusId: [],
  });

  const [columnSearchValue, setColumnSearchValue] = useState({
    equipmentTag: "",
    parentEquipmentTag: "",
    areaName: "",
    unitCode: "",
    acRanking: "",
    icRanking: "",
    ecRanking: "",
    piD: "",
    equipmentStatusName: "",
  });

  const [columnSearchCriteria, setColumnSearchCriteria] = useState({
    equipmentTag: "",
    parentEquipmentTag: "",
    areaName: "",
    unitCode: "",
    acRanking: "",
    icRanking: "",
    ecRanking: "",
    piD: "",
    equipmentStatusName: "",
  });

  const [filterResultOfColumn, setFilterResultOfColumn] = useState({
    equipmentTag: [],
    parentEquipmentTag: [],
    areaName: [],
    unitCode: [],
    acRanking: [],
    icRanking: [],
    ecRanking: [],
    piD: [],
    equipmentStatusName: [],
  });

  const [unitCodesByArea, setUnitCodesByArea] = useState({});

  const { getEquipmentDataFilteredByColumn } = useWalkdownManagement();
  const { getElementsByColumn, getAreaAndUnitCodes } = useJdeData();

  useEffect(() => {
    let isMounted = true;
    const fetchRows = () => {
      setIsFilterResultLoading(true);
      getAreaAndUnitCodes()
        .then((response) => {
          setIsFilterResultLoading(false);
          if (isMounted && response) {
            const unitCodesGroup = unitCodesGrouppedByArea(response);
            setUnitCodesByArea(unitCodesGroup);
            const areaNames = [
              ...new Set(
                response.map((item) =>
                  JSON.stringify({
                    key: item.areaCodePhk,
                    value: item.areaCode,
                  })
                )
              ),
            ]
              .map((item) => JSON.parse(item))
              .sort((a, b) => a.value.localeCompare(b.value));

            const unitCodes = [
              ...new Set(
                response.map((item) =>
                  JSON.stringify({
                    key: item.unitCodePhk,
                    value: `${item.unitCode} ${item.unitName}`,
                  })
                )
              ),
            ]
              .map((item) => JSON.parse(item))
              .sort((a, b) => a.value.localeCompare(b.value));

            setFilterResultOfColumn((prev) => ({
              ...prev,
              areaName: areaNames,
              unitCode: filteredUnitCodes.length
                ? filteredUnitCodes
                : unitCodes,
            }));
          }
        })
        .finally(() => {
          setIsFilterResultLoading(false);
        });
    };
    fetchRows();
    return () => {
      isMounted = false;
    };
  }, [getAreaAndUnitCodes]);

  const filteredRows = notScheduled.filter((row) => {
    return Object.keys(filters).every((key) => {
      if (filters[key].length === 0) {
        return true;
      }
      return filters[key].includes(row[NOT_ASSIGNED_TAGS_FIELDS[key]]);
    });
  });

  const areAllCurrentPageItemsSelected = () => {
    const currentPageTags = filteredRows.map((item) => item.assetNumberPhk);
    if (!currentPageTags.length) return false;
    return currentPageTags.every((tag) => selectedTags.includes(tag));
  };

  const isCurrentPageSelected = areAllCurrentPageItemsSelected();

  const handleSelectAll = () => {
    if (isCurrentPageSelected) {
      const currentPageTags = filteredRows.map((item) => item.assetNumberPhk);
      setSelectedTags((prev) =>
        prev.filter((tag) => !currentPageTags.includes(tag))
      );
    } else {
      const currentPageTags = filteredRows.map((item) => item.assetNumberPhk);
      setSelectedTags((prev) => [...new Set([...prev, ...currentPageTags])]);
    }
  };

  const handleSelectTag = (value) => {
    setSelectedTags((selectedTags) => {
      if (selectedTags.includes(value)) {
        return selectedTags.filter((item) => item !== value);
      } else {
        return [...selectedTags, value];
      }
    });
  };

  const getFormattedCriteria = (column) => {
    const hasFilterCriteria = Boolean(filterCriteria);
    const hasColumnCriteria = Boolean(columnSearchCriteria[column]);

    if (!hasFilterCriteria && !hasColumnCriteria) return "";

    return [
      hasFilterCriteria && filterCriteria,
      hasColumnCriteria && columnSearchCriteria[column],
    ]
      .filter(Boolean)
      .join(";");
  };

  const fetchFilteredData = async (column) => {
    if (!column) return;
    setIsFilterResultLoading(true);
    if (specialFields.includes(column)) {
      try {
        const data = await getElementsByColumn(SPECIAL_FILTER_FIELDS[column]);
        setFilterResultOfColumn((prev) => ({
          ...prev,
          [column]: data.reduce((acc, { key, value }) => {
            const trimmedValue =
              typeof value === "string" ? value.trim() : value;
            if ([null, "", " ", "."].includes(trimmedValue)) {
              if (!acc.some((item) => item.value === "Empty")) {
                acc.push({ value: "Empty", key: "Empty" });
              }
            } else {
              acc.push({ key, value });
            }
            return acc;
          }, []),
        }));
      } finally {
        setIsFilterResultLoading(false);
      }
    } else {
      const columnName = NOT_ASSIGNED_TAGS_FIELDS[column];
      try {
        const data = await getEquipmentDataFilteredByColumn({
          filterParams: filterByColumnParams,
          columnName,
          filterCriteria: getFormattedCriteria(column),
        });
        setFilterResultOfColumn((prev) => ({
          ...prev,
          [column]: data.reduce((acc, { key, value }) => {
            const trimmedValue =
              typeof value === "string" ? value.trim() : value;
            if ([null, "", " ", "."].includes(trimmedValue)) {
              if (!acc.some((item) => item.value === "Empty")) {
                acc.push({ value: "Empty", key: "Empty" });
              }
            } else {
              acc.push({ key, value });
            }
            return acc;
          }, []),
        }));
      } finally {
        setIsFilterResultLoading(false);
      }
    }
  };

  const handleFilterClick = (event, column) => {
    setAnchorEl(event.currentTarget);
    setFilterColumn(column);
    if (areaAndUnitFields.includes(column)) return;
    fetchFilteredData(column);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setFilterColumn("");
  };

  const getColumnValue = (item) => {
    if (onlyFHKValueAcceptedFields.includes(COLUMN_NAME)) {
      return item.key;
    }
    return item.value;
  };

  const handleCheckboxChange = (event, item) => {
    const value = getColumnValue(item);
    setFilters((prev) => {
      const newFilters = { ...prev };
      if (event.target.checked) {
        newFilters[COLUMN_NAME].push(value);
      } else {
        newFilters[COLUMN_NAME] = newFilters[COLUMN_NAME].filter(
          (existingValue) => existingValue !== value
        );
      }
      return newFilters;
    });
  };

  const debouncedSetSearchCriteria = useCallback(
    debounce((column, formattedValue) => {
      setColumnSearchCriteria((prev) => ({
        ...prev,
        [column]: formattedValue,
      }));
    }, 800),
    []
  );

  const handleColumnSearchValue = (event, column) => {
    const searchValue = event.target.value;
    setColumnSearchValue({
      ...columnSearchValue,
      [column]: searchValue,
    });

    const formattedValue = searchValue
      ? `${FILTER_CRITERIA_FIELDS[column]},${searchValue}`
      : "";
    debouncedSetSearchCriteria(column, formattedValue);
  };

  const resetFilter = () => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      newFilters[COLUMN_NAME] = [];
      return newFilters;
    });
    setColumnSearchValue({
      ...columnSearchValue,
      [filterColumn]: "",
    });
    setColumnSearchCriteria((prev) => ({
      ...prev,
      [filterColumn]: "",
    }));
    const column = NOT_ASSIGNED_TAGS_FIELDS[filterColumn];
    dispatch(setFilterByColumn({ column, newFilters: [] }));
    dispatch(setFilteredUnitCodes([]));
  };

  const handlePageChange = (_event, page) => {
    dispatch(setFilterParams({ ...filterParams, startFrom: page }));
    dispatch(setCurrentPage(page));
  };

  const handleRowsPerPageChange = (event) => {
    const rowsPerPage = parseInt(event.target.value, 10);
    dispatch(setCurrentPage(0));
    setAssignTagsPerPage(rowsPerPage);
    dispatch(setFilterParams({ ...filterParams, fetchRecord: rowsPerPage }));
  };

  const isFilterItemChecked = (item) => {
    const isAcceptsFKHValue = onlyFHKValueAcceptedFields.includes(COLUMN_NAME);

    if (isAcceptsFKHValue) {
      return filters[COLUMN_NAME].includes(item.key);
    }
    return filters[COLUMN_NAME].includes(item.value);
  };

  const applyFilteredUnitCodes = (newFilters) => {
    const unitCodesObj = Object.values(unitCodesByArea).filter(
      ({ areaCodePhk }) => newFilters.includes(areaCodePhk)
    );
    const unitCodes = unitCodesObj
      .map((area) => area.unitCodes)
      .flat()
      .map((item) => ({ key: item.value, value: item.label }));

    dispatch(setFilteredUnitCodes(unitCodes));

    setFilterResultOfColumn((prev) => ({
      ...prev,
      unitCode: unitCodes,
    }));
  };

  const applyFilter = () => {
    const column = NOT_ASSIGNED_TAGS_FIELDS[filterColumn];
    const newFilters = filters[COLUMN_NAME];
    dispatch(setFilterByColumn({ column, newFilters }));

    if (COLUMN_NAME === "areaCodeId") {
      applyFilteredUnitCodes(newFilters);
    }

    handleClose();
  };

  useEffect(() => {
    if (areaAndUnitFields.includes(filterColumn)) return;
    if (filterColumn) {
      fetchFilteredData(filterColumn);
    }
  }, [columnSearchCriteria[filterColumn]]);

  const RowRenderer = ({ key, index, style }) => {
    const item = filterResultOfColumn[filterColumn][index];

    const customStyle = {
      ...style,
      display: "flex",
      alignItems: "center",
      padding: "2px 8px",
      fontSize: "12px",
      backgroundColor: index % 2 === 0 ? "#f5f5f5" : "#ffffff",
      "&:hover": {
        backgroundColor: "#f0f0f0",
      },
      borderBottom: "1px solid #eee",
    };

    return (
      <ListItem key={key} style={customStyle} data-testid="filter-item">
        <ListItemIcon style={{ minWidth: "32px" }}>
          <Checkbox
            size="small"
            edge="start"
            checked={isFilterItemChecked(item)}
            tabIndex={-1}
            disableRipple
            inputProps={{ "aria-labelledby": item.value }}
            onChange={(e) => handleCheckboxChange(e, item)}
            data-testid="filter-item-checkbox"
          />
        </ListItemIcon>
        <ListItemText
          id={item.value}
          primary={item.value}
          primaryTypographyProps={{
            style: {
              fontSize: "12px",
              margin: "0",
            },
          }}
          data-testid="filter-item-text"
        />
      </ListItem>
    );
  };

  return (
    <Paper
      sx={{
        width: "100%",
        overflowX: "auto",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
      data-testid="not-scheduled-tags-table"
      elevation={0}
      variant="outlined"
    >
      <TableContainer sx={{ height: "90%" }} data-testid="table-container">
        <Table
          stickyHeader
          aria-labelledby="tableTitle"
          size="small"
          data-testid="table"
        >
          <TableHead data-testid="table-head">
            <TableRow>
              {ASSIGN_TAGS_TABLE_COLUMNS.map((col) => (
                <TableCell width={col.width} key={col.id}>
                  {col.id === "checkbox" ? (
                    <Checkbox
                      onChange={handleSelectAll}
                      checked={isCurrentPageSelected}
                      disabled={pending}
                      data-testid="select-all-checkbox"
                    />
                  ) : (
                    <div className="flex items-center">
                      <div className="text-xs">{col.label}</div>
                      <Badge
                        color="error"
                        variant="dot"
                        invisible={
                          !filterByColumnParams[
                            NOT_ASSIGNED_TAGS_FIELDS[col.id]
                          ]?.length
                        }
                        data-testid="filter-badge"
                      >
                        <IconButton
                          onClick={(e) => handleFilterClick(e, col.id)}
                        >
                          <FilterListIcon sx={{ width: 14, height: 14 }} />
                        </IconButton>
                      </Badge>
                    </div>
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          {!notScheduled.length && (
            <TableBody>
              <TableRow>
                <TableCell colSpan={5}>
                  <div className="flex items-center justify-center w-full h-full min-h-[190px]">
                    <Typography
                      fontSize={14}
                      className="text-black/[0.5]"
                      data-testid="no-data-text"
                    >
                      Data not found
                    </Typography>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          )}
          <TableBody>
            {notScheduled.map((row) => {
              return (
                <TableRow key={row.equipmentTag} tabIndex={-1}>
                  {ASSIGN_TAGS_TABLE_COLUMNS.map((col) => {
                    return (
                      <Fragment key={col.id}>
                        {col.id === "checkbox" ? (
                          <TableCell width={col.width}>
                            <Checkbox
                              checked={selectedTags.includes(
                                row.assetNumberPhk
                              )}
                              onChange={() =>
                                handleSelectTag(row.assetNumberPhk)
                              }
                              disabled={pending}
                              data-testid={`select-row-checkbox-${row.assetNumberPhk}`}
                            />
                          </TableCell>
                        ) : (
                          <TableCell width={col.width}>
                            {col.id === "label" ? (
                              <span
                                className="text-sm font-roboto font-bold leading-4"
                                data-testid={`row-${row.assetNumberPhk}-${col.id}`}
                              >
                                {row[col.id]}
                              </span>
                            ) : (
                              <div
                                className="text-xs"
                                data-testid={`row-${row.assetNumberPhk}-${col.id}`}
                              >
                                {row[col.id]}
                              </div>
                            )}
                          </TableCell>
                        )}
                      </Fragment>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <Popover
          id={id}
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          transformOrigin={{ vertical: "top", horizontal: "left" }}
          slotProps={{
            paper: {
              style: {
                maxHeight: 450,
                width: "250px",
                overflow: "hidden",
              },
              className: "no-scrollbar",
            },
          }}
          data-testid="filter-popover"
        >
          <div className="mt-1 sticky top-0 bg-white p-1 z-10">
            <TextField
              label="Search"
              variant="outlined"
              size="small"
              fullWidth
              value={columnSearchValue[filterColumn]}
              onChange={(event) => handleColumnSearchValue(event, filterColumn)}
              data-testid="filter-search-input"
            />
          </div>
          <div style={{ height: 280 }}>
            {isFilterResultLoading ? (
              <div
                className="h-full w-full flex items-center justify-center"
                data-testid="loading-indicator"
              >
                <CircularProgress size={24} />
              </div>
            ) : (
              <AutoSizer>
                {({ height, width }) => (
                  <VirtualizedList
                    width={width}
                    height={height}
                    rowCount={filterResultOfColumn[filterColumn]?.length || 0}
                    rowHeight={36}
                    rowRenderer={RowRenderer}
                    overscanRowCount={5}
                  />
                )}
              </AutoSizer>
            )}
          </div>
          <div className="p-2 flex gap-2 justify-end w-full mt-1">
            {filters[COLUMN_NAME]?.length ? (
              <Button
                onClick={applyFilter}
                size="small"
                sx={{ height: 20 }}
                variant="contained"
                data-testid="apply-filter-button"
              >
                Apply
              </Button>
            ) : null}
            {filterByColumnParams[NOT_ASSIGNED_TAGS_FIELDS[filterColumn]]
              ?.length ? (
              <Button
                onClick={resetFilter}
                size="small"
                sx={{ height: 20 }}
                variant="outlined"
                data-testid="reset-filter-button"
              >
                Reset
              </Button>
            ) : null}
          </div>
        </Popover>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[25, 50, 100]}
        component="div"
        className="h-[60px]"
        count={notAssignedTagsCount}
        rowsPerPage={assignTagsPerPage}
        page={assignTagsCurrentPage || 0}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        showFirstButton
        showLastButton
        data-testid="table-pagination"
      />
    </Paper>
  );
};
