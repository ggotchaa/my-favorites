import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { TextField, Toolbar } from "@mui/material";

import {
  setFilterParams,
  getFilterParams,
  setCurrentPage,
} from "../../store/slices/materials-management/filterSlice";

import { CustomButton } from "../common/CustomButton";
import { ENTER_KEY } from "../../constants/global";

export const MaterialsManagementHeader = ({ currentPage, rowsPerPage }) => {
  const dispatch = useDispatch();
  const filterParams = useSelector(getFilterParams);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setSearch(filterParams.Search ? filterParams.Search : "");
  }, [filterParams]);

  const getFilteredColumns = () => {
    let searchCondition = "";
    if (search) {
      searchCondition = `stockCode{,}Contains{,}${search}`;
      if (filterParams.FilteredColums) {
        return Array.from(
          new Set(
            (filterParams.FilteredColums + "{;}" + searchCondition).split("{;}")
          )
        ).join("{;}");
      }
      return searchCondition;
    }
    return undefined;
  };

  const handleSearchClick = () => {
    dispatch(
      setFilterParams({
        ...filterParams,
        StartFrom: currentPage || 0,
        FetchRecord: rowsPerPage || 25,
        Search: search || undefined,
        FilteredColums: getFilteredColumns() || filterParams.FilteredColums,
      })
    );
    dispatch(setCurrentPage(0));
  };

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
  };

  return (
    <Toolbar data-testid="materials-management-toolbar" className="!px-4">
      <div
        className="flex items-center py-[4px] justify-between w-full gap-[16px]"
        data-testid="materials-management-search-container"
      >
        <TextField
          data-testid="search-textfield"
          sx={{ width: "100%", minWidth: "300px" }}
          label="Search stock code"
          variant="outlined"
          value={search}
          size="small"
          onChange={handleSearchChange}
          inputProps={{
            "data-testid": "search-input",
            onKeyDown: (event) =>
              event.code === ENTER_KEY ? handleSearchClick() : null,
          }}
        />
        <CustomButton
          data-testid="search-btn"
          sx={{ minWidth: "96px", height: "40px" }}
          onClick={handleSearchClick}
        >
          Search
        </CustomButton>
      </div>
    </Toolbar>
  );
};
