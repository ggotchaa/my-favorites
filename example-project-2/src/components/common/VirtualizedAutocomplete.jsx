import { Autocomplete, TextField } from "@mui/material";
import { createFilterOptions } from "@mui/material/Autocomplete";

import { ListboxComponent } from "./ListBoxComponent";

const filterOptions = createFilterOptions({
  matchFrom: "any",
});

export const VirtualizedAutocomplete = ({
  label,
  options,
  isReset,
  value,
  filterId,
  freeSolo,
  width,
  loading,
  disabled,
  ...rest
}) => {
  return (
    <Autocomplete
      {...rest}
      filterOptions={filterOptions}
      disableListWrap
      value={isReset ? null : value}
      ListboxComponent={ListboxComponent}
      ListboxProps={{ width }}
      options={options}
      getOptionLabel={(option) =>
        typeof option === "string" ? option : option.label
      }
      noOptionsText="No options"
      renderInput={(params) => (
        <TextField
          {...params}
          inputProps={{
            ...params.inputProps,
            "data-testid": `value-input-${filterId}`,
          }}
          variant="outlined"
          label={label}
          fullWidth
        />
      )}
      loading={loading}
      loadingText={loading ? "Fetching data..." : ""}
      freeSolo={freeSolo}
      key={isReset}
      disabled={disabled}
    />
  );
};
