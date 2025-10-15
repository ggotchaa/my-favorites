import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Autocomplete, IconButton, TextField } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

import { VirtualizedAutocomplete } from "./VirtualizedAutocomplete";

import { getFilterColumns } from "../../utils";
import { ENTER_KEY, FILTER_SOURCE } from "../../constants/global";
import { OPERATOR as WW_OPERATOR } from "../../constants/jde-data";
import { OPERATOR as MM_OPERATOR } from "../../constants/materials-management";

export const FilterColumnData = ({
  id,
  item,
  handleDeleteFilter,
  columns,
  tableFilter,
  setTableFilter,
  isFilterReset,
  getElementsByColumn,
  tableColumns,
  source,
  handleSearch,
}) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [valueOptions, setValueOptions] = useState([]);

  const [column, setColumn] = useState(item.column || null);
  const [operator, setOperator] = useState(item.operator || null);
  const [value, setValue] = useState(item.value || null);

  useEffect(() => {
    let isMounted = true;

    if (column?.value && source === FILTER_SOURCE.JDE_DATA) {
      const fetchData = () => {
        setLoading(true);
        getElementsByColumn(column.value)
          .then((response) => {
            if (isMounted && response) {
              const uniqueOptions = response.reduce((acc, { value }) => {
                const trimmedValue =
                  typeof value === "string" ? value.trim() : value;
                if ([null, "", " ", "."].includes(trimmedValue)) {
                  if (!acc.some((item) => item.value === "Empty")) {
                    acc.push({ value: "Empty", label: "Empty" });
                  }
                } else {
                  acc.push({ value: value, label: value });
                }
                return acc;
              }, []);

              setValueOptions(uniqueOptions);
              setLoading(false);
            }
          })
          .catch(() => {
            setLoading(false);
          });
      };

      fetchData();
    } else {
      setValueOptions([]);
    }

    return () => {
      isMounted = false;
    };
  }, [column, getElementsByColumn, source]);

  useEffect(() => {
    setColumn(item.column);
    setOperator(item.operator);
    setValue(item.value);
  }, [item]);

  const handleColumnChange = (_event, option) => {
    setValue(null);
    setValueOptions([]);
    if (option) {
      setColumn({ label: option.label, value: option.id });
      dispatch(
        setTableFilter({
          ...tableFilter,
          [id]: {
            column: {
              value: option.id,
              label: option.label,
            },
            operator: null,
            value: null,
          },
        })
      );
      setOperator(null);
      setValue(null);
    } else {
      dispatch(
        setTableFilter({
          ...tableFilter,
          [id]: {
            column: {
              value: null,
              label: null,
            },
            operator: null,
            value: null,
          },
        })
      );
      setColumn(null);
      setOperator(null);
      setValue(null);
    }
  };

  const handleOperatorChange = (_event, option) => {
    if (option) {
      dispatch(
        setTableFilter({
          ...tableFilter,
          [id]: {
            ...tableFilter[id],
            operator: option.label,
          },
        })
      );
    } else {
      dispatch(
        setTableFilter({
          ...tableFilter,
          [id]: {
            ...tableFilter[id],
            operator: null,
          },
        })
      );
      setOperator(null);
    }
  };

  const handleValueChange = (_event, option) => {
    if (option) {
      dispatch(
        setTableFilter({
          ...tableFilter,
          [id]: {
            ...tableFilter[id],
            value: typeof option === "string" ? option : option.value,
          },
        })
      );
    } else {
      dispatch(
        setTableFilter({
          ...tableFilter,
          [id]: {
            ...tableFilter[id],
            value: null,
          },
        })
      );
    }
  };

  const handleInputValueChange = (_event, value) => {
    if (value) {
      dispatch(
        setTableFilter({
          ...tableFilter,
          [id]: {
            ...tableFilter[id],
            value,
          },
        })
      );
    } else {
      dispatch(
        setTableFilter({
          ...tableFilter,
          [id]: {
            ...tableFilter[id],
            value: null,
          },
        })
      );
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full mb-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-roboto font-normal leading-4 text-black/[0.54]">
          Filter {id}
        </span>
        {id !== "1" && (
          <IconButton
            data-testid="delete-filter-btn"
            onClick={() => handleDeleteFilter(id)}
          >
            <DeleteIcon sx={{ fontSize: "20px", color: "#F44336" }} />
          </IconButton>
        )}
      </div>
      <Autocomplete
        size="small"
        disablePortal
        options={getFilterColumns(columns, tableColumns)}
        value={column?.label ? column.label : null}
        renderInput={(params) => (
          <TextField
            label="Column"
            {...params}
            inputProps={{
              ...params.inputProps,
              "data-testid": `column-input-${id}`,
            }}
          />
        )}
        onChange={handleColumnChange}
      />
      <Autocomplete
        size="small"
        disablePortal
        value={operator ? operator : null}
        options={source === FILTER_SOURCE.JDE_DATA ? WW_OPERATOR : MM_OPERATOR}
        renderInput={(params) => (
          <TextField
            label="Operator"
            {...params}
            inputProps={{
              ...params.inputProps,
              "data-testid": `operator-input-${id}`,
            }}
          />
        )}
        onChange={handleOperatorChange}
      />
      <VirtualizedAutocomplete
        filterId={id}
        size="small"
        disablePortal
        width={300}
        value={value ? value : null}
        options={valueOptions}
        label="Value"
        renderInput={(params) => <TextField {...params} />}
        loading={loading}
        loadingText={loading ? "Fetching data..." : ""}
        onChange={handleValueChange}
        onInputChange={handleInputValueChange}
        isReset={isFilterReset || column?.label}
        freeSolo
        disabled={!column?.value}
      />
    </div>
  );
};
