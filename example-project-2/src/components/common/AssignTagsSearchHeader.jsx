import { useState } from "react";
import { Button, CircularProgress, TextField } from "@mui/material";

import { ENTER_KEY } from "../../constants/global";

import {
  getFilterParams,
  setFilterParams,
} from "../../store/slices/walkdown-management/notAssignedTagsSlice";
import { useDispatch, useSelector } from "react-redux";

export const AssignTagsSearchHeader = ({ isLoading }) => {
  const dispatch = useDispatch();
  const filterParams = useSelector(getFilterParams);
  const [search, setSearch] = useState("");

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

  return (
    <>
      <TextField
        label="Search equipment"
        variant="outlined"
        className="w-full"
        onChange={handleSearchChange}
        inputProps={{
          "data-testid": "tag-search-input",
          onKeyDown: (event) =>
            event.code === ENTER_KEY ? handleSearchBtnClick() : null,
        }}
        size="small"
      />
      <Button
        sx={{ width: "96px", height: "40px", padding: "16px 20px" }}
        variant="contained"
        onClick={handleSearchBtnClick}
        data-testid="tag-search-btn"
      >
        {isLoading ? (
          <CircularProgress
            data-testid="loading-indicator"
            size={20}
            color="info"
          />
        ) : (
          "Search"
        )}
      </Button>
    </>
  );
};
