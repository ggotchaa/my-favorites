import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";

import { Button, Chip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

import { CustomButton } from "./CustomButton";
import { FilterColumnData } from "./FilterColumnData";

import { FILTER_SOURCE } from "../../constants/global";
import { getMMFilteredColumns, getJDEFilteredColumns } from "../../utils";

const DEFAULT_FILTER_ID = 1;
const DEFAULT_PADDING = 110; // total height = appbar + filter header

export const TableFilter = ({
  tableFilter,
  filterParams,
  setTableFilter,
  setFilterParams,
  columns,
  isFilterReset,
  getElementsByColumn,
  tableColumns,
  source,
  setCurrentPage,
  frequentlyUsedFilters,
  setFrequentlyUsedFilters,
  updateFrequentlyUsedFilters,
}) => {
  const dispatch = useDispatch();
  const container = useRef(null);
  const main = useRef(null);
  const [height, setHeight] = useState(null);
  const [filters, setFilters] = useState(tableFilter);

  useEffect(() => {
    setFilters(tableFilter);
  }, [tableFilter]);

  useEffect(() => {
    const containerDiv = container.current;
    if (containerDiv) {
      setHeight(containerDiv.clientHeight - DEFAULT_PADDING);
    }
  }, []);

  useEffect(() => {
    main.current?.lastElementChild?.scrollIntoView({ behavior: "smooth" });
  }, [filters]);

  const handleDeleteFilter = (id) => {
    const updated = { ...filters };
    delete updated[id];
    setFilters(updated);
    dispatch(setTableFilter(updated));
  };

  const handleAddNewFilter = () => {
    const newId = +Object.keys(filters).at(-1) + DEFAULT_FILTER_ID;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [newId]: {
        column: {
          label: null,
          value: null,
        },
        operator: null,
        value: null,
      },
    }));
    dispatch(
      setTableFilter({
        ...tableFilter,
        [newId]: {
          column: {
            label: null,
            value: null,
          },
          operator: null,
          value: null,
        },
      })
    );
  };

  const getTableFilteredColums = (tableFilter) => {
    if (source === FILTER_SOURCE.JDE_DATA) {
      return getJDEFilteredColumns(tableFilter, filterParams);
    } else if (source === FILTER_SOURCE.MATERIALS_MANAGEMENT) {
      return getMMFilteredColumns(tableFilter, filterParams);
    }
  };

  const validation = () => {
    const allfilterValues = Object.values(tableFilter);
    const isValid = allfilterValues.every((filter) => {
      return Object.values(filter).every((value) => {
        const THREE_FIELDS = 3;
        const filterValuesPerRow = Object.values(filter).length;
        return value !== null && filterValuesPerRow === THREE_FIELDS;
      });
    });

    return isValid;
  };

  const handleSearch = () => {
    if (tableFilter) {
      const isValid = validation();

      if (!isValid) {
        toast.info("Empty fields not allowed");
        return;
      }

      const tableFilteredColums = getTableFilteredColums(
        Object.values(tableFilter)
      );
      dispatch(
        setFilterParams({
          ...filterParams,
          FilteredColums: tableFilteredColums || undefined,
        })
      );
      dispatch(setCurrentPage(0));
      dispatch(setFrequentlyUsedFilters(Object.values(tableFilter)));
    }
  };

  const handleRemoveFrequentlyUsedFilter = (filter) => {
    dispatch(updateFrequentlyUsedFilters(filter));
  };

  const handleFrequentlyUsedFilterClick = (filter) => {
    const tableFilteredColums = getTableFilteredColums([filter]);
    dispatch(
      setFilterParams({
        ...filterParams,
        FilteredColums: tableFilteredColums || undefined,
      })
    );
    dispatch(setCurrentPage(0));
  };

  return (
    <div
      ref={container}
      className="min-h-[calc(100vh-200px)] max-h-[calc(100vh-200px)] gap-4"
      data-testid="table-filter-container"
    >
      <div
        className="overflow-hidden overflow-y-auto no-scrollbar"
        style={{ maxHeight: height }}
        ref={main}
        data-testid="table-filter-main"
      >
        {Object.entries(filters).map(([id, item]) => (
          <FilterColumnData
            key={id}
            id={id}
            item={item}
            handleDeleteFilter={handleDeleteFilter}
            columns={columns}
            tableFilter={tableFilter}
            setTableFilter={setTableFilter}
            isFilterReset={isFilterReset}
            getElementsByColumn={getElementsByColumn}
            tableColumns={tableColumns}
            source={source}
            handleSearch={handleSearch}
          />
        ))}
        {frequentlyUsedFilters.length ? (
          <div className="flex flex-col justify-start items-start gap-2 mt-6 mb-4">
            <span className="text-xs font-roboto font-normal leading-4 text-black/[0.54]">
              Frequently used filters:
            </span>
            {frequentlyUsedFilters.map((filter) => (
              <Chip
                key={`${filter.column.label} ${filter.operator} ${filter.value}`}
                label={`${filter.column.label} ${filter.operator} ${filter.value}`}
                color="primary"
                variant="outlined"
                onDelete={() => handleRemoveFrequentlyUsedFilter(filter)}
                onClick={() => handleFrequentlyUsedFilterClick(filter)}
              />
            ))}
          </div>
        ) : null}
      </div>
      <div className="flex gap-4 flex-col w-full justify-center">
        <Button
          sx={{ fontSize: "14px" }}
          startIcon={<AddIcon />}
          onClick={handleAddNewFilter}
          data-testid="add-new-filter-btn"
        >
          Add new filter
        </Button>
        <CustomButton
          data-testid="filter-search-btn"
          size="large"
          variant="contained"
          onClick={handleSearch}
        >
          Search
        </CustomButton>
      </div>
    </div>
  );
};
