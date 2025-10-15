import { useState } from "react";
import { Button, CircularProgress, TextField } from "@mui/material";

import { ENTER_KEY } from "../../constants/global";

import {
  getFilterParams,
  setFilterParams,
  resetAllFilters,
  isAnyFilterApplied,
} from "../../store/slices/enrichment-management/notAssignedTagsSlice";
import { useDispatch, useSelector } from "react-redux";

export const EnrichmentTagsSearchHeader = ({
  isLoading,
  search,
  setSearch,
}) => {
  const dispatch = useDispatch();
  const filterParams = useSelector(getFilterParams);
  const isFiltersApplied = useSelector(isAnyFilterApplied);

  const handleSearchBtnClick = () => {
    dispatch(
      setFilterParams({
        ...filterParams,
        searchEquipment: search,
      })
    );
  };

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
  };

  const handleClearAllFilters = () => {
    dispatch(resetAllFilters());
    setSearch("");
  };

  return (
    <>
      <TextField
        label="Search equipment"
        variant="outlined"
        className="w-full"
        value={search}
        onChange={handleSearchChange}
        inputProps={{
          "data-testid": "tag-search-input",
          onKeyDown: (event) =>
            event.code === ENTER_KEY ? handleSearchBtnClick() : null,
        }}
        size="small"
      />
      {isFiltersApplied && (
        <Button
          sx={{ width: "130px", height: "40px", padding: "16px 0" }}
          variant="contained"
          onClick={handleClearAllFilters}
          data-testid="tag-clear-btn"
        >
          Clear all
        </Button>
      )}
      <Button
        sx={{ width: "96px", height: "40px", padding: "16px 20px" }}
        variant="contained"
        onClick={handleSearchBtnClick}
        data-testid="tag-search-btn"
      >
        {isLoading ? <CircularProgress size={20} color="info" /> : "Search"}
      </Button>
    </>
  );
};
