import { Fragment } from "react";
import { Checkbox, TableCell, TableRow } from "@mui/material";

import { ASSIGN_TAGS_TABLE_COLUMNS } from "../../constants/walkdown-management";

export const AssignTagTableRow = ({
  row,
  selectedTags,
  handleSelectTag,
  loading,
}) => {
  return (
    <TableRow tabIndex={-1} data-testid="assign-tag-table-row">
      {ASSIGN_TAGS_TABLE_COLUMNS.map((col) => {
        return (
          <Fragment key={col.id}>
            {col.id === "checkbox" ? (
              <TableCell width={col.width} onClick={() => {}}>
                <Checkbox
                  checked={selectedTags.includes(row.value)}
                  onChange={() => handleSelectTag(row.value)}
                  disabled={loading}
                  data-testid="assign-tag-checkbox"
                />
              </TableCell>
            ) : (
              <TableCell width={col.width}>
                {col.id === "label" ? (
                  <span
                    className="text-sm font-roboto font-bold leading-4"
                    data-testid="tag-label"
                  >
                    {row[col.id]}
                  </span>
                ) : (
                  row[col.id]
                )}
              </TableCell>
            )}
          </Fragment>
        );
      })}
    </TableRow>
  );
};
