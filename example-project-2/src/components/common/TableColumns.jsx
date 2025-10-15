import { useDispatch } from "react-redux";
import { FormControlLabel, Switch } from "@mui/material";

export const TableColumns = ({ columns, toggleColumn }) => {
  const dispatch = useDispatch();

  const handleToggle = (id) => {
    dispatch(toggleColumn(id));
  };

  return (
    <div className="pl-2" key={columns} data-testid="table-columns">
      <ul>
        {columns
          .filter((column) => column.isVisible)
          .map((item) => (
            <li key={item.id} className="flex items-center mb-6">
              <FormControlLabel
                control={
                  <Switch
                    value={item.label}
                    size="small"
                    disabled={item.isDisabled}
                    onClick={() => handleToggle(item.id)}
                    checked={item.isChecked}
                    data-testid={`toggle-${item.label}`}
                  />
                }
                label={item.label}
              />
            </li>
          ))}
      </ul>
    </div>
  );
};
