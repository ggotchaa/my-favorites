import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Autocomplete, TextField, Toolbar } from "@mui/material";

// import ListIcon from "@mui/icons-material/List";

import {
  setFilterParams,
  getFilterParams,
  setCurrentPage,
} from "../../store/slices/mes-data/filterSlice";
import { useMesData } from "../../hooks/useMesData";

// import { CategoryButton } from "../common/CategoryButton";
import { CustomButton } from "../common/CustomButton";
import { ENTER_KEY } from "../../constants/global";
import { unitCodesGrouppedByArea, formatAreaCodes } from "../../utils";

export const MesDataHeader = ({ toggleCategoriesDrawer, loading }) => {
  const dispatch = useDispatch();
  const filterParams = useSelector(getFilterParams);
  const [search, setSearch] = useState("");
  const [area, setArea] = useState({ label: "", value: "" });
  const [unit, setUnit] = useState({ label: "", value: "" });
  const [areaCodes, setAreaCodes] = useState([]);
  const [unitCodes, setUnitCodes] = useState([]);
  const [unitCodesByArea, setUnitCodesByArea] = useState({});
  const [pendingSearch, setPendingSearch] = useState(false);

  const { getAreaAndUnitCodes } = useMesData();

  useEffect(() => {
    let isMounted = true;
    const fetchRows = () => {
      getAreaAndUnitCodes().then((response) => {
        if (isMounted && response) {
          const unitCodesByArea = unitCodesGrouppedByArea(response);
          setUnitCodesByArea(unitCodesByArea);
          const areaCodes = formatAreaCodes(unitCodesByArea);
          setAreaCodes(areaCodes);
        }
      });
    };

    fetchRows();
    return () => {
      isMounted = false;
    };
  }, [getAreaAndUnitCodes]);

  useEffect(() => {
    setSearch(filterParams.Search ? filterParams.Search : "");
    setArea(
      filterParams.AreaCode.label
        ? {
            label: filterParams.AreaCode.label,
            value: filterParams.AreaCode.value,
          }
        : { label: "", value: "" }
    );
    setUnit(
      filterParams.UnitCode.label
        ? {
            label: filterParams.UnitCode.label,
            value: filterParams.UnitCode.value,
          }
        : { label: "", value: "" }
    );
  }, [filterParams]);

  useEffect(() => {
    if (!loading && pendingSearch) {
      handleSearchClick();
      setPendingSearch(false);
    }
  }, [loading, pendingSearch]);

  const handleAreaChange = (_event, option) => {
    if (option) {
      setArea({
        label: option.label,
        value: option.value,
      });
      setUnit({ label: "", value: "" });
      setUnitCodes(unitCodesByArea[option.label].unitCodes);
      dispatch(setCurrentPage(0));
    } else {
      setArea({ label: "", value: "" });
    }
  };

  const handleAreaInputChange = (_event, value) => {
    if (!value) {
      setUnit({ label: "", value: "" });
    }
  };

  const handleUnitChange = (_event, option) => {
    if (option) {
      setUnit({ label: option.label, value: option.value });
      dispatch(setCurrentPage(0));
    } else {
      setUnit({ label: "", value: "" });
    }
  };

  const getFilteredColumns = () => {
    let searchCondition = undefined;
    if (search) {
      searchCondition = [
        {
          ColumnName: "equipmenT_TAG",
          Operator: "Contains",
          Value: search,
        },
      ];
      if (filterParams.FilteredColums) {
        const filteredColumsWithoutSearch = filterParams.FilteredColums.filter(
          (filter) =>
            !(
              filter.ColumnName === "equipmenT_TAG" &&
              filter.Operator === "Contains"
            )
        );
        const allFilteredColums = [
          ...filteredColumsWithoutSearch,
          ...searchCondition,
        ];
        return Array.from(
          new Set(allFilteredColums.map((item) => JSON.stringify(item)))
        ).map((item) => JSON.parse(item));
      }
      return searchCondition;
    }
    if (filterParams.FilteredColums) {
      return filterParams.FilteredColums.filter(
        (filter) =>
          !(
            filter.ColumnName === "equipmenT_TAG" &&
            filter.Operator === "Contains"
          )
      );
    }
    return undefined;
  };

  const handleSearchClick = () => {
    if (loading) {
      setPendingSearch(true);
      return;
    }

    dispatch(
      setFilterParams({
        ...filterParams,
        Search: search ?? undefined,
        AreaCode: area?.value
          ? { label: area.label, value: area.value }
          : { label: "", value: "" },
        UnitCode: unit?.value
          ? { label: unit.label, value: unit.value }
          : { label: "", value: "" },
        FilteredColums: getFilteredColumns() ?? filterParams.FilteredColums,
      })
    );
    dispatch(setCurrentPage(0));
  };

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
  };

  return (
    <Toolbar data-testid="header-toolbar" className="!px-4">
      <div
        data-testid="header-container"
        className="flex items-center py-[4px] justify-between w-full gap-[16px]"
      >
        <TextField
          sx={{ width: "100%", minWidth: "200px" }}
          label="Search equipment tags"
          size="small"
          variant="outlined"
          value={search}
          onChange={handleSearchChange}
          inputProps={{
            "data-testid": "search-input",
            onKeyDown: (event) =>
              event.code === ENTER_KEY ? handleSearchClick() : null,
          }}
        />
        <Autocomplete
          disablePortal
          options={areaCodes || []}
          value={area?.label ?? null}
          onChange={handleAreaChange}
          noOptionsText="No area codes"
          onInputChange={handleAreaInputChange}
          sx={{ minWidth: "180px" }}
          size="small"
          renderInput={(params) => (
            <TextField
              label="Area code"
              {...params}
              inputProps={{ ...params.inputProps, "data-testid": "areacode" }}
            />
          )}
        />
        <Autocomplete
          disabled={!area?.label}
          disablePortal
          options={unitCodes || []}
          value={unit?.label ?? null}
          onChange={handleUnitChange}
          noOptionsText="No unit codes"
          size="small"
          sx={{ minWidth: "350px" }}
          renderInput={(params) => (
            <TextField
              label="Unit code"
              {...params}
              inputProps={{ ...params.inputProps, "data-testid": "unitcode" }}
            />
          )}
        />
        {/* TODO: hided temporarily */}
        {/* <CategoryButton
          onClick={toggleCategoriesDrawer(true)}
          sx={{ minWidth: "180px" }}
          startIcon={
            <ListIcon sx={{ width: "24px", height: "24px", color: "gray" }} />
          }
          data-testid="category"
        >
          Category
        </CategoryButton> */}
        <CustomButton
          sx={{ minWidth: "96px", height: "40px" }}
          onClick={handleSearchClick}
          data-testid="search-btn"
        >
          Search
        </CustomButton>
      </div>
    </Toolbar>
  );
};
