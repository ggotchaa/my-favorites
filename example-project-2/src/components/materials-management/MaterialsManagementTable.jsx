import { useSelector, useDispatch } from "react-redux";
import {
  Box,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
} from "@mui/material";

import {
  getFilterParams,
  setFilterParams,
  setCurrentPage,
} from "../../store/slices/materials-management/filterSlice";

import { MaterialsManagementHeader } from "./MaterialsManagementHeader";
import { NoDataFoundInTable } from "../common/NoDataFoundInTable";
import { TableLoader } from "../common/TableLoader";

import { TABLE_COLUMN_LABELS } from "../../constants/materials-management";

export const MaterialsManagementTable = ({
  rows,
  loading,
  totalRows,
  currentPage,
  rowsPerPage,
  setRowsPerPage,
  columns,
}) => {
  const dispatch = useDispatch();

  const filterParams = useSelector(getFilterParams);

  const handlePageChange = (_event, page) => {
    dispatch(setFilterParams({ ...filterParams, StartFrom: page }));
    dispatch(setCurrentPage(page));
  };

  const handleChangeRowsPerPage = (event) => {
    const rowsPerPage = parseInt(event.target.value, 10);
    dispatch(setCurrentPage(0));
    setRowsPerPage(rowsPerPage);
    dispatch(setFilterParams({ ...filterParams, FetchRecord: rowsPerPage }));
    localStorage.setItem("materialsRowsPerPage", rowsPerPage);
  };

  const displayTableHeader = (col) => {
    if (col.id === "manufacturerAndPartNumber") {
      return (
        <TableCell
          colSpan={2}
          key={col.id}
          align={col.align}
          width={col.width}
          sx={{ display: "grid", flexGrow: 1, alignItems: "center" }}
        >
          {col.label}
        </TableCell>
      );
    } else {
      return (
        <TableCell
          key={col.id}
          align={col.align}
          width={col.width}
          sx={{ display: "grid", flexGrow: 1, alignItems: "center" }}
        >
          {col.label}
        </TableCell>
      );
    }
  };

  const displayTableCell = (col, row) => {
    switch (col.id) {
      case "stockCode":
        return (
          <TableCell
            key={col.id}
            align={col.align}
            width={col.width}
            sx={{ display: "grid", flexGrow: 1, alignItems: "center" }}
          >
            <span className="text-black/[.54]">{row[col.id]}</span>
          </TableCell>
        );
      case "manufacturerAndPartNumber":
        return (
          <TableCell
            colSpan={2}
            key={col.id}
            align={col.align}
            width={col.width}
            sx={{ display: "grid", flexGrow: 1, alignItems: "center" }}
          >
            <div className="flex flex-col">
              <span>{row.manufacturer}</span>
              <span className="text-black/[.54]">
                {row.manufacturerPartNumber}
              </span>
            </div>
          </TableCell>
        );
      default:
        return (
          <TableCell
            key={col.id}
            align={col.align}
            width={col.width}
            sx={{ display: "grid", flexGrow: 1, alignItems: "center" }}
          >
            {row[col.id]}
          </TableCell>
        );
    }
  };

  const handleRemoveFilter = (value = "") => {
    let searchIncluded = "";
    if (filterParams.Search) {
      const search = `stockCode{,}Contains{,}${filterParams.Search}`;
      searchIncluded = filterParams.FilteredColums.split("{;}").find(
        (filterValue) => filterValue === search
      );
    }
    const filteredColums = filterParams.FilteredColums.split("{;}")
      .filter((filterValue) => filterValue !== value)
      .join("{;}");
    dispatch(
      setFilterParams({
        ...filterParams,
        Search: searchIncluded ? "" : filterParams.Search,
        FilteredColums: filteredColums,
      })
    );
    dispatch(setCurrentPage(0));
  };

  const parseFilteredColums = (string) => {
    const filterChunks = string.split("{;}").filter(Boolean);
    const filterChips = filterChunks.map((filterChunk) => {
      const [field, condition, ...rest] = filterChunk.split("{,}");
      const value = rest.join("{,}");
      return {
        label: `${TABLE_COLUMN_LABELS[field]}  ${condition}  ${value}`,
        filterValue: `${field}{,}${condition}{,}${value}`,
      };
    });
    return filterChips;
  };

  const displayFilterByColumnLabel = () => {
    if (filterParams.FilteredColums) {
      const chips = parseFilteredColums(filterParams.FilteredColums);
      return chips.map(({ label, filterValue }) => (
        <Chip
          data-testid={`filter-chip-${filterValue.split("{,}")[0]}`}
          key={label}
          label={label}
          color="primary"
          variant="outlined"
          onDelete={() => handleRemoveFilter(filterValue)}
        />
      ));
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Paper
        data-testid="materials-table-container"
        sx={{ width: "100%", mb: 2, p: 0 }}
        elevation={0}
        variant="outlined"
      >
        <MaterialsManagementHeader
          currentPage={currentPage}
          rowsPerPage={rowsPerPage}
        />
        <Box
          data-testid="filter-chips-container"
          className="flex items-center gap-4 pl-[24px] w-full h-auto flex-wrap"
        >
          {displayFilterByColumnLabel()}
        </Box>
        <TableContainer>
          <Table
            data-testid="materials-table"
            sx={{ minWidth: 750 }}
            aria-labelledby="tableTitle"
            size="small"
          >
            <TableHead>
              <TableRow sx={{ display: "flex" }}>
                {columns.filter((col) => col.isChecked).map(displayTableHeader)}
              </TableRow>
            </TableHead>
            {loading ? (
              <TableLoader colSpan={columns.length + 1} />
            ) : (
              <>
                {!rows.length && (
                  <NoDataFoundInTable
                    label="No data found"
                    colSpan={columns.length + 1}
                  />
                )}
                <TableBody>
                  {rows.map((row) => {
                    return (
                      <TableRow
                        tabIndex={-1}
                        key={row.materialsManagementPk}
                        sx={{ display: "flex" }}
                      >
                        {columns
                          .filter((col) => col.isChecked)
                          .map((col) => displayTableCell(col, row))}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </>
            )}
          </Table>
        </TableContainer>
        <TablePagination
          data-testid="materials-table-pagination"
          rowsPerPageOptions={[25, 50, 100]}
          component="div"
          count={totalRows}
          rowsPerPage={rowsPerPage}
          page={currentPage || 0}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleChangeRowsPerPage}
          showFirstButton
          showLastButton
        />
      </Paper>
    </Box>
  );
};
